import { createElement, debounce } from '../utils/dom.js';
import { formatDate, formatRelativeTime } from '../utils/date.js';
import { sanitizeHtml } from '../utils/security.js';
import { UI_CONSTANTS } from '../config/constants.js';

/**
 * 任务预览浮层组件
 */
class TaskPreview {
  /**
   * 构造函数
   * @param {Function} getStatusText 获取状态文本的方法
   */
  constructor(getStatusText) {
    this.getStatusText = getStatusText || ((status) => status);
    this.element = null;
    this.currentTask = null;
    this.isVisible = false;
    this.showPreviewDebounced = debounce(this.showPreview.bind(this), 300);
    this.hidePreviewDebounced = debounce(this.hidePreview.bind(this), 200);
    this.render();
  }

  /**
   * 渲染预览浮层
   */
  render() {
    this.element = createElement('div', {
      className: 'taskPreview',
      id: 'taskPreview',
      style: {
        display: 'none',
        position: 'absolute',
        zIndex: 9999,
        maxWidth: `${UI_CONSTANTS.PREVIEW_MAX_WIDTH}px`,
      },
    }, [
      createElement('div', { className: 'taskPreview__body' }, [
        // 顶部：关闭按钮
        createElement('button', {
          className: 'preview-close',
          id: 'previewClose',
          title: '关闭',
          onclick: () => this.hidePreview(),
        }, '×'),
        // 任务标题
        createElement('div', { className: 'tag-Preview tag-Preview--title' }, [
          createElement('span', { className: 'ptitle', id: 'ptitle' }),
        ]),
        // 状态 + 时间 同行
        createElement('div', { className: 'tag-Preview tag-Preview--meta' }, [
          createElement('span', { className: 'pstate', id: 'pstate' }),
          createElement('span', { className: 'ptime', id: 'ptime' }),
        ]),
        // 描述
        createElement('div', { className: 'tag-Preview tag-Preview--desc' }, [
          createElement('div', { className: 'pcontent', id: 'pcontent' }),
        ]),
      ]),
    ]);

    // 鼠标进入预览区域时保持显示
    this.element.addEventListener('mouseenter', () => {
      this.hidePreviewDebounced.cancel();
    });

    // 鼠标离开时隐藏
    this.element.addEventListener('mouseleave', () => {
      this.hidePreviewDebounced();
    });
  }

  /**
   * 显示任务预览（防抖）
   * @param {Task|null} task 任务数据，null则隐藏
   * @param {Event} [event] 触发事件，用于定位
   */
  show(task, event) {
    // 清除 pending 的显示/隐藏，避免竞态
    this.showPreviewDebounced.cancel();
    this.hidePreviewDebounced.cancel();

    if (task) {
      this.showPreviewDebounced(task, event);
    } else {
      this.hidePreviewDebounced();
    }
  }

  /**
   * 立即显示预览
   * @param {Task} task 任务数据
   * @param {Event} [event] 触发事件
   */
  showPreview(task, event) {
    this.currentTask = task;
    this.isVisible = true;

    // 设置状态属性（驱动顶部色条）
    this.element.setAttribute('data-status', task.status);

    // 填充内容
    this.element.querySelector('#ptitle').textContent = task.title;
    const stateEl = this.element.querySelector('#pstate');
    stateEl.textContent = this.getStatusText(task.status);
    stateEl.setAttribute('data-status', task.status);
    // 日期信息
    let timeStr = '';
    if (task.startDate) {
      timeStr = formatDate(task.startDate, 'MM-DD');
      if (task.endDate) timeStr += ` ~ ${formatDate(task.endDate, 'MM-DD')}`;
      timeStr += ' · ';
    }
    const relativeTime = formatRelativeTime(task.createdAt);
    const fullTime = formatDate(task.createdAt, 'YYYY-MM-DD HH:mm');
    this.element.querySelector('#ptime').textContent = `${timeStr}${relativeTime} · ${fullTime}`;

    // 渲染markdown描述
    if (window.marked && task.description) {
      const html = marked.parse(task.description);
      const safeHtml = sanitizeHtml(html);
      this.element.querySelector('#pcontent').innerHTML = safeHtml;
    } else {
      this.element.querySelector('#pcontent').textContent = task.description || '';
    }

    // 定位
    if (event) {
      let x = event.clientX + UI_CONSTANTS.PREVIEW_OFFSET_X;
      let y = event.clientY + UI_CONSTANTS.PREVIEW_OFFSET_Y;

      // 防止超出屏幕
      const maxX = window.innerWidth - UI_CONSTANTS.PREVIEW_MAX_WIDTH - 20;
      const maxY = window.innerHeight - 300; // 预估预览高度

      if (x > maxX) {
        x = event.clientX - UI_CONSTANTS.PREVIEW_OFFSET_X - UI_CONSTANTS.PREVIEW_MAX_WIDTH;
      }
      if (y > maxY) {
        y = event.clientY - UI_CONSTANTS.PREVIEW_OFFSET_Y - 300;
      }

      this.element.style.left = `${x}px`;
      this.element.style.top = `${y}px`;
    }

    this.element.style.display = 'block';
  }

  /**
   * 隐藏预览
   */
  hide() {
    this.hidePreviewDebounced();
  }

  /**
   * 立即隐藏预览
   */
  hidePreview() {
    this.isVisible = false;
    this.currentTask = null;
    this.element.style.display = 'none';
  }

  /**
   * 获取预览元素
   * @returns {HTMLElement} 预览元素
   */
  getElement() {
    return this.element;
  }

  /**
   * 销毁组件
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.currentTask = null;
    this.isVisible = false;
  }
}

export default TaskPreview;
