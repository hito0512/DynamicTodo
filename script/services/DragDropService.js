/**
 * 拖拽服务
 * 处理任务卡片的拖拽排序功能
 */
class DragDropService {
  /**
   * 构造函数
   * @param {HTMLElement[]} columns 列元素数组
   * @param {Function} onDrop 拖拽完成回调 (taskId, newStatus, newOrder) => void
   */
  constructor(columns, onDrop) {
    this.columns = columns;
    this.onDrop = onDrop;
    this.draggedTask = null;
    this.draggedTaskId = null;
    this.originalStatus = null;
    this.bindEvents();
  }

  /**
   * 绑定拖拽事件
   */
  bindEvents() {
    this.columns.forEach(column => {
      // 使用捕获模式绑定拖拽事件，优先处理避免被其他事件阻止
      column.addEventListener('dragstart', this.handleDragStart.bind(this), true);
      column.addEventListener('dragover', this.handleDragOver.bind(this), true);
      column.addEventListener('dragenter', this.handleDragEnter.bind(this), true);
      column.addEventListener('dragleave', this.handleDragLeave.bind(this), true);
      column.addEventListener('drop', this.handleDrop.bind(this), true);
      column.addEventListener('dragend', this.handleDragEnd.bind(this), true);
    });
  }

  /**
   * 拖拽开始
   * @param {DragEvent} e 事件
   */
  handleDragStart(e) {
    const taskElement = e.target.closest('.task');
    if (!taskElement) return;

    this.draggedTask = taskElement;
    this.draggedTaskId = taskElement.dataset.taskId;
    this.originalStatus = taskElement.closest('.project-column').dataset.status;

    // 设置拖拽数据
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.draggedTaskId);

    // 添加拖拽样式
    setTimeout(() => {
      taskElement.classList.add('dragging');
      taskElement.style.opacity = '0.5';
    }, 0);

    e.stopPropagation();
  }

  /**
   * 拖拽经过
   * @param {DragEvent} e 事件
   */
  handleDragOver(e) {
    if (!this.draggedTask) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // 获取当前鼠标位置的任务元素
    const afterElement = this.getDragAfterElement(e.currentTarget, e.clientY);
    const draggable = document.querySelector('.dragging');

    if (afterElement == null) {
      e.currentTarget.appendChild(draggable);
    } else {
      e.currentTarget.insertBefore(draggable, afterElement);
    }

    e.stopPropagation();
  }

  /**
   * 进入列区域
   * @param {DragEvent} e 事件
   */
  handleDragEnter(e) {
    if (e.target.classList.contains('project-column')) {
      e.target.classList.add('drag-over');
    }
    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * 离开列区域
   * @param {DragEvent} e 事件
   */
  handleDragLeave(e) {
    if (e.target.classList.contains('project-column')) {
      e.target.classList.remove('drag-over');
    }
    e.stopPropagation();
  }

  /**
   * 放置
   * @param {DragEvent} e 事件
   */
  handleDrop(e) {
    e.preventDefault();

    if (!this.draggedTask || !this.draggedTaskId) return;

    const column = e.currentTarget;
    const newStatus = column.dataset.status;

    // 移除拖拽样式
    column.classList.remove('drag-over');

    // 获取列中所有任务元素，并计算它们的新顺序
    const allTasks = Array.from(column.querySelectorAll('.task'));
    const taskIds = allTasks.map(task => task.dataset.taskId);

    // 触发回调，传递完整的任务ID顺序
    if (this.onDrop) {
      this.onDrop(this.draggedTaskId, newStatus, taskIds);
    }
  }

  /**
   * 拖拽结束
   * @param {DragEvent} e 事件
   */
  handleDragEnd(e) {
    if (this.draggedTask) {
      this.draggedTask.classList.remove('dragging');
      this.draggedTask.style.opacity = '';
    }

    // 清理所有列的拖拽样式
    this.columns.forEach(column => {
      column.classList.remove('drag-over');
    });

    this.draggedTask = null;
    this.draggedTaskId = null;
    this.originalStatus = null;

    e.stopPropagation();
  }

  /**
   * 获取拖拽要插入位置的下一个元素
   * @param {HTMLElement} container 容器元素
   * @param {number} y 鼠标Y坐标
   * @returns {HTMLElement|null} 要插入位置的下一个元素
   */
  getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  /**
   * 销毁服务，移除事件监听
   */
  destroy() {
    this.columns.forEach(column => {
      column.removeEventListener('dragstart', this.handleDragStart);
      column.removeEventListener('dragover', this.handleDragOver);
      column.removeEventListener('dragenter', this.handleDragEnter);
      column.removeEventListener('dragleave', this.handleDragLeave);
      column.removeEventListener('drop', this.handleDrop);
      column.removeEventListener('dragend', this.handleDragEnd);
    });
    this.columns = [];
    this.onDrop = null;
  }
}

export default DragDropService;
