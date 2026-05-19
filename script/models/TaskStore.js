import Task from './Task.js';
import SiyuanApi from '../services/SiyuanApi.js';
import { STATUS_TEXT, TASK_STATUS } from '../config/constants.js';

/**
 * 任务数据存储层
 * 处理数据持久化、版本兼容和自动迁移
 */
class TaskStore {
  static DATA_VERSION = '1.0.0';
  static OLD_ATTR_KEYS = {
    'custom-unfinish': 'unfinish',
    'custom-doing': 'doing',
    'custom-done': 'done',
    'custom-todo': 'todo',
  };

  /**
   * 构造函数
   * @param {string} blockId 挂件块ID
   */
  constructor(blockId) {
    this.blockId = blockId;
    this.api = SiyuanApi.getInstance();
    this.tasks = [];
    this.isMigrated = false;
    // 状态文本映射，优先使用自定义，否则用默认
    this.statusTexts = { ...STATUS_TEXT };
  }

  /**
   * 加载任务数据，自动处理版本兼容
   * @returns {Promise<Task[]>} 任务列表
   */
  async load() {
    try {
      const attrs = await this.api.getBlockAttrs(this.blockId);

      // 加载自定义状态名称
      if (attrs['custom-status-texts']) {
        try {
          const customStatusTexts = JSON.parse(attrs['custom-status-texts']);
          this.statusTexts = { ...STATUS_TEXT, ...customStatusTexts };
        } catch (e) {
          console.error('解析自定义状态名称失败:', e);
        }
      }

      // 优先读取新格式数据
      if (attrs['custom-tasks']) {
        this.tasks = this.parseNewFormat(attrs['custom-tasks']);
        this.isMigrated = true;
        return this.tasks;
      }

      // 读取旧格式数据并迁移
      this.tasks = await this.migrateFromOldFormat(attrs);
      this.isMigrated = true;

      // 自动保存新格式数据
      await this.save();

      // 保留旧数据备份3个版本，暂不删除
      // await this.backupOldData(attrs);

      return this.tasks;
    } catch (error) {
      console.error('加载任务数据失败:', error);
      // 加载失败时返回空数组，避免崩溃
      return [];
    }
  }

  /**
   * 保存任务数据
   * @param {Task[]} [tasks] 要保存的任务列表，不传则使用当前tasks
   * @returns {Promise<void>}
   */
  async save(tasks) {
    if (tasks) {
      this.tasks = tasks;
    }

    try {
      const data = {
        version: TaskStore.DATA_VERSION,
        tasks: this.tasks.map(task => task.toJSON()),
        updatedAt: Date.now(),
      };

      await this.api.setBlockAttrs(this.blockId, {
        'custom-tasks': JSON.stringify(data),
      });
    } catch (error) {
      console.error('保存任务数据失败:', error);
      throw error;
    }
  }

  /**
   * 解析新格式数据
   * @param {string} jsonStr JSON字符串
   * @returns {Task[]} 任务列表
   */
  parseNewFormat(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || !Array.isArray(data.tasks)) {
        return [];
      }

