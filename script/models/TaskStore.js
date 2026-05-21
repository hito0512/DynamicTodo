import Task from './Task.js';
import SiyuanApi from '../services/SiyuanApi.js';
import { STATUS_TEXT, TASK_STATUS } from '../config/constants.js';

/**
 * 任务数据存储层 — 块属性存储方案
 *
 * 所有任务数据序列化为 JSON，存储在挂件块的 custom-tasks 属性中。
 * 状态文本映射存储在挂件块的 custom-status-texts 属性中。
 */
class TaskStore {
  static DATA_VERSION = '1.0.0';

  /**
   * @param {string} widgetBlockId 挂件块ID（存储所有数据）
   */
  constructor(widgetBlockId) {
    this.widgetBlockId = widgetBlockId;
    this.api = SiyuanApi.getInstance();
    this.tasks = [];
    this.statusTexts = { ...STATUS_TEXT };
  }

  /**
   * 加载任务数据
   * 自动兼容三种数据格式（按优先级）：
   *   1. custom-tasks（当前格式）
   *   2. v0.3.0 子块存储（custom-data-doc-id → 子块）
   *   3. 旧格式（custom-todo/doing/done/unfinish）
   * 首次加载非当前格式数据时静默转换为 custom-tasks
   * @returns {Promise<Task[]>}
   */
  async load() {
    try {
      const widgetAttrs = await this.api.getBlockAttrs(this.widgetBlockId);

      // 加载自定义状态名称
      if (widgetAttrs['custom-status-texts']) {
        try {
          const customStatusTexts = JSON.parse(widgetAttrs['custom-status-texts']);
          this.statusTexts = { ...STATUS_TEXT, ...customStatusTexts };
        } catch (e) {
          console.error('解析自定义状态名称失败:', e);
        }
      }

      // 1. v0.3.0 子块存储（权威数据源）
      //    必须优先于 custom-tasks，因为 v0.3.0 用户的 custom-tasks 可能是迁移前的过期数据
      const dataDocId = widgetAttrs['custom-data-doc-id'];
      if (dataDocId) {
        try {
          const converted = await this._migrateFromBlocks(dataDocId);
          if (converted && converted.length > 0) {
            this.tasks = converted;
            await this._save();
            // 转换完成后清理 data-doc-id，后续加载直接走 custom-tasks
            await this.api.setBlockAttrs(this.widgetBlockId, {
              'custom-data-doc-id': '',
            });
            return this.tasks;
          }
        } catch (e) {
          console.warn('从子块转换数据失败:', e);
        }
      }

      // 2. 当前格式 custom-tasks
      if (widgetAttrs['custom-tasks']) {
        try {
          const data = JSON.parse(widgetAttrs['custom-tasks']);
          if (data && Array.isArray(data.tasks)) {
            this.tasks = data.tasks.map(taskData => new Task(taskData));
          }
        } catch (e) {
          console.error('解析任务数据失败:', e);
        }
        return this.tasks;
      }

      // 3. 旧格式 custom-todo/doing/done/unfinish
      const oldFormatKeys = { todo: 'custom-todo', doing: 'custom-doing', done: 'custom-done', unfinish: 'custom-unfinish' };
      let hasOldData = false;
      const convertedTasks = [];

      for (const [status, key] of Object.entries(oldFormatKeys)) {
        if (widgetAttrs[key]) {
          try {
            const oldTasks = JSON.parse(widgetAttrs[key]);
            if (Array.isArray(oldTasks) && oldTasks.length > 0) {
              hasOldData = true;
              oldTasks.forEach(oldTask => {
                convertedTasks.push(Task.fromOldFormat(oldTask, status, convertedTasks.length));
              });
            }
          } catch (e) {
            console.error(`解析旧格式 ${key} 失败:`, e);
          }
        }
      }

      if (hasOldData && convertedTasks.length > 0) {
        this.tasks = convertedTasks;
        await this._save();
      }

      return this.tasks;
    } catch (error) {
      console.error('加载任务数据失败:', error);
      return [];
    }
  }

  /**
   * 从 v0.3.0 子块存储读取任务，转换为 Task 对象数组
   * @param {string} dataDocId 数据文档 ID
   * @returns {Promise<Task[]|null>}
   */
  async _migrateFromBlocks(dataDocId) {
    const children = await this.api.getBlockChildren(dataDocId, 'p');
    if (!children || children.length === 0) return null;

    const tasks = [];
    for (const child of children) {
      try {
        const attrs = await this.api.getBlockAttrs(child.id);
        if (!attrs['custom-task-id']) continue;

        tasks.push(new Task({
          id: attrs['custom-task-id'],
          title: child.content || attrs['custom-title'] || '',
          description: attrs['custom-description'] || '',
          status: attrs['custom-status'] || 'todo',
          createdAt: parseInt(attrs['custom-created-at']) || Date.now(),
          updatedAt: parseInt(attrs['custom-updated-at']) || Date.now(),
          order: parseInt(attrs['custom-order']) || 0,
          startDate: attrs['custom-start-date'] ? parseInt(attrs['custom-start-date']) : null,
          endDate: attrs['custom-end-date'] ? parseInt(attrs['custom-end-date']) : null,
          archived: attrs['custom-archived'] === 'true',
          tags: attrs['custom-tags'] ? JSON.parse(attrs['custom-tags']) : [],
        }));
      } catch (e) {
        console.warn(`跳过子块 ${child.id}:`, e);
      }
    }

    return tasks.length > 0 ? tasks : null;
  }

