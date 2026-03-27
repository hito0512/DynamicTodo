import TaskColumn from './TaskColumn.js';
import TaskForm from './TaskForm.js';
import TaskPreview from './TaskPreview.js';
import { createElement, clearElement } from '../utils/dom.js';
import { TASK_STATUS } from '../config/constants.js';

/**
 * 任务看板主组件
 */
class TaskBoard {
  /**
   * 构造函数
   * @param {TaskStore} taskStore 任务存储实例
   */
  constructor(taskStore) {
    this.taskStore = taskStore;
    this.columns = new Map(); // status -> TaskColumn实例
    this.taskForm = null;
    this.taskPreview = null;
    this.element = null;
    this.init();
  }

  /**
   * 初始化
   */
  init() {
    // 创建列组件
    Object.values(TASK_STATUS).forEach(status => {
      const column = new TaskColumn(status, {
        onAddTask: (status) => this.handleAddTask(status),
        onEditTask: (task) => this.handleEditTask(task),
        onDeleteTask: (taskId) => this.handleDeleteTask(taskId),
        onPreviewTask: (task, event) => this.handlePreviewTask(task, event),
        getStatusText: (status) => this.taskStore.getStatusText(status),
        onStatusTextUpdate: (status, newText) => this.handleStatusTextUpdate(status, newText),
      });
      this.columns.set(status, column);
    });

    // 创建表单组件
    this.taskForm = new TaskForm({
      onSubmit: (taskData) => this.handleFormSubmit(taskData),
      onUpdate: (taskId, updateData) => this.handleFormUpdate(taskId, updateData),
    }, this.taskStore.getStatusTexts());

    // 创建预览组件
    this.taskPreview = new TaskPreview((status) => this.taskStore.getStatusText(status));

    this.render();
  }

  /**
   * 渲染看板
   */
  render() {
    this.element = createElement('main', { className: 'project' }, [
      createElement('div', { className: 'project-tasks' },
        Array.from(this.columns.values()).map(column => column.getElement())
      ),
      this.taskForm.getElement(),
      this.taskPreview.getElement(),
    ]);
  }

  /**
   * 加载并渲染所有任务
   */
  async loadTasks() {
    await this.taskStore.load();
    this.renderAllTasks();
  }

  /**
   * 渲染所有任务到对应的列
   */
  renderAllTasks() {
    Object.values(TASK_STATUS).forEach(status => {
      const tasks = this.taskStore.getTasksByStatus(status);
      const column = this.columns.get(status);
      column.setTasks(tasks);
    });
  }

  /**
   * 处理添加任务
   * @param {string} status 任务状态
   */
  handleAddTask(status) {
    // 完全居中显示
    const position = {
      x: Math.max(0, (window.innerWidth - 420) / 2),
      y: Math.max(0, (window.innerHeight - 480) / 2),
    };

    this.taskForm.openCreate(status, position);
  }

  /**
   * 处理编辑任务
   * @param {Task} task 任务
   */
  handleEditTask(task) {
    // 完全居中显示
    const position = {
      x: Math.max(0, (window.innerWidth - 420) / 2),
      y: Math.max(0, (window.innerHeight - 480) / 2),
    };

    this.taskForm.openEdit(task, position);
  }

  /**
   * 处理删除任务
   * @param {string} taskId 任务ID
   */
  async handleDeleteTask(taskId) {
    const success = await this.taskStore.deleteTask(taskId);
    if (success) {
      // 从列中移除任务
      for (const column of this.columns.values()) {
        if (column.removeTask(taskId)) {
          break;
        }
      }
    }
  }

  /**
   * 处理预览任务
   * @param {Task|null} task 任务
   * @param {Event} event 事件
   */
  handlePreviewTask(task, event) {
    this.taskPreview.show(task, event);
  }

  /**
   * 处理表单提交（创建任务）
   * @param {object} taskData 任务数据
   */
  async handleFormSubmit(taskData) {
    const newTask = await this.taskStore.addTask(taskData);
    if (newTask) {
      const column = this.columns.get(newTask.status);
      column.addTask(newTask);
    }
  }

  /**
   * 处理表单更新
   * @param {string} taskId 任务ID
   * @param {object} updateData 更新数据
   */
  async handleFormUpdate(taskId, updateData) {
    const oldTask = this.taskStore.tasks.find(t => t.id === taskId);
    if (!oldTask) return;

    const oldStatus = oldTask.status; // 提前保存旧状态，避免引用类型问题
    const updatedTask = await this.taskStore.updateTask(taskId, updateData);

    if (updatedTask) {
      if (oldStatus === updatedTask.status) {
        // 状态没变，更新当前列
        const column = this.columns.get(oldStatus);
        column.updateTask(updatedTask);
      } else {
        // 状态变了，从旧列移除，添加到新列
        const oldColumn = this.columns.get(oldStatus);
        oldColumn.removeTask(taskId);

        const newColumn = this.columns.get(updatedTask.status);
        newColumn.addTask(updatedTask);
      }
    }
  }

  /**
   * 获取看板元素
   * @returns {HTMLElement} 看板元素
   */
  getElement() {
    return this.element;
  }

  /**
   * 获取所有列元素
   * @returns {HTMLElement[]} 列元素数组
   */
  getColumnElements() {
    return Array.from(this.columns.values()).map(column => column.getElement());
  }

  /**
   * 处理任务拖拽完成
   * @param {string} taskId 任务ID
   * @param {string} newStatus 新状态
   * @param {string[]} taskIds 新的任务ID顺序
   */
  async handleTaskDrop(taskId, newStatus, taskIds) {
    const success = await this.taskStore.updateTaskOrder(taskId, newStatus, taskIds);
    if (success) {
      this.renderAllTasks();
    }
  }

  /**
   * 处理状态文本更新
   * @param {string} status 状态值
   * @param {string} newText 新的显示文本
   */
  async handleStatusTextUpdate(status, newText) {
    // 保存到存储
    await this.taskStore.saveStatusText(status, newText);

    // 更新列标题
    const column = this.columns.get(status);
    if (column) {
      column.updateTitle(newText);
    }

    // 更新表单的下拉选项
    this.taskForm.updateStatusOptions(this.taskStore.getStatusTexts());

    // 重新渲染所有任务卡片，更新状态标签
    this.renderAllTasks();
  }

  /**
   * 销毁组件
   */
  destroy() {
    this.columns.forEach(column => column.destroy());
    this.columns.clear();
    this.taskForm.destroy();
    this.taskPreview.destroy();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}

export default TaskBoard;
