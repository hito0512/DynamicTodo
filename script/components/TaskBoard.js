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
    this.boardYear = null; // null = 全部
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
        onArchiveTask: (taskId) => this.handleArchiveTask(taskId),
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

    // 点击设置菜单外部时关闭
    document.addEventListener('click', (e) => {
      const wrapper = this.element?.querySelector('.settings-wrapper');
      if (wrapper && !wrapper.contains(e.target)) {
        this.closeSettingsMenu();
      }
    });
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
        createElement('button', {
          className: 'view-tab' + (this.activeView === 'archive' ? ' view-tab--active' : ''),
          onclick: () => this.switchView('archive'),
        }, '🗄️ 归档'),
        // 设置按钮（最右侧）
        createElement('div', {
          className: 'settings-wrapper',
          style: { position: 'relative', marginLeft: 'auto' },
        }, [
          createElement('button', {
            className: 'view-tab settings-btn',
            onclick: (e) => this.toggleSettingsMenu(e),
          }, '⚙️'),
          createElement('div', {
            className: 'settings-dropdown',
            style: {
              display: 'none', position: 'absolute', right: '0', top: '100%',
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: '100',
              minWidth: '140px', overflow: 'hidden',
            },
          }, [
            createElement('button', {
              style: {
                display: 'block', width: '100%', padding: '10px 16px', border: 'none',
                background: 'transparent', cursor: 'pointer', fontSize: '14px',
                textAlign: 'left', color: '#1e293b',
              },
              onclick: (e) => { e.stopPropagation(); this.handleExportData(); },
              onmouseenter: (e) => { e.target.style.background = '#f1f5f9'; },
              onmouseleave: (e) => { e.target.style.background = 'transparent'; },
            }, '📤 导出数据'),
            createElement('button', {
              style: {
                display: 'block', width: '100%', padding: '10px 16px', border: 'none',
                background: 'transparent', cursor: 'pointer', fontSize: '14px',
                textAlign: 'left', color: '#1e293b', borderTop: '1px solid #f1f3f5',
              },
              onclick: (e) => { e.stopPropagation(); this.handleImportData(); },
              onmouseenter: (e) => { e.target.style.background = '#f1f5f9'; },
              onmouseleave: (e) => { e.target.style.background = 'transparent'; },
            }, '📥 导入数据'),
          ]),
        ]),
      ]),
      // 看板内容区
      createElement('div', {
        className: 'view-content' + (this.activeView === 'board' ? '' : ' view-content--hidden'),
      }, [
        createElement('div', { className: 'board-toolbar', style: { padding: '12px 20px 0', display: 'flex', alignItems: 'center', gap: '8px' } }),
        createElement('div', { className: 'project-tasks' },
          Array.from(this.columns.values()).map(column => column.getElement())
        )
      ]),
      // 日历内容区
      createElement('div', {
        className: 'view-content' + (this.activeView === 'calendar' ? '' : ' view-content--hidden'),
      }, this.calendar.getElement()),
      // 归档面板
      createElement('div', {
        className: 'view-content' + (this.activeView === 'archive' ? '' : ' view-content--hidden'),
        id: 'archivePanel',
      }),
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
    const views = ['board', 'calendar', 'archive'];
    viewContents.forEach((el, index) => {
      el.classList.toggle('view-content--hidden', this.activeView !== views[index]);
    });

    const tabs = this.element.querySelectorAll('.view-tab');
    const tabViews = ['board', 'calendar', 'archive'];
    tabs.forEach((tab, index) => {
      if (index < tabViews.length) {
        tab.classList.toggle('view-tab--active', this.activeView === tabViews[index]);
      }
    });

    if (this.activeView === 'calendar') {
      this.calendar.refresh();
    } else if (this.activeView === 'archive') {
      this.renderArchivePanel();
    }
  }

  async loadTasks() {
    await this.taskStore.load();
    this.refreshBoardToolbar();
    this.renderAllTasks();
    this.calendar.refresh();
  }

  refreshBoardToolbar() {
    const years = this.getTaskYears();
    const container = this.element?.querySelector('.board-toolbar');
    if (!container) return;

    while (container.firstChild) container.removeChild(container.firstChild);

    if (!this.boardYear || (years.length > 0 && !years.includes(this.boardYear))) {
      this.boardYear = years[0] || null;
    }

    container.appendChild(
      createElement('span', { style: { fontSize: '14px', color: '#64748b' } }, '📅 按年筛选')
    );
    container.appendChild(
      createElement('select', {
        style: {
          padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: '6px',
          fontSize: '14px', background: 'white', cursor: 'pointer',
        },
        onchange: (e) => {
          this.boardYear = e.target.value ? parseInt(e.target.value) : null;
          this.renderAllTasks();
        },
      }, [
        createElement('option', { value: '', selected: this.boardYear === null }, '全部'),
        ...years.map(y =>
          createElement('option', {
            value: y,
            selected: y === this.boardYear,
          }, `${y} 年`)
        ),
      ])
    );
  }

  getTaskYears() {
    const years = this.taskStore.tasks
      .filter(t => !t.archived)
      .map(t => new Date(t.createdAt).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a);
  }

  renderAllTasks() {
    const yearFilter = this.boardYear;
    Object.values(TASK_STATUS).forEach(status => {
      let tasks = this.taskStore.getTasksByStatus(status);
      if (yearFilter) {
        tasks = tasks.filter(t => new Date(t.createdAt).getFullYear() === yearFilter);
      }
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

  async handleArchiveTask(taskId) {
    const success = await this.taskStore.archiveTask(taskId);
    if (success) {
      for (const column of this.columns.values()) {
        if (column.removeTask(taskId)) break;
      }
      this.calendar.refresh();
    }
  }

  async handleRestoreTask(taskId) {
    const success = await this.taskStore.restoreTask(taskId);
    if (success) {
      this.refreshBoardToolbar();
      this.renderAllTasks();
      this.calendar.refresh();
      this.renderArchivePanel();
    }
  }

  renderArchivePanel() {
    const panel = this.element.querySelector('#archivePanel');
    if (!panel) return;
    const archivedTasks = this.taskStore.getArchivedTasks();

    // 清空面板
    while (panel.firstChild) panel.removeChild(panel.firstChild);

    // 分隔未完成和其他归档
    const unfinishTasks = archivedTasks.filter(t => t.status === 'unfinish');
    const doneTasks = archivedTasks.filter(t => t.status !== 'unfinish');

    // ── 未完成归档区（按年选择）──
    const unfinishYears = [...new Set(unfinishTasks.map(t => new Date(t.createdAt).getFullYear()))]
      .sort((a, b) => b - a);

    if (!this.selectedUnfinishYear || !unfinishYears.includes(this.selectedUnfinishYear)) {
      this.selectedUnfinishYear = unfinishYears[0] || new Date().getFullYear();
    }

    const unfinishSection = createElement('div', {
      style: { borderBottom: '1px solid #f1f3f5' },
    }, [
      createElement('div', {
        style: {
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 20px',
        },
      }, [
        createElement('div', {
          style: { display: 'flex', alignItems: 'center', gap: '8px' },
        }, [
          createElement('h3', {
            style: { margin: '0', fontSize: '17px', fontWeight: '700', color: '#e53e3e' },
          }, `⏳ ${this.taskStore.getStatusText('unfinish')}归档`),
          createElement('span', {
            style: { fontSize: '13px', color: '#94a3b8' },
          }, `(${unfinishTasks.length})`),
        ]),
        unfinishYears.length > 0 ? createElement('select', {
          style: {
            padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: '6px',
            fontSize: '14px', background: 'white', cursor: 'pointer',
          },
          onchange: (e) => {
            this.selectedUnfinishYear = parseInt(e.target.value);
            this.renderArchivePanel();
          },
        }, unfinishYears.map(y =>
          createElement('option', {
            value: y,
            selected: y === this.selectedUnfinishYear,
          }, `${y} 年`)
        )) : null,
      ]),
      (() => {
        const filtered = unfinishTasks.filter(t =>
          new Date(t.createdAt).getFullYear() === this.selectedUnfinishYear
        );
        return filtered.length > 0
          ? createElement('div', {
              style: { padding: '0 20px 16px', display: 'flex', flexWrap: 'wrap', gap: '8px' },
            }, filtered.map(task => this.renderArchiveCard(task)))
          : createElement('div', {
              style: { textAlign: 'center', color: '#94a3b8', padding: '0 20px 16px', fontSize: '14px' },
            }, `${this.selectedUnfinishYear} 年暂无${this.taskStore.getStatusText('unfinish')}归档`);
      })(),
    ]);
    panel.appendChild(unfinishSection);

    // ── 已完成归档区（按年选择）──
    const years = [...new Set(doneTasks.map(t => new Date(t.createdAt).getFullYear()))]
      .sort((a, b) => b - a);

    if (!this.selectedArchiveYear || !years.includes(this.selectedArchiveYear)) {
      this.selectedArchiveYear = years[0] || new Date().getFullYear();
    }

    const doneHeader = createElement('div', {
      style: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 20px',
      },
    }, [
      createElement('div', {
        style: { display: 'flex', alignItems: 'center', gap: '8px' },
      }, [
        createElement('h3', {
          style: { margin: '0', fontSize: '17px', fontWeight: '700', color: '#1e293b' },
        }, `✅ ${this.taskStore.getStatusText('done')}归档`),
        createElement('span', {
          style: { fontSize: '13px', color: '#94a3b8' },
        }, `(${doneTasks.length})`),
      ]),
      years.length > 0 ? createElement('select', {
        style: {
          padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: '6px',
          fontSize: '14px', background: 'white', cursor: 'pointer',
        },
        onchange: (e) => {
          this.selectedArchiveYear = parseInt(e.target.value);
          this.renderArchivePanel();
        },
      }, years.map(y =>
        createElement('option', {
          value: y,
          selected: y === this.selectedArchiveYear,
        }, `${y} 年`)
      )) : null,
    ]);

    panel.appendChild(doneHeader);

    const filtered = doneTasks.filter(t =>
      new Date(t.createdAt).getFullYear() === this.selectedArchiveYear
    );

    if (filtered.length > 0) {
      panel.appendChild(createElement('div', {
        style: { padding: '0 20px 16px', display: 'flex', flexWrap: 'wrap', gap: '8px' },
      }, filtered.map(task => this.renderArchiveCard(task))));
    } else {
      panel.appendChild(createElement('div', {
        style: { textAlign: 'center', color: '#94a3b8', padding: '0 20px 16px', fontSize: '14px' },
      }, `${this.selectedArchiveYear} 年暂无${this.taskStore.getStatusText('done')}归档`));
    }

    if (archivedTasks.length === 0) {
      panel.appendChild(createElement('div', {
        style: {
          textAlign: 'center', color: '#94a3b8', padding: '60px 0',
          fontSize: '15px',
        },
      }, '暂无归档任务'));
    }
  }

  renderArchiveCard(task) {
    return createElement('div', {
      style: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', border: '1px solid #f1f3f5', borderRadius: '10px',
        background: '#fafbfc',
      },
    }, [
      createElement('div', { style: { flex: '1', minWidth: '0' } }, [
        createElement('div', {
          style: { fontSize: '15px', fontWeight: '600', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
        }, task.title),
        createElement('div', {
          style: { fontSize: '12px', color: '#94a3b8', marginTop: '3px' },
        }, `状态: ${this.taskStore.getStatusText(task.status)} · 创建: ${new Date(task.createdAt).toLocaleDateString()}`),
      ]),
      createElement('button', {
        style: {
          padding: '6px 16px', border: 'none', borderRadius: '8px',
          background: 'var(--status-done)', color: 'white', cursor: 'pointer',
          fontSize: '13px', fontWeight: '600', flexShrink: '0', marginLeft: '12px',
        },
        onclick: () => this.handleRestoreTask(task.id),
        onmouseenter: (e) => { e.target.style.background = '#059669'; },
        onmouseleave: (e) => { e.target.style.background = 'var(--status-done)'; },
      }, '恢复'),
    ]);
  }

  toggleSettingsMenu(e) {
    e.stopPropagation();
    const dropdown = this.element.querySelector('.settings-dropdown');
    const isOpen = dropdown.style.display !== 'none';
    dropdown.style.display = isOpen ? 'none' : 'block';
  }

  handleExportData() {
    const data = this.taskStore.exportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DynamicTodo_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.closeSettingsMenu();
  }

  handleImportData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const success = await this.taskStore.importData(data);
        if (success) {
          this.refreshBoardToolbar();
          this.renderAllTasks();
          this.calendar.refresh();
        } else {
          alert('导入失败：数据格式不正确');
        }
      } catch (err) {
        alert('导入失败：' + err.message);
      }
    };
    input.click();
    this.closeSettingsMenu();
  }

  closeSettingsMenu() {
    const dropdown = this.element.querySelector('.settings-dropdown');
    if (dropdown) dropdown.style.display = 'none';
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
