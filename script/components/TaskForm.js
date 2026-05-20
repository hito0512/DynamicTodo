import { createElement, makeDraggable } from '../utils/dom.js';

/**
 * 将时间戳转为日期输入框的 YYYY-MM-DD 格式
 */
function formatDateInput(timestamp) {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

import { validateTaskData } from '../utils/security.js';
import { TASK_STATUS, STATUS_TEXT } from '../config/constants.js';

/**
 * 任务表单组件（创建/编辑任务）
 */
class TaskForm {
  constructor(callbacks = {}, initialStatusTexts = STATUS_TEXT) {
    this.onSubmit = callbacks.onSubmit || (() => {});
    this.onUpdate = callbacks.onUpdate || (() => {});
    this.statusTexts = { ...initialStatusTexts };
    this.element = null;
    this.currentTask = null;
    this.isOpen = false;
    this.render();
  }

  render() {
    const header = createElement('div', { className: 'form-header' }, [
      createElement('h3', { className: 'form-title' }, '创建任务'),
      createElement('button', {
        className: 'form-close',
        onclick: () => this.close(),
      }, '×'),
    ]);

    const body = createElement('div', { className: 'form-body' }, [
      // 标题
      createElement('div', { className: 'form-group' }, [
        createElement('label', { className: 'form-label' }, '任务名称'),
        createElement('input', {
          type: 'text',
          placeholder: '输入任务名称...',
          id: 'taskname',
          className: 'form-input',
        }),
      ]),
      // 状态
      createElement('div', { className: 'form-group' }, [
        createElement('label', { className: 'form-label' }, '任务状态'),
        createElement('select', { className: 'form-select', name: 'taskType', id: 'taskType' },
          Object.entries(this.statusTexts).map(([value, text]) =>
            createElement('option', { value }, text)
          )
        ),
      ]),
      // 日期
      createElement('div', { className: 'form-row' }, [
        createElement('div', { className: 'form-group' }, [
          createElement('label', { className: 'form-label' }, '开始日期'),
          createElement('input', {
            type: 'date',
            id: 'taskstart',
            className: 'form-input',
            max: formatDateInput(Date.now()),
          }),
        ]),
        createElement('div', { className: 'form-group' }, [
          createElement('label', { className: 'form-label' }, '结束日期'),
          createElement('input', {
            type: 'date',
            id: 'taskend',
            className: 'form-input',
          }),
        ]),
      ]),
      // 描述
      createElement('div', { className: 'form-group' }, [
        createElement('label', { className: 'form-label' }, '任务描述'),
        createElement('textarea', {
          id: 'taskcontent',
          className: 'form-textarea',
          rows: 4,
          placeholder: '输入任务描述（支持 Markdown）...',
        }),
      ]),
      // 标签
      createElement('div', { className: 'form-group' }, [
        createElement('label', { className: 'form-label' }, '标签（逗号分隔）'),
        createElement('input', {
          type: 'text',
          placeholder: '例如: 工作, 个人, 学习',
          id: 'tasktags',
          className: 'form-input',
        }),
      ]),
    ]);

    const footer = createElement('div', { className: 'form-footer' }, [
      createElement('button', {
        className: 'form-btn form-btn--cancel',
        onclick: () => this.close(),
      }, '取消'),
      createElement('button', {
        className: 'form-btn form-btn--submit',
        id: 'submit',
      }, '创建'),
      createElement('button', {
        className: 'form-btn form-btn--update',
        id: 'update',
        style: { display: 'none' },
      }, '更新'),
    ]);

    this.element = createElement('div', {
      id: 'addTask',
      className: 'addTask',
      style: {
        display: 'none',
        position: 'fixed',
        zIndex: 9999,
      },
    }, [
      createElement('div', { className: 'form-container' }, [
        header, body, footer,
      ]),
    ]);

    makeDraggable(this.element, this.element.querySelector('.form-header'));
    this.bindEvents();
  }

  bindEvents() {
    this.element.querySelector('#submit').addEventListener('click', () => this.handleSubmit());
    this.element.querySelector('#update').addEventListener('click', () => this.handleUpdate());

    const titleInput = this.element.querySelector('#taskname');
    titleInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (this.currentTask) {
          this.handleUpdate();
        } else {
          this.handleSubmit();
        }
      }
    });

    const contentInput = this.element.querySelector('#taskcontent');
    contentInput.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = contentInput.selectionStart;
        const end = contentInput.selectionEnd;
        contentInput.value = contentInput.value.substring(0, start) + '  ' + contentInput.value.substring(end);
        contentInput.selectionStart = contentInput.selectionEnd = start + 2;
      }
    });

    document.addEventListener('mousedown', (e) => {
      if (this.isOpen && this.element && !this.element.contains(e.target)) {
        if (e.target.closest('.form-alert-modal')) return;
        this.close();
      }
    });
  }

  openCreate(defaultStatus = 'todo', position = { x: 100, y: 100 }) {
    this.currentTask = null;
    this.isOpen = true;

    this.element.querySelector('#taskname').value = '';
    this.element.querySelector('#taskcontent').value = '';
    this.element.querySelector('#tasktags').value = '';
    this.element.querySelector('#taskType').value = defaultStatus;
    this.element.querySelector('#taskstart').value = formatDateInput(Date.now());
    this.element.querySelector('#taskend').value = '';

    this.element.querySelector('#submit').style.display = '';
    this.element.querySelector('#update').style.display = 'none';
    this.element.querySelector('.form-title').textContent = '创建任务';

    this.element.style.pointerEvents = 'auto';
    this.element.style.left = `${position.x}px`;
    this.element.style.top = `${position.y}px`;
    this.element.style.display = 'block';

    setTimeout(() => {
      this.element.querySelector('#taskname').focus();
    }, 0);
  }

  openEdit(task, position = { x: 100, y: 100 }) {
    this.currentTask = task;
    this.isOpen = true;

    this.element.querySelector('#taskname').value = task.title;
    this.element.querySelector('#taskcontent').value = task.description;
    this.element.querySelector('#tasktags').value = (task.tags || []).join(', ');
    this.element.querySelector('#taskType').value = task.status;

    if (task.startDate) {
      this.element.querySelector('#taskstart').value = formatDateInput(task.startDate);
    } else {
      this.element.querySelector('#taskstart').value = formatDateInput(task.createdAt);
    }
    if (task.endDate) {
      this.element.querySelector('#taskend').value = formatDateInput(task.endDate);
    } else {
      this.element.querySelector('#taskend').value = '';
    }
    
    this.element.querySelector('#submit').style.display = 'none';
    this.element.querySelector('#update').style.display = '';
    this.element.querySelector('.form-title').textContent = '编辑任务';

    this.element.style.pointerEvents = 'auto';
    this.element.style.left = `${position.x}px`;
    this.element.style.top = `${position.y}px`;
    this.element.style.display = 'block';

    setTimeout(() => {
      this.element.querySelector('#taskname').focus();
      this.element.querySelector('#taskname').select();
    }, 0);
  }

  close() {
    this.isOpen = false;
    this.currentTask = null;
    this.element.style.display = 'none';
  }

  showAlert(message) {
    const overlay = createElement('div', {
      className: 'form-alert-modal',
      style: {
        position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: '100000',
      },
    }, [
      createElement('div', {
        style: {
          background: '#fff', borderRadius: '12px', padding: '2rem',
          minWidth: '260px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          textAlign: 'center',
        },
      }, [
        createElement('p', {
          style: { marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--text-primary)' },
        }, message),
        createElement('button', {
          className: 'alert-confirm-btn',
          style: {
            padding: '0.5rem 1.5rem', border: 'none',
            background: 'linear-gradient(135deg, var(--status-todo), #a78bfa)',
            color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem',
          },
          onclick: () => {
            document.body.removeChild(overlay);
            this.element.querySelector('#taskname').focus();
          },
        }, '确定'),
      ]),
    ]);

    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
        this.element.querySelector('#taskname').focus();
      }
    });
  }

  handleSubmit() {
    const title = this.element.querySelector('#taskname').value.trim();
    const description = this.element.querySelector('#taskcontent').value.trim();
    const status = this.element.querySelector('#taskType').value;
    const startVal = this.element.querySelector('#taskstart').value;
    const endVal = this.element.querySelector('#taskend').value;

    const tagsVal = this.element.querySelector('#tasktags').value.trim();
    const taskData = {
      title, description, status, tags: tagsVal ? tagsVal.split(/[,，]/).map(t => t.trim()).filter(Boolean) : [],
      startDate: startVal ? new Date(startVal).getTime() : Date.now(),
      endDate: endVal ? new Date(endVal).getTime() : null,
      createdAt: Date.now(),
    };

    if (!validateTaskData(taskData)) {
      this.showAlert('任务标题不能为空');
      return;
    }

    this.onSubmit(taskData);
    this.close();
  }

  handleUpdate() {
    if (!this.currentTask) return;

    const title = this.element.querySelector('#taskname').value.trim();
    const description = this.element.querySelector('#taskcontent').value.trim();
    const status = this.element.querySelector('#taskType').value;
    const startVal = this.element.querySelector('#taskstart').value;
    const endVal = this.element.querySelector('#taskend').value;

    const tagsVal = this.element.querySelector('#tasktags').value.trim();
    const updateData = {
      title, description, status, tags: tagsVal ? tagsVal.split(/[,，]/).map(t => t.trim()).filter(Boolean) : [],
      startDate: startVal ? new Date(startVal).getTime() : (this.currentTask.startDate || Date.now()),
      endDate: endVal ? new Date(endVal).getTime() : null,
    };

    if (!validateTaskData(updateData)) {
      this.showAlert('任务标题不能为空');
      return;
    }

    this.onUpdate(this.currentTask.id, updateData);
    this.close();
  }

  getElement() {
    return this.element;
  }

  updateStatusOptions(statusTexts) {
    this.statusTexts = { ...statusTexts };
    const selectElement = this.element.querySelector('#taskType');
    const currentValue = selectElement.value;
    selectElement.innerHTML = '';
    Object.entries(this.statusTexts).forEach(([value, text]) => {
      const option = createElement('option', { value }, text);
      selectElement.appendChild(option);
    });
    selectElement.value = currentValue;
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.currentTask = null;
    this.isOpen = false;
  }
}

export default TaskForm;
