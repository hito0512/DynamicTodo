import { createElement, makeDraggable } from '../utils/dom.js';
import { validateTaskData } from '../utils/security.js';
import { TASK_STATUS, STATUS_TEXT } from '../config/constants.js';

/**
 * 任务表单组件（创建/编辑任务）
 */
class TaskForm {
  /**
   * 构造函数
   * @param {object} callbacks 回调函数
   * @param {Function} callbacks.onSubmit 创建任务回调
   * @param {Function} callbacks.onUpdate 更新任务回调
   * @param {object} [initialStatusTexts] 初始状态文本映射
   */
  constructor(callbacks = {}, initialStatusTexts = STATUS_TEXT) {
    this.onSubmit = callbacks.onSubmit || (() => {});
    this.onUpdate = callbacks.onUpdate || (() => {});
    this.statusTexts = { ...initialStatusTexts };
    this.element = null;
    this.currentTask = null; // 编辑模式下的任务数据
    this.isOpen = false;
    this.render();
  }

  /**
   * 渲染表单
   */
  render() {
    this.element = createElement('div', {
      id: 'addTask',
      className: 'addTask',
      style: {
        display: 'none',
        position: 'fixed',
        zIndex: 9999,
      },
    }, [
      createElement('div', { className: 'task-setting', id: 'taskSetting' }, [
        createElement('div', { id: 'submit_task' }, [
          createElement('h3', {}, '编辑任务'),
          createElement('div', {}, [
            createElement('button', {
              className: 'update',
              id: 'update',
              style: { display: 'none' },
            }, '更新'),
            createElement('button', {
              className: 'submit',
              id: 'submit',
            }, '创建'),
          ]),
        ]),
        createElement('div', { className: 'tag-progress' }, [
          createElement('p', {}, [
            createElement('span', { className: 'left' }, '任务名称：'),
            createElement('input', {
              type: 'text',
              placeholder: '任务名称',
              id: 'taskname',
              className: 'taskname',
            }),
          ]),
        ]),
        createElement('div', { className: 'tag-progress' }, [
          createElement('p', {}, [
            createElement('span', { className: 'left' }, '任务状态：'),
            createElement('select', { name: 'taskType', id: 'taskType' },
              Object.entries(this.statusTexts).map(([value, text]) =>
                createElement('option', { value }, text)
              )
            ),
          ]),
        ]),
        createElement('div', { className: 'tag-progress' }, [
          createElement('p', {}, [
            createElement('span', {}, '任务描述：'),
            createElement('textarea', {
              id: 'taskcontent',
              className: 'taskcontent',
              rows: 8,
            }),
          ]),
        ]),
      ]),
    ]);

    // 使表单可拖动，整个顶部栏作为拖动手柄，避免影响按钮点击
    const header = this.element.querySelector('#submit_task');
    makeDraggable(this.element, header);

    this.bindEvents();
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 创建按钮
    const submitBtn = this.element.querySelector('#submit');
    submitBtn.addEventListener('click', () => this.handleSubmit());

    // 更新按钮
    const updateBtn = this.element.querySelector('#update');
    updateBtn.addEventListener('click', () => this.handleUpdate());

    // 表单输入回车提交
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

    // 任务描述框支持Tab输入
    const contentInput = this.element.querySelector('#taskcontent');
    contentInput.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = contentInput.selectionStart;
        const end = contentInput.selectionEnd;

        // 插入Tab字符
        contentInput.value = contentInput.value.substring(0, start) + '  ' + contentInput.value.substring(end);

        // 移动光标到Tab后
        contentInput.selectionStart = contentInput.selectionEnd = start + 2;
      }
    });

    // 点击外部关闭表单
    document.addEventListener('mousedown', (e) => {
      if (this.isOpen && this.element && !this.element.contains(e.target)) {
        // 点击自定义弹窗的时候不关闭表单
        if (e.target.closest('.form-alert-modal')) return;
        this.close();
      }
    });
  }

  /**
   * 打开创建任务表单
   * @param {string} defaultStatus 默认状态
   * @param {object} position 弹出位置
   */
  openCreate(defaultStatus = 'todo', position = { x: 100, y: 100 }) {
    this.currentTask = null;
    this.isOpen = true;

    // 重置表单
    this.element.querySelector('#taskname').value = '';
    this.element.querySelector('#taskcontent').value = '';
    this.element.querySelector('#taskType').value = defaultStatus;

    // 切换按钮显示
    this.element.querySelector('#submit').style.display = 'inline-block';
    this.element.querySelector('#update').style.display = 'none';
    this.element.querySelector('h3').textContent = '创建任务';

    // 重置指针事件，避免拖拽异常导致无法点击
    this.element.style.pointerEvents = 'auto';
    // 设置位置
    this.element.style.left = `${position.x}px`;
    this.element.style.top = `${position.y}px`;
    this.element.style.display = 'block';
    // 显示表单内容
    this.element.querySelector('.task-setting').style.display = 'inline-block';

    // 聚焦到标题输入框
    setTimeout(() => {
      this.element.querySelector('#taskname').focus();
    }, 0);
  }

  /**
   * 打开编辑任务表单
   * @param {Task} task 要编辑的任务
   * @param {object} position 弹出位置
   */
  openEdit(task, position = { x: 100, y: 100 }) {
    this.currentTask = task;
    this.isOpen = true;

    // 填充表单
    this.element.querySelector('#taskname').value = task.title;
    this.element.querySelector('#taskcontent').value = task.description;
    this.element.querySelector('#taskType').value = task.status;

    // 切换按钮显示
    this.element.querySelector('#submit').style.display = 'none';
    this.element.querySelector('#update').style.display = 'inline-block';
    this.element.querySelector('h3').textContent = '编辑任务';

    // 重置指针事件，避免拖拽异常导致无法点击
    this.element.style.pointerEvents = 'auto';
    // 设置位置
    this.element.style.left = `${position.x}px`;
    this.element.style.top = `${position.y}px`;
    this.element.style.display = 'block';
    // 显示表单内容
    this.element.querySelector('.task-setting').style.display = 'inline-block';

    // 聚焦到标题输入框
    setTimeout(() => {
      this.element.querySelector('#taskname').focus();
      this.element.querySelector('#taskname').select();
    }, 0);
  }

  /**
   * 关闭表单
   */
  close() {
    this.isOpen = false;
    this.currentTask = null;
    this.element.style.display = 'none';
    // 隐藏表单内容
    this.element.querySelector('.task-setting').style.display = 'none';
  }

  /**
   * 显示自定义提示弹窗（替代系统alert，避免iframe焦点问题）
   * @param {string} message 提示信息
   */
  showAlert(message) {
    const alertModal = createElement('div', {
      className: 'form-alert-modal',
      style: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '100000',
      },
    }, [
      createElement('div', {
        className: 'form-alert-content',
        style: {
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '1.5rem 2rem',
          minWidth: '250px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          textAlign: 'center',
        },
      }, [
        createElement('p', {
          style: {
            marginBottom: '1.5rem',
            fontSize: '1rem',
            color: 'var(--text)',
          },
        }, message),
        createElement('button', {
          className: 'alert-confirm-btn',
          style: {
            padding: '0.5rem 1.5rem',
            border: 'none',
            background: 'linear-gradient(135deg, var(--purple), #a78bfa)',
            color: 'white',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'all 0.2s ease',
          },
          onclick: () => {
            document.body.removeChild(alertModal);
            // 自动聚焦到标题输入框
            this.element.querySelector('#taskname').focus();
          },
        }, '确定'),
      ]),
    ]);

    document.body.appendChild(alertModal);

    // 点击背景关闭
    alertModal.addEventListener('click', (e) => {
      if (e.target === alertModal) {
        document.body.removeChild(alertModal);
        this.element.querySelector('#taskname').focus();
      }
    });

    // 按钮悬停效果
    const confirmBtn = alertModal.querySelector('.alert-confirm-btn');
    confirmBtn.addEventListener('mouseenter', () => {
      confirmBtn.style.transform = 'translateY(-1px)';
      confirmBtn.style.boxShadow = '0 4px 12px rgba(119, 132, 238, 0.3)';
    });
    confirmBtn.addEventListener('mouseleave', () => {
      confirmBtn.style.transform = 'translateY(0)';
      confirmBtn.style.boxShadow = 'none';
    });
  }

  /**
   * 处理创建提交
   */
  handleSubmit() {
    const title = this.element.querySelector('#taskname').value.trim();
    const description = this.element.querySelector('#taskcontent').value.trim();
    const status = this.element.querySelector('#taskType').value;

    const taskData = { title, description, status };

    if (!validateTaskData(taskData)) {
      this.showAlert('任务标题不能为空');
      return;
    }

    this.onSubmit(taskData);
    this.close();
  }

  /**
   * 处理更新提交
   */
  handleUpdate() {
    if (!this.currentTask) return;

    const title = this.element.querySelector('#taskname').value.trim();
    const description = this.element.querySelector('#taskcontent').value.trim();
    const status = this.element.querySelector('#taskType').value;

    const updateData = { title, description, status };

    if (!validateTaskData(updateData)) {
      this.showAlert('任务标题不能为空');
      return;
    }

    this.onUpdate(this.currentTask.id, updateData);
    this.close();
  }

  /**
   * 获取表单元素
   * @returns {HTMLElement} 表单元素
   */
  getElement() {
    return this.element;
  }

  /**
   * 更新状态选项
   * @param {object} statusTexts 新的状态文本映射
   */
  updateStatusOptions(statusTexts) {
    this.statusTexts = { ...statusTexts };
    const selectElement = this.element.querySelector('#taskType');
    const currentValue = selectElement.value;

    // 清空现有选项
    selectElement.innerHTML = '';

    // 添加新选项
    Object.entries(this.statusTexts).forEach(([value, text]) => {
      const option = createElement('option', { value }, text);
      selectElement.appendChild(option);
    });

    // 恢复之前选中的值
    selectElement.value = currentValue;
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
    this.isOpen = false;
  }
}

export default TaskForm;