  /**
   * 保存所有任务到挂件块 custom-tasks 属性
   */
  async _save() {
    const data = {
      version: TaskStore.DATA_VERSION,
      tasks: this.tasks.map(t => t.toJSON()),
      updatedAt: Date.now(),
    };
    await this.api.setBlockAttrs(this.widgetBlockId, {
      'custom-tasks': JSON.stringify(data),
    });
  }

  /**
   * 添加新任务
   * @param {object} taskData
   * @returns {Promise<Task>}
   */
  async addTask(taskData) {
    const task = new Task(taskData);
    task.order = this.tasks.length > 0
      ? Math.max(...this.tasks.map(t => t.order)) + 1
      : 0;

    this.tasks.push(task);
    await this._save();
    return task;
  }

  /**
   * 更新任务
   * @param {string} taskId
   * @param {object} updateData
   * @returns {Promise<Task|null>}
   */
  async updateTask(taskId, updateData) {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return null;

    this.tasks[taskIndex].update(updateData);
    await this._save();

    return this.tasks[taskIndex];
  }

  /**
   * 删除任务
   * @param {string} taskId
   * @returns {Promise<boolean>}
   */
  async deleteTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return false;

    this.tasks = this.tasks.filter(t => t.id !== taskId);
    await this._save();
    return true;
  }

  /**
   * 更新任务排序和状态（拖拽后）
   * @param {string} taskId 拖拽的任务ID
   * @param {string} newStatus 新状态
   * @param {string[]} taskIds 列中所有任务ID的新顺序
   * @returns {Promise<boolean>}
   */
  async updateTaskOrder(taskId, newStatus, taskIds) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return false;

    task.status = newStatus;

    taskIds.forEach((id, index) => {
      const t = this.tasks.find(t => t.id === id);
      if (t) {
        t.order = index;
      }
    });

    await this._save();
    return true;
  }

  /**
   * 按状态获取任务列表
   * @param {string} status
   * @returns {Task[]}
   */
  getTasksByStatus(status) {
    return this.tasks
      .filter(task => task.status === status && !task.archived)
      .sort((a, b) => a.order - b.order);
  }

  getArchivedTasks() {
    return this.tasks
      .filter(task => task.archived)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async archiveTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task || task.archived) return false;
    task.archived = true;
    task.updatedAt = Date.now();
    await this._save();
    return true;
  }

  async restoreTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task || !task.archived) return false;
    task.archived = false;
    task.updatedAt = Date.now();
    await this._save();
    return true;
  }

  getStatusText(status) {
    return this.statusTexts[status] || STATUS_TEXT[status] || status;
  }

  getStatusTexts() {
    return { ...this.statusTexts };
  }

  async saveStatusText(status, text) {
    if (!Object.values(TASK_STATUS).includes(status)) {
      throw new Error(`无效的状态值: ${status}`);
    }

    this.statusTexts[status] = text;
    await this.api.setBlockAttrs(this.widgetBlockId, {
      'custom-status-texts': JSON.stringify(this.statusTexts),
    });
  }

  exportData() {
    return {
      version: TaskStore.DATA_VERSION,
      exportTime: new Date().toISOString(),
      tasks: this.tasks.map(task => task.toJSON()),
      statusTexts: { ...this.statusTexts },
    };
  }

  async importData(data) {
    try {
      if (!data || !Array.isArray(data.tasks)) return false;

      const validTasks = data.tasks.filter(taskData =>
        taskData.id && taskData.title && Object.values(TASK_STATUS).includes(taskData.status)
      );

      if (validTasks.length === 0) return false;

      const existingByTitle = new Map(this.tasks.map(t => [t.title, t]));

      for (const taskData of validTasks) {
        const existing = existingByTitle.get(taskData.title);
        if (existing) {
          existing.description = taskData.description || '';
          existing.status = taskData.status;
          existing.startDate = taskData.startDate || null;
          existing.endDate = taskData.endDate || null;
          existing.tags = Array.isArray(taskData.tags) ? taskData.tags : [];
          existing.updatedAt = Date.now();
        } else {
          const task = new Task(taskData);
          this.tasks.push(task);
        }
      }

      await this._save();

      if (data.statusTexts && typeof data.statusTexts === 'object') {
        this.statusTexts = { ...STATUS_TEXT, ...data.statusTexts };
        await this.api.setBlockAttrs(this.widgetBlockId, {
          'custom-status-texts': JSON.stringify(this.statusTexts),
        });
      }

      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }
}

export default TaskStore;