      return data.tasks.map(taskData => new Task(taskData));
    } catch (error) {
      console.error('解析新格式数据失败:', error);
      return [];
    }
  }

  /**
   * 从旧格式迁移数据
   * @param {object} attrs 块属性对象
   * @returns {Promise<Task[]>} 迁移后的任务列表
   */
  async migrateFromOldFormat(attrs) {
    const tasks = [];
    let order = 0;

    for (const [attrKey, status] of Object.entries(TaskStore.OLD_ATTR_KEYS)) {
      if (attrs[attrKey]) {
        try {
          const oldTasks = JSON.parse(attrs[attrKey]);
          if (Array.isArray(oldTasks)) {
            oldTasks.forEach(oldTask => {
              const task = Task.fromOldFormat(oldTask, status, order++);
              tasks.push(task);
            });
          }
        } catch (error) {
          console.error(`解析旧格式数据失败 ${attrKey}:`, error);
        }
      }
    }

    return tasks;
  }

  /**
   * 备份旧数据
   * @param {object} attrs 旧属性对象
   * @returns {Promise<void>}
   */
  async backupOldData(attrs) {
    const backupAttrs = {};
    for (const [attrKey] of Object.entries(TaskStore.OLD_ATTR_KEYS)) {
      if (attrs[attrKey]) {
        backupAttrs[`${attrKey}-backup-v1`] = attrs[attrKey];
      }
    }

    if (Object.keys(backupAttrs).length > 0) {
      await this.api.setBlockAttrs(this.blockId, backupAttrs);
    }
  }

  /**
   * 添加新任务
   * @param {object} taskData 任务数据
   * @returns {Promise<Task>} 新创建的任务
   */
  async addTask(taskData) {
    const task = new Task(taskData);
    // 设置排序为最后
    task.order = this.tasks.length > 0
      ? Math.max(...this.tasks.map(t => t.order)) + 1
      : 0;

    this.tasks.push(task);
    await this.save();
    return task;
  }

  /**
   * 更新任务
   * @param {string} taskId 任务ID
   * @param {object} updateData 要更新的字段
   * @returns {Promise<Task|null>} 更新后的任务，找不到返回null
   */
  async updateTask(taskId, updateData) {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return null;
    }

    this.tasks[taskIndex].update(updateData);
    await this.save();
    return this.tasks[taskIndex];
  }

  /**
   * 删除任务
   * @param {string} taskId 任务ID
   * @returns {Promise<boolean>} 删除成功返回true
   */
  async deleteTask(taskId) {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(t => t.id !== taskId);

    if (this.tasks.length === initialLength) {
      return false;
    }

    await this.save();
    return true;
  }

  /**
   * 更新任务排序
   * @param {string} taskId 任务ID
   * @param {string} newStatus 新状态
   * @param {string[]} taskIds 新的任务ID顺序
   * @returns {Promise<boolean>} 更新成功返回true
   */
  async updateTaskOrder(taskId, newStatus, taskIds) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) {
      return false;
    }

    // 更新任务状态
    task.status = newStatus;

    // 根据新顺序更新所有任务的order值
    taskIds.forEach((id, index) => {
      const t = this.tasks.find(task => task.id === id);
      if (t) {
        t.order = index;
      }
    });

    await this.save();
    return true;
  }

  /**
   * 按状态获取任务列表
   * @param {string} status 任务状态
   * @returns {Task[]} 该状态下的任务列表，按order排序
   */
  getTasksByStatus(status) {
    return this.tasks
      .filter(task => task.status === status)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * 获取状态显示文本
   * @param {string} status 状态值
   * @returns {string} 显示文本
   */
  getStatusText(status) {
    return this.statusTexts[status] || STATUS_TEXT[status] || status;
  }

  /**
   * 获取所有状态文本映射
   * @returns {object} 状态文本映射
   */
  getStatusTexts() {
    return { ...this.statusTexts };
  }

  /**
   * 保存自定义状态文本
   * @param {string} status 状态值
   * @param {string} text 自定义显示文本
   * @returns {Promise<void>}
   */
  async saveStatusText(status, text) {
    if (!Object.values(TASK_STATUS).includes(status)) {
      throw new Error(`无效的状态值: ${status}`);
    }

    this.statusTexts[status] = text;

    try {
      await this.api.setBlockAttrs(this.blockId, {
        'custom-status-texts': JSON.stringify(this.statusTexts),
      });
    } catch (error) {
      console.error('保存状态文本失败:', error);
      throw error;
    }
  }

  /**
   * 导出全部数据（任务+自定义状态文本）
   * @returns {object} 导出数据对象
   */
  exportData() {
    return {
      version: TaskStore.DATA_VERSION,
      exportTime: new Date().toISOString(),
      tasks: this.tasks.map(task => task.toJSON()),
      statusTexts: { ...this.statusTexts },
    };
  }

  /**
   * 导入数据
   * @param {object} data 导入的数据对象
   * @returns {Promise<boolean>} 导入成功返回true
   */
  async importData(data) {
    try {
      // 验证数据格式
      if (!data || !Array.isArray(data.tasks)) {
        return false;
      }

      // 验证每个任务格式
      const validTasks = data.tasks.filter(taskData =>
        taskData.id && taskData.title && Object.values(TASK_STATUS).includes(taskData.status)
      );

      if (validTasks.length === 0) {
        return false;
      }

      // 替换现有任务
      this.tasks = validTasks.map(taskData => new Task(taskData));

      // 导入状态文本（如果有）
      if (data.statusTexts && typeof data.statusTexts === 'object') {
        this.statusTexts = { ...STATUS_TEXT, ...data.statusTexts };
        // 保存自定义状态文本
        await this.api.setBlockAttrs(this.blockId, {
          'custom-status-texts': JSON.stringify(this.statusTexts),
        });
      }

      // 保存到块属性
      await this.save();
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }
}

export default TaskStore;
