import { formatDate } from '../utils/date.js';
import { createElement } from '../utils/dom.js';
import { sanitizeHtml } from '../utils/security.js';

/**
 * 任务卡片组件
 */
class TaskCard {
  constructor(task, callbacks = {}) {
    this.task = task;
    this.onEdit = callbacks.onEdit || (() => {});
    this.onDelete = callbacks.onDelete || (() => {});
    this.onPreview = callbacks.onPreview || (() => {});
    this.element = null;
    this.render();
  }

  render() {
    this.element = createElement('div', {
      className: 'task',
      draggable: true,
      'data-task-id': this.task.id,
      'data-status': this.task.status,
    }, [
      createElement('div', { className: 'task__tags' }, [
        createElement('span', {
          className: `task__tag task__tag--${this.task.status}`,
        }, this.task.title),
        createElement('div', { className: 'task__actions' }, [
          createElement('button', {
            className: 'task__action-btn task__action-btn--edit',
            title: '编辑任务',
          }, '✏️'),
          createElement('button', {
            className: 'task__action-btn task__action-btn--delete',
            title: '删除任务',
          }, '🗑️'),
        ]),
      ]),
      createElement('div', { className: 'task__description' }, ''),
      createElement('div', { className: 'task__stats' }, [
        this.task.startDate
          ? createElement('span', { className: 'task__date-range' },
              `📅 ${formatDate(this.task.startDate, 'YYYY-MM-DD')}` +
              (this.task.endDate ? ` ~ ${formatDate(this.task.endDate, 'MM-DD')}` : ''))
          : createElement('span', {}, `📅 ${formatDate(this.task.createdAt, 'YYYY-MM-DD')}`),
        createElement('span', {}, `🕐 ${formatDate(this.task.createdAt, 'HH:mm')}`),
      ]),
    ]);

    this.renderDescription();
    this.bindEvents();
  }

  renderDescription() {
    let shortDescription = '';
    if (this.task.description) {
      const truncatedDesc = this.task.description.length > 150
        ? this.task.description.substring(0, 150) + '...'
        : this.task.description;

      if (window.marked && this.task.description) {
        const html = marked.parse(truncatedDesc);
        shortDescription = sanitizeHtml(html);
      } else {
        shortDescription = truncatedDesc;
      }
    } else {
      shortDescription = '&nbsp;';
    }

    const descElement = this.element.querySelector('.task__description');
    if (descElement) {
      descElement.innerHTML = shortDescription;
    }
  }

  bindEvents() {
    // 仅在描述内容区悬停时显示预览，其他地方（标题、操作按钮、统计等）不触发
    const descEl = this.element.querySelector('.task__description');
    if (descEl) {
      descEl.addEventListener('mouseenter', (e) => {
        e.stopPropagation();
        this.onPreview(this.task, e);
      });
      descEl.addEventListener('mouseleave', () => {
        this.onPreview(null);
      });
    }

    // 鼠标离开整张卡片时确保隐藏预览
    this.element.addEventListener('mouseleave', () => {
      this.onPreview(null);
    });

    const deleteBtn = this.element.querySelector('.task__action-btn--delete');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showDeleteConfirm();
      });
    }

    const editBtn = this.element.querySelector('.task__action-btn--edit');
    if (editBtn) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onEdit(this.task);
      });
    }

    this.element.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      this.onEdit(this.task);
    });
  }

  showDeleteConfirm() {
    const confirmModal = createElement('div', {
      className: 'delete-confirm-modal',
      style: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '99999',
      },
    }, [
      createElement('div', {
        className: 'delete-confirm-content',
        style: {
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '2rem',
          minWidth: '300px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          textAlign: 'center',
        },
      }, [
        createElement('p', {
          style: {
            marginBottom: '1.5rem',
            fontSize: '1.1rem',
            color: 'var(--text-primary)',
          },
        }, '确定要删除这个任务吗？'),
        createElement('div', {
          style: {
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
          },
        }, [
          createElement('button', {
            className: 'cancel-btn',
            style: {
              padding: '0.5rem 1.5rem',
              border: '1px solid #e2e8f0',
              background: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
            },
            onclick: () => {
              document.body.removeChild(confirmModal);
            },
          }, '取消'),
          createElement('button', {
            className: 'confirm-btn',
            style: {
              padding: '0.5rem 1.5rem',
              border: 'none',
              background: 'linear-gradient(135deg, #ef4444, #f87171)',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.2s ease',
            },
            onclick: () => {
              document.body.removeChild(confirmModal);
              this.onDelete(this.task.id);
            },
          }, '删除'),
        ]),
      ]),
    ]);

    document.body.appendChild(confirmModal);

    const closeModal = () => {
      if (document.body.contains(confirmModal)) {
        document.body.removeChild(confirmModal);
      }
    };

    confirmModal.addEventListener('click', (e) => {
      if (e.target === confirmModal) {
        closeModal();
      }
    });

    const cancelBtn = confirmModal.querySelector('.cancel-btn');
    const confirmBtn = confirmModal.querySelector('.confirm-btn');

    cancelBtn.addEventListener('mouseenter', () => {
      cancelBtn.style.background = '#f8fafc';
      cancelBtn.style.transform = 'translateY(-1px)';
    });
    cancelBtn.addEventListener('mouseleave', () => {
      cancelBtn.style.background = 'white';
      cancelBtn.style.transform = 'translateY(0)';
    });

    confirmBtn.addEventListener('mouseenter', () => {
      confirmBtn.style.transform = 'translateY(-1px)';
      confirmBtn.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
    });
    confirmBtn.addEventListener('mouseleave', () => {
      confirmBtn.style.transform = 'translateY(0)';
      confirmBtn.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
    });
  }

  update(newTask) {
    this.task = newTask;
    // 更新状态属性
    this.element.setAttribute('data-status', this.task.status);
    this.renderDescription();
  }

  getElement() {
    return this.element;
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}

export default TaskCard;
