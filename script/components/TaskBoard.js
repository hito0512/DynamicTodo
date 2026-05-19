import TaskColumn from './TaskColumn.js';
import TaskForm from './TaskForm.js';
import TaskPreview from './TaskPreview.js';
import TaskCalendar from './TaskCalendar.js';
import { createElement } from '../utils/dom.js';
import { TASK_STATUS } from '../config/constants.js';

/**
 * 任务看板主组件（含标签切换：看板视图 / 日历）
 */
class TaskBoard {
  constructor(taskStore) {
    this.taskStore = taskStore;
    this.columns = new Map();
    this.taskForm = null;
    this.taskPreview = null;
    this.calendar = null;
    this.element = null;
    this.activeView = 'board';
    this.init();
  }

  init() {
    Object.values(TASK_STATUS).forEach(status => {
      const column = new TaskColumn(status, {
        onAddTask: (status) => this.handleAddTask(status),
        onEditTask: (task) => this.handleEditTask(task),
        onDeleteTask: (taskId) => this.handleDeleteTask(taskId),
        onPreviewTask: (task, event) => this.handlePreviewTask(task, event),
        onDragStart: () => this.handleDragStart(),
        getStatusText: (status) => this.taskStore.getStatusText(status),
        onStatusTextUpdate: (status, newText) => this.handleStatusTextUpdate(status, newText),
      });
      this.columns.set(status, column);
    });

    this.taskForm = new TaskForm({
      onSubmit: (taskData) => this.handleFormSubmit(taskData),
      onUpdate: (taskId, updateData) => this.handleFormUpdate(taskId, updateData),
    }, this.taskStore.getStatusTexts());

    this.taskPreview = new TaskPreview((status) => this.taskStore.getStatusText(status));

    this.calendar = new TaskCalendar(this.taskStore, {
      onEditTask: (task) => this.handleEditTask(task),
      onPreviewTask: (task, event) => this.handlePreviewTask(task, event),
    });

    this.render();
  }

  render() {
    this.element = createElement('main', { className: 'project' }, [
      // 视图切换标签
      createElement('div', { className: 'view-tabs' }, [
        createElement('button', {
          className: 'view-tab' + (this.activeView === 'board' ? ' view-tab--active' : ''),
          onclick: () => this.switchView('board'),
        }, '📋 看板视图'),
        createElement('button', {
          className: 'view-tab' + (this.activeView === 'calendar' ? ' view-tab--active' : ''),
          onclick: () => this.switchView('calendar'),
        }, '📅 日历'),
      ]),
      // 看板内容区
      createElement('div', {
        className: 'view-content' + (this.activeView === 'board' ? '' : ' view-content--hidden'),
      },
        createElement('div', { className: 'project-tasks' },
          Array.from(this.columns.values()).map(column => column.getElement())
        )
      ),
      // 日历内容区
      createElement('div', {
        className: 'view-content' + (this.activeView === 'calendar' ? '' : ' view-content--hidden'),
      }, this.calendar.getElement()),
      // 弹窗
      this.taskForm.getElement(),
      this.taskPreview.getElement(),
    ]);
  }

  switchView(view) {
    if (this.activeView === view) return;
    this.activeView = view;
    this.refreshView();
  }

  refreshView() {
    const viewContents = this.element.querySelectorAll('.view-content');
    viewContents.forEach((el, index) => {
      if (index === 0) {
        el.classList.toggle('view-content--hidden', this.activeView !== 'board');
      } else {
        el.classList.toggle('view-content--hidden', this.activeView !== 'calendar');
      }
    });

    const tabs = this.element.querySelectorAll('.view-tab');
    tabs.forEach((tab, index) => {
      tab.classList.toggle('view-tab--active',
        (index === 0 && this.activeView === 'board') ||
        (index === 1 && this.activeView === 'calendar')
      );
    });

    if (this.activeView === 'calendar') {
      this.calendar.refresh();
    }
  }

  async loadTasks() {
    await this.taskStore.load();
    this.renderAllTasks();
    this.calendar.refresh();
  }

  renderAllTasks() {
    Object.values(TASK_STATUS).forEach(status => {
      const tasks = this.taskStore.getTasksByStatus(status);
      const column = this.columns.get(status);
      column.setTasks(tasks);
    });
  }

  handleAddTask(status) {
    const position = {
      x: Math.max(0, (window.innerWidth - 420) / 2),
      y: Math.max(0, (window.innerHeight - 480) / 2),
    };
    this.taskForm.openCreate(status, position);
  }

  handleEditTask(task) {
    const position = {
      x: Math.max(0, (window.innerWidth - 420) / 2),
      y: Math.max(0, (window.innerHeight - 480) / 2),
    };
    this.taskForm.openEdit(task, position);
  }

  async handleDeleteTask(taskId) {
    const success = await this.taskStore.deleteTask(taskId);
    if (success) {
      for (const column of this.columns.values()) {
        if (column.removeTask(taskId)) break;
      }
      this.calendar.refresh();
    }
  }

  handlePreviewTask(task, event) {
    this.taskPreview.show(task, event);
  }

  handleDragStart() {
    // 立即隐藏预览，同时取消 pending 的防抖显示
    if (this.taskPreview) {
      this.taskPreview.immediateHide();
    }
  }

  async handleFormSubmit(taskData) {
    const newTask = await this.taskStore.addTask(taskData);
    if (newTask) {
      const column = this.columns.get(newTask.status);
      column.addTask(newTask);
      this.calendar.refresh();
    }
  }

  async handleFormUpdate(taskId, updateData) {
    const oldTask = this.taskStore.tasks.find(t => t.id === taskId);
    if (!oldTask) return;

    const oldStatus = oldTask.status;
    const updatedTask = await this.taskStore.updateTask(taskId, updateData);

    if (updatedTask) {
      if (oldStatus === updatedTask.status) {
        const column = this.columns.get(oldStatus);
        column.updateTask(updatedTask);
      } else {
        const oldColumn = this.columns.get(oldStatus);
        oldColumn.removeTask(taskId);
        const newColumn = this.columns.get(updatedTask.status);
        newColumn.addTask(updatedTask);
      }
      this.calendar.refresh();
    }
  }

  getElement() { return this.element; }

  getColumnElements() {
    return Array.from(this.columns.values()).map(column => column.getElement());
  }

  async handleTaskDrop(taskId, newStatus, taskIds) {
    const success = await this.taskStore.updateTaskOrder(taskId, newStatus, taskIds);
    if (success) this.renderAllTasks();
  }

  async handleStatusTextUpdate(status, newText) {
    await this.taskStore.saveStatusText(status, newText);
    const column = this.columns.get(status);
    if (column) column.updateTitle(newText);
    this.taskForm.updateStatusOptions(this.taskStore.getStatusTexts());
    this.renderAllTasks();
  }

  destroy() {
    this.columns.forEach(column => column.destroy());
    this.columns.clear();
    if (this.calendar) this.calendar.destroy();
    this.taskForm.destroy();
    this.taskPreview.destroy();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}

export default TaskBoard;
