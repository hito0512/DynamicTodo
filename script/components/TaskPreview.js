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
        position: 'fixed',
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
      timeStr = formatDate(task.startDate, 'YYYY-MM-DD');
      if (task.endDate) timeStr += ` ~ ${formatDate(task.endDate, 'YYYY-MM-DD')}`;
      timeStr += ' · ';
    }
    this.element.querySelector('#ptime').textContent = `${timeStr}${formatRelativeTime(task.createdAt)}`;

    // 渲染markdown描述
    if (window.marked && task.description) {
      const html = marked.parse(task.description);
      const safeHtml = sanitizeHtml(html);
      this.element.querySelector('#pcontent').innerHTML = safeHtml;
    } else {
      this.element.querySelector('#pcontent').textContent = task.description || '';
    }

    this.element.style.display = 'block';

    // 定位：根据实际元素尺寸计算，确保不超出视口
    if (event) {
      const pw = this.element.offsetWidth;
      const ph = this.element.offsetHeight;
      const gap = 8;
      const pad = 10;

      let x = event.clientX + gap;
      let y = event.clientY + gap;

      // 超出右边界 → 翻到鼠标左侧
      if (x + pw > window.innerWidth - pad) {
        x = Math.max(pad, event.clientX - pw - gap);
      }
      // 超出下边界 → 翻到鼠标上方
      if (y + ph > window.innerHeight - pad) {
        y = Math.max(pad, event.clientY - ph - gap);
      }

      this.element.style.left = `${x}px`;
      this.element.style.top = `${y}px`;
    }
  }

  /**
   * 隐藏预览
   */
  hide() {
    this.hidePreviewDebounced();
  }

  /**
   * 立即隐藏预览（取消所有防抖，用于拖拽等场景）
   */
  immediateHide() {
    this.showPreviewDebounced.cancel();
    this.hidePreviewDebounced.cancel();
    this.hidePreview();
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
