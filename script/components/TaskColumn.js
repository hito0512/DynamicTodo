import TaskCard from './TaskCard.js';
import { createElement, clearElement } from '../utils/dom.js';

/**
 * 任务列组件
 */
class TaskColumn {
  /**
   * 构造函数
   * @param {string} status 任务状态
   * @param {object} callbacks 回调函数
   * @param {Function} callbacks.onAddTask 添加任务回调
   * @param {Function} callbacks.onEditTask 编辑任务回调
   * @param {Function} callbacks.onDeleteTask 删除任务回调
   * @param {Function} callbacks.onPreviewTask 预览任务回调
   * @param {Function} callbacks.getStatusText 获取状态文本的方法
   * @param {Function} callbacks.onStatusTextUpdate 状态文本更新回调
   */
  constructor(status, callbacks = {}) {
    this.status = status;
    this.onAddTask = callbacks.onAddTask || (() => {});
    this.onEditTask = callbacks.onEditTask || (() => {});
    this.onDeleteTask = callbacks.onDeleteTask || (() => {});
    this.onPreviewTask = callbacks.onPreviewTask || (() => {});
    this.getStatusText = callbacks.getStatusText || ((status) => status);
    this.onStatusTextUpdate = callbacks.onStatusTextUpdate || (() => {});
    this.tasks = [];
    this.cards = new Map(); // taskId -> TaskCard实例
    this.element = null;
    this.titleElement = null;
    this.render();
  }

  /**
   * 渲染列
   */
  render() {
    const statusText = this.getStatusText(this.status);
    const iconMap = {
      'todo': '📖',
      'doing': '🚴',
      'done': '💯',
      'unfinish': '👎',
    };

    // 创建添加按钮
    const addBtn = createElement('button', {
      className: 'project-column-heading__options',
      title: '添加任务',
    }, '+');

    // 绑定添加任务事件
    addBtn.addEventListener('click', () => {
      this.onAddTask(this.status);
    });

    // 创建标题元素
    this.titleElement = createElement('h3', {
      className: 'project-column-heading__title',
      style: {
        cursor: 'pointer',
        userSelect: 'none',
        margin: 0,
        flex: 1,
        marginRight: '8px'
      },
      title: '双击编辑标题'
    }, `${iconMap[this.status]} ${statusText}`);

    // 双击编辑标题
    this.titleElement.addEventListener('dblclick', () => {
      this.enableEdit();
    });

    this.element = createElement('div', {
      className: 'project-column',
      id: `project-${this.status}`,
      'data-status': this.status,
    }, [
      createElement('div', { className: 'project-column-heading' }, [
        this.titleElement,
        addBtn
      ]),
    ]);
  }

  /**
   * 启用编辑模式
   */
  enableEdit() {
    const currentText = this.getStatusText(this.status);
    const iconMap = {
      'todo': '📖',
      'doing': '🚴',
      'done': '💯',
      'unfinish': '👎',
    };
    const icon = iconMap[this.status];

    // 创建输入框
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.style.cssText = `
      width: ${Math.max(currentText.length * 14 + 30, 100)}px;
      border: 2px solid #7784ee;
      border-radius: 6px;
      padding: 2px 6px;
      font-size: 20px;
      font-weight: bold;
      outline: none;
      background: white;
      z-index: 100;
      position: relative;
    `;

    // 替换标题为输入框
    this.titleElement.innerHTML = '';
    this.titleElement.appendChild(input);

    // 确保输入框获得焦点
    setTimeout(() => {
      input.focus();
      input.select();
    }, 0);

    // 失去焦点或按Enter确认
    const confirmEdit = async () => {
      const newText = input.value.trim();
      if (newText && newText !== currentText) {
        try {
          await this.onStatusTextUpdate(this.status, newText);
          // 更新标题显示
          this.titleElement.textContent = `${icon} ${newText}`;
        } catch (error) {
          console.error('更新状态文本失败:', error);
          // 恢复原来的文本
          this.titleElement.textContent = `${icon} ${currentText}`;
        }
      } else {
        // 恢复原来的文本
        this.titleElement.textContent = `${icon} ${currentText}`;
      }
    };

    input.addEventListener('blur', confirmEdit);
    input.addEventListener('keydown', (e) => {
      e.stopPropagation(); // 阻止事件冒泡
      if (e.key === 'Enter') {
        confirmEdit();
      } else if (e.key === 'Escape') {
        // 取消编辑
        this.titleElement.textContent = `${icon} ${currentText}`;
      }
    });

    // 阻止输入框的双击事件冒泡
    input.addEventListener('dblclick', (e) => {
      e.stopPropagation();
    });
  }

  /**
   * 更新标题显示
   * @param {string} newText 新的标题文本
   */
  updateTitle(newText) {
    const iconMap = {
      'todo': '📖',
      'doing': '🚴',
      'done': '💯',
      'unfinish': '👎',
    };
    const icon = iconMap[this.status];
    this.titleElement.textContent = `${icon} ${newText}`;
  }

  /**
   * 设置任务列表
   * @param {Task[]} tasks 任务列表
   */
  setTasks(tasks) {
    this.tasks = tasks;
    this.renderTasks();
  }

  /**
   * 渲染所有任务卡片
   */
  renderTasks() {
    // 清空现有卡片
    Array.from(this.element.children).forEach(child => {
      if (child.classList.contains('task')) {
        child.remove();
      }
    });
    this.cards.clear();

    // 添加新卡片
    this.tasks.forEach(task => {
      const card = new TaskCard(task, {
        onEdit: (task) => this.onEditTask(task),
        onDelete: (taskId) => this.onDeleteTask(taskId),
        onPreview: (task, event) => this.onPreviewTask(task, event),
      });
      this.cards.set(task.id, card);
      this.element.appendChild(card.getElement());
    });
  }

  /**
   * 添加任务到列
   * @param {Task} task 任务
   */
  addTask(task) {
    this.tasks.push(task);
    const card = new TaskCard(task, {
      onEdit: (task) => this.onEditTask(task),
      onDelete: (taskId) => this.onDeleteTask(taskId),
      onPreview: (task, event) => this.onPreviewTask(task, event),
    });
    this.cards.set(task.id, card);
    this.element.appendChild(card.getElement());
  }

  /**
   * 更新任务
   * @param {Task} task 更新后的任务
   * @returns {boolean} 更新成功返回true
   */
  updateTask(task) {
    const index = this.tasks.findIndex(t => t.id === task.id);
    if (index === -1) {
      return false;
    }

    this.tasks[index] = task;
    const card = this.cards.get(task.id);
    if (card) {
      card.update(task);
    }
    return true;
  }

  /**
   * 移除任务
   * @param {string} taskId 任务ID
   * @returns {boolean} 移除成功返回true
   */
  removeTask(taskId) {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(t => t.id !== taskId);

    if (this.tasks.length === initialLength) {
      return false;
    }

    const card = this.cards.get(taskId);
    if (card) {
      card.destroy();
      this.cards.delete(taskId);
    }
    return true;
  }

  /**
   * 获取列元素
   * @returns {HTMLElement} 列元素
   */
  getElement() {
    return this.element;
  }

  /**
   * 获取列的状态
   * @returns {string} 状态
   */
  getStatus() {
    return this.status;
  }

  /**
   * 销毁组件
   */
  destroy() {
    this.cards.forEach(card => card.destroy());
    this.cards.clear();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.tasks = [];
  }
}

export default TaskColumn;
