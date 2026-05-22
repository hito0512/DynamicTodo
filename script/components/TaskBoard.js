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
    this.filterTag = null;
    this.selectedUnfinishYear = undefined;
    this.selectedArchiveYear = undefined;
    this.selectedStatsYear = undefined;
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
        onTagClick: (tag) => { this.filterTag = this.filterTag === tag ? null : tag; this.renderAllTasks(); },
        onAddTag: (taskId, tag) => this.handleAddTag(taskId, tag),
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
      onCreateTask: (startDate) => this.handleAddTaskWithDate(startDate),
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
        createElement('button', {
          className: 'view-tab' + (this.activeView === 'archive' ? ' view-tab--active' : ''),
          onclick: () => this.switchView('archive'),
        }, '🗄️ 归档'),
        createElement('button', {
          className: 'view-tab' + (this.activeView === 'stats' ? ' view-tab--active' : ''),
          onclick: () => this.switchView('stats'),
        }, '📊 统计'),
        createElement('button', {
          className: 'view-tab' + (this.activeView === 'tags' ? ' view-tab--active' : ''),
          onclick: () => this.switchView('tags'),
        }, '🏷️ 标签'),
        // 设置面板标签（最右侧）
        createElement('button', {
          className: 'view-tab' + (this.activeView === 'settings' ? ' view-tab--active' : ''),
          style: { marginLeft: 'auto' },
          onclick: () => this.switchView('settings'),
        }, '⚙️ 设置'),
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
      // 统计面板
      createElement('div', {
        className: 'view-content' + (this.activeView === 'stats' ? '' : ' view-content--hidden'),
        id: 'statsPanel',
      }),
      // 标签面板
      createElement('div', {
        className: 'view-content' + (this.activeView === 'tags' ? '' : ' view-content--hidden'),
        id: 'tagsPanel',
      }),
      // 设置面板
      createElement('div', {
        className: 'view-content' + (this.activeView === 'settings' ? '' : ' view-content--hidden'),
        id: 'settingsPanel',
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
    const views = ['board', 'calendar', 'archive', 'stats', 'tags', 'settings'];
    viewContents.forEach((el, index) => {
      el.classList.toggle('view-content--hidden', this.activeView !== views[index]);
    });

    const tabs = this.element.querySelectorAll('.view-tab');
    const tabViews = ['board', 'calendar', 'archive', 'stats', 'tags', 'settings'];
    tabs.forEach((tab, index) => {
      if (index < tabViews.length) {
        tab.classList.toggle('view-tab--active', this.activeView === tabViews[index]);
      }
    });

    if (this.activeView === 'board') {
      this.renderAllTasks();
    } else if (this.activeView === 'calendar') {
      this.calendar.refresh();
    } else if (this.activeView === 'archive') {
      this.renderArchivePanel();
    } else if (this.activeView === 'stats') {
      this.renderStatsPanel();
    } else if (this.activeView === 'tags') {
      this.renderTagsPanel();
    } else if (this.activeView === 'settings') {
      this.renderSettingsPanel();
    }
  }

  async loadTasks() {
    await this.taskStore.load();
    // 首次加载时默认显示最近一年
    if (this.boardYear === null) {
      const years = this.getTaskYears();
      this.boardYear = years[0] || null;
    }
    this.refreshBoardToolbar();
    this.renderAllTasks();
    this.calendar.refresh();
  }

  refreshBoardToolbar() {
    const years = this.getTaskYears();
    const container = this.element?.querySelector('.board-toolbar');
    if (!container) return;

    while (container.firstChild) container.removeChild(container.firstChild);

    // 仅当当前选中的年份在数据中不存在时自动切换
    if (this.boardYear !== null && years.length > 0 && !years.includes(this.boardYear)) {
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

    // 标签筛选
    container.appendChild(
      createElement('span', { style: { fontSize: '14px', color: '#64748b', marginLeft: '12px' } }, '🏷️ 标签')
    );
    const tagInput = createElement('input', {
      type: 'text',
      placeholder: '输入标签筛选...',
      style: {
        padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: '6px',
        fontSize: '14px', background: 'white', outline: 'none', width: '130px',
      },
      oninput: (e) => {
        this.filterTag = e.target.value.trim() || null;
        this.renderAllTasks();
      },
    });
    container.appendChild(tagInput);
    if (this.filterTag) tagInput.value = this.filterTag;

    // 常用标签（可拖拽到任务卡片上）
    const commonTags = this.getCommonTags();
    if (commonTags.length > 0) {
      container.appendChild(
        createElement('span', { style: { fontSize: '13px', color: '#94a3b8', marginLeft: '12px' } }, '🔥')
      );
      commonTags.forEach(({ tag, count }) => {
        const chip = createElement('span', {
          draggable: true,
          title: `拖拽到任务卡片上即可添加标签「${tag}」`,
          style: {
            display: 'inline-flex', alignItems: 'center', gap: '3px',
            padding: '2px 8px', borderRadius: '4px', fontSize: '12px',
            background: 'var(--status-todo)', color: '#ffffff', fontWeight: '600',
            cursor: 'grab', userSelect: 'none', whiteSpace: 'nowrap',
            transition: 'opacity 0.15s ease',
            opacity: '0.85',
          },
          onmouseenter: (e) => { e.target.style.opacity = '1'; },
          onmouseleave: (e) => { e.target.style.opacity = '0.85'; },
          ondragstart: (e) => {
            e.dataTransfer.setData('application/x-tag', tag);
            e.dataTransfer.effectAllowed = 'copy';
          },
        }, [`#${tag}`, createElement('span', { style: { fontSize: '10px', opacity: '0.7' } }, `${count}`)]);
        container.appendChild(chip);
      });
    }
  }

  getCommonTags() {
    const tagCount = new Map();
    this.taskStore.tasks.filter(t => !t.archived).forEach(task => {
      (task.tags || []).forEach(tag => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    });
    return [...tagCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag, count]) => ({ tag, count }));
  }
  getTaskYears() {
    const years = this.taskStore.tasks
      .filter(t => !t.archived)
      .map(t => new Date(t.startDate || t.createdAt).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a);
  }

  renderAllTasks() {
    const yearFilter = this.boardYear;
    const tagFilter = this.filterTag;
    Object.values(TASK_STATUS).forEach(status => {
      let tasks = this.taskStore.getTasksByStatus(status);
      if (yearFilter) {
        tasks = tasks.filter(t => new Date(t.startDate || t.createdAt).getFullYear() === yearFilter);
      }
      if (tagFilter) {
        tasks = tasks.filter(t => t.tags && t.tags.includes(tagFilter));
      }
      const column = this.columns.get(status);
      column.setTasks(tasks);
    });
    this.updateFilterIndicator();
  }

  updateFilterIndicator() {
    const container = this.element?.querySelector('.board-toolbar');
    if (!container) return;
    // 清除旧的筛选指示
    const existing = container.querySelector('.tag-filter-indicator');
    if (existing) existing.remove();

    if (this.filterTag) {
      const indicator = createElement('div', {
        className: 'tag-filter-indicator',
        style: {
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '2px 10px', borderRadius: '6px', fontSize: '13px',
          background: 'var(--status-todo)', color: '#ffffff', fontWeight: '600',
        },
      }, [
        createElement('span', {}, `#${this.filterTag}`),
        createElement('button', {
          style: {
            background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer',
            fontSize: '14px', padding: '0 0 0 4px', lineHeight: '1',
            opacity: '0.8',
          },
          onclick: () => { this.filterTag = null; this.renderAllTasks(); },
          onmouseenter: (e) => { e.target.style.opacity = '1'; },
          onmouseleave: (e) => { e.target.style.opacity = '0.8'; },
        }, '×'),
      ]);
      container.appendChild(indicator);
    }
  }

  handleAddTask(status) {
    const position = {
      x: Math.max(0, (window.innerWidth - 420) / 2),
      y: Math.max(0, (window.innerHeight - 480) / 2),
    };
    this.taskForm.openCreate(status, position);
  }

  handleAddTaskWithDate(startDate) {
    const position = {
      x: Math.max(0, (window.innerWidth - 420) / 2),
      y: Math.max(0, (window.innerHeight - 480) / 2),
    };
    this.taskForm.openCreate('todo', position, startDate);
  }

  handleEditTask(task) {
    try {
      const position = {
        x: Math.max(0, (window.innerWidth - 420) / 2),
        y: Math.max(0, (window.innerHeight - 480) / 2),
      };
      this.taskForm.openEdit(task, position);
    } catch (err) {
      console.error('编辑任务异常:', err);
      alert('编辑失败：' + err.message);
    }
  }

  async handleDeleteTask(taskId) {
    try {
      const success = await this.taskStore.deleteTask(taskId);
      if (success) {
        for (const column of this.columns.values()) {
          if (column.removeTask(taskId)) break;
        }
        this.calendar.refresh();
      }
    } catch (err) {
      alert(err.message);
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
    try {
      const newTask = await this.taskStore.addTask(taskData);
      if (newTask) {
        const column = this.columns.get(newTask.status);
        column.addTask(newTask);
        this.calendar.refresh();
      }
    } catch (err) {
      alert(err.message);
    }
  }

  async handleFormUpdate(taskId, updateData) {
    try {
      await this.taskStore.updateTask(taskId, updateData);
      this.renderAllTasks();
      this.calendar.refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  getElement() { return this.element; }

  getColumnElements() {
    return Array.from(this.columns.values()).map(column => column.getElement());
  }

  async handleTaskDrop(taskId, newStatus, taskIds) {
    try {
      const success = await this.taskStore.updateTaskOrder(taskId, newStatus, taskIds);
      if (success) this.renderAllTasks();
    } catch (err) {
      alert(err.message);
    }
  }

  async handleStatusTextUpdate(status, newText) {
    await this.taskStore.saveStatusText(status, newText);
    const column = this.columns.get(status);
    if (column) column.updateTitle(newText);
    this.taskForm.updateStatusOptions(this.taskStore.getStatusTexts());
    this.renderAllTasks();
  }

  async handleArchiveTask(taskId) {
    try {
      const success = await this.taskStore.archiveTask(taskId);
      if (success) {
        for (const column of this.columns.values()) {
          if (column.removeTask(taskId)) break;
        }
        this.calendar.refresh();
      }
    } catch (err) {
      alert(err.message);
    }
  }

  async handleAddTag(taskId, tag) {
    try {
      await this.taskStore.updateTask(taskId, {
        tags: [...new Set([...(this.taskStore.tasks.find(t => t.id === taskId)?.tags || []), tag])],
      });
      this.renderAllTasks();
      this.refreshBoardToolbar();
    } catch (err) {
      alert(err.message);
    }
  }

  showRestoreOptions(task) {
    const overlay = createElement('div', {
      style: {
        position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
        background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: '99999',
      },
      onclick: (e) => { if (e.target === overlay) document.body.removeChild(overlay); },
    }, [
      createElement('div', {
        style: {
          background: '#ffffff', borderRadius: '14px', width: '360px',
          boxShadow: '0 25px 80px rgba(0,0,0,0.25)', overflow: 'hidden',
        },
      }, [
        // 顶部色条
        createElement('div', {
          style: { height: '3px', background: 'var(--status-done)', width: '100%' },
        }),
        // 内容区
        createElement('div', { style: { padding: '10px 16px 8px' } }, [
          createElement('div', {
            style: { fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '10px', lineHeight: '1.3' },
          }, task.title),
          createElement('div', {
            style: { display: 'flex', gap: '8px' },
          }, [
            createElement('button', {
              title: '任务回到看板，保持原有状态和日期',
              style: {
                flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '4px', padding: '8px 12px', border: '1.5px solid #e2e8f0',
                borderRadius: '8px', background: '#ffffff', cursor: 'pointer',
                fontSize: '13px', fontWeight: '600', color: '#0f172a',
                transition: 'all 0.15s ease',
              },
              onclick: () => {
                document.body.removeChild(overlay);
                this.handleRestoreTask(task.id);
              },
              onmouseenter: (e) => { e.currentTarget.style.borderColor = 'var(--status-done)'; e.currentTarget.style.background = '#f0fdf4'; },
              onmouseleave: (e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#ffffff'; },
            }, '🔄 恢复原样'),
            createElement('button', {
              title: '复制内容创建新任务，日期设为今天',
              style: {
                flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '4px', padding: '8px 12px', border: 'none',
                borderRadius: '8px', background: 'var(--status-todo)', cursor: 'pointer',
                fontSize: '13px', fontWeight: '600', color: '#ffffff',
                transition: 'all 0.15s ease',
              },
              onclick: () => {
                document.body.removeChild(overlay);
                this.handleRestoreAsNew(task);
              },
              onmouseenter: (e) => { e.currentTarget.style.background = '#2563eb'; },
              onmouseleave: (e) => { e.currentTarget.style.background = 'var(--status-todo)'; },
            }, '➕ 新建（今天）'),
          ]),  // close buttons div
        ]),  // close content div
        // 底部取消
        createElement('div', {
          style: {
            padding: '4px 16px 10px', borderTop: '1px solid #f1f3f5',
            textAlign: 'center',
          },
        }, [
          createElement('button', {
            style: {
              padding: '6px 16px', border: 'none', borderRadius: '6px',
              background: 'transparent', cursor: 'pointer',
              fontSize: '13px', color: '#94a3b8', fontWeight: '500',
            },
            onclick: () => document.body.removeChild(overlay),
            onmouseenter: (e) => { e.target.style.color = '#475569'; },
            onmouseleave: (e) => { e.target.style.color = '#94a3b8'; },
          }, '取消'),
        ]),
      ]),  // close modal div
    ]);  // close overlay array
    document.body.appendChild(overlay);
  }

  async handleRestoreTask(taskId) {
    try {
      const success = await this.taskStore.restoreTask(taskId);
      if (success) {
        this.refreshBoardToolbar();
        this.renderAllTasks();
        this.calendar.refresh();
        this.renderArchivePanel();
      }
    } catch (err) {
      alert(err.message);
    }
  }

  async handleRestoreAsNew(task) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newTask = await this.taskStore.addTask({
        title: task.title,
        description: task.description,
        status: 'todo',
        startDate: today.getTime(),
        endDate: null,
        archived: false,
      });
      if (newTask) {
        // 删除原归档任务
        await this.taskStore.deleteTask(task.id);
        const column = this.columns.get('todo');
        if (column) column.addTask(newTask);
        this.calendar.refresh();
        this.renderArchivePanel();
      }
    } catch (err) {
      alert(err.message);
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
    const unfinishYears = [...new Set(unfinishTasks.map(t => new Date(t.startDate || t.createdAt).getFullYear()))]
      .sort((a, b) => b - a);

    if (this.selectedUnfinishYear === undefined || (this.selectedUnfinishYear !== null && !unfinishYears.includes(this.selectedUnfinishYear))) {
      this.selectedUnfinishYear = unfinishYears[0] ?? null;
    }

    const unfinishFiltered = this.selectedUnfinishYear
      ? unfinishTasks.filter(t =>
          new Date(t.startDate || t.createdAt).getFullYear() === this.selectedUnfinishYear
        )
      : unfinishTasks;

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
          }, `(${unfinishFiltered.length})`),
        ]),
        unfinishYears.length > 0 ? createElement('select', {
          style: {
            padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: '6px',
            fontSize: '14px', background: 'white', cursor: 'pointer',
          },
          onchange: (e) => {
            this.selectedUnfinishYear = e.target.value ? parseInt(e.target.value) : null;
            this.renderArchivePanel();
          },
        }, [
          createElement('option', { value: '', selected: this.selectedUnfinishYear === null }, '全部'),
          ...unfinishYears.map(y =>
            createElement('option', {
              value: y,
              selected: y === this.selectedUnfinishYear,
            }, `${y} 年`)
          ),
        ]) : null,
      ]),
      (() => {
        const filtered = unfinishFiltered;
        return filtered.length > 0
          ? createElement('div', {
              style: { padding: '0 20px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px', alignItems: 'stretch' },
            }, filtered.map(task => this.renderArchiveCard(task)))
          : createElement('div', {
              style: { textAlign: 'center', color: '#94a3b8', padding: '0 20px 16px', fontSize: '14px' },
            }, this.selectedUnfinishYear
              ? `${this.selectedUnfinishYear} 年暂无${this.taskStore.getStatusText('unfinish')}归档`
              : `暂无${this.taskStore.getStatusText('unfinish')}归档`);
      })(),
    ]);
    panel.appendChild(unfinishSection);

    // ── 已完成归档区（按年选择）──
    const years = [...new Set(doneTasks.map(t => new Date(t.startDate || t.createdAt).getFullYear()))]
      .sort((a, b) => b - a);

    if (this.selectedArchiveYear === undefined || (this.selectedArchiveYear !== null && !years.includes(this.selectedArchiveYear))) {
      this.selectedArchiveYear = years[0] ?? null;
    }

    const doneFiltered = this.selectedArchiveYear
      ? doneTasks.filter(t =>
          new Date(t.startDate || t.createdAt).getFullYear() === this.selectedArchiveYear
        )
      : doneTasks;

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
        }, `(${doneFiltered.length})`),
      ]),
      years.length > 0 ? createElement('select', {
        style: {
          padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: '6px',
          fontSize: '14px', background: 'white', cursor: 'pointer',
        },
        onchange: (e) => {
          this.selectedArchiveYear = e.target.value ? parseInt(e.target.value) : null;
          this.renderArchivePanel();
        },
      }, [
        createElement('option', { value: '', selected: this.selectedArchiveYear === null }, '全部'),
        ...years.map(y =>
          createElement('option', {
            value: y,
            selected: y === this.selectedArchiveYear,
          }, `${y} 年`)
        ),
      ]) : null,
    ]);

    panel.appendChild(doneHeader);

    if (doneFiltered.length > 0) {
      panel.appendChild(createElement('div', {
        style: { padding: '0 20px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px', alignItems: 'stretch' },
      }, doneFiltered.map(task => this.renderArchiveCard(task))));
    } else {
      panel.appendChild(createElement('div', {
        style: { textAlign: 'center', color: '#94a3b8', padding: '0 20px 16px', fontSize: '14px' },
      }, this.selectedArchiveYear
        ? `${this.selectedArchiveYear} 年暂无${this.taskStore.getStatusText('done')}归档`
        : `暂无${this.taskStore.getStatusText('done')}归档`));
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
    const statusColor = {
      todo: 'var(--status-todo)',
      doing: 'var(--status-doing)',
      done: 'var(--status-done)',
      unfinish: 'var(--status-unfinish)',
    }[task.status] || 'var(--border)';

    return createElement('div', {
      style: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', border: '1px solid #e5e7eb',
        borderLeft: `3px solid ${statusColor}`,
        borderRadius: '10px', background: '#ffffff',
        transition: 'all 0.2s ease',
      },
      onmouseenter: (e) => { e.currentTarget.style.borderColor = statusColor; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; },
      onmouseleave: (e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; },
    }, [
      createElement('div', { style: { flex: '1', minWidth: '0' } }, [
        createElement('div', {
          style: { fontSize: '15px', fontWeight: '700', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
        }, task.title),
        createElement('div', {
          style: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' },
        }, [
          createElement('span', {
            style: {
              fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px',
              background: statusColor + '18', color: statusColor, border: `1px solid ${statusColor}40`,
              textTransform: 'uppercase', letterSpacing: '0.5px',
            },
          }, this.taskStore.getStatusText(task.status)),
          createElement('span', {
            style: { fontSize: '12px', color: '#94a3b8' },
          }, `📅 ${new Date(task.startDate || task.createdAt).toLocaleDateString()}`),
        ]),
      ]),
      createElement('button', {
        style: {
          padding: '7px 18px', border: 'none', borderRadius: '8px',
          background: statusColor, color: 'white', cursor: 'pointer',
          fontSize: '13px', fontWeight: '600', flexShrink: '0', marginLeft: '12px',
          transition: 'all 0.15s ease',
        },
        onclick: () => this.showRestoreOptions(task),
        onmouseenter: (e) => { e.target.style.filter = 'brightness(1.1)'; e.target.style.transform = 'translateY(-1px)'; },
        onmouseleave: (e) => { e.target.style.filter = 'none'; e.target.style.transform = 'none'; },
      }, '恢复'),
    ]);
  }

  /******** 统计面板 ********/

  renderStatsPanel() {
    const panel = this.element.querySelector('#statsPanel');
    if (!panel) return;
    while (panel.firstChild) panel.removeChild(panel.firstChild);

    const allTasks = this.taskStore.tasks;

    // 年份筛选
    const years = [...new Set(allTasks.map(t => new Date(t.startDate || t.createdAt).getFullYear()))]
      .sort((a, b) => b - a);

    if (this.selectedStatsYear === undefined || (this.selectedStatsYear !== null && !years.includes(this.selectedStatsYear))) {
      this.selectedStatsYear = years[0] ?? null;
    }

    const filteredTasks = this.selectedStatsYear
      ? allTasks.filter(t => new Date(t.startDate || t.createdAt).getFullYear() === this.selectedStatsYear)
      : allTasks;

    const activeTasks = filteredTasks.filter(t => !t.archived);
    const archivedTasks = filteredTasks.filter(t => t.archived);

    const totalTasks = filteredTasks.length;
    const totalActive = activeTasks.length;
    const totalArchived = archivedTasks.length;
    // 已完成 = 所有状态为 done 的任务（含归档）
    const doneCount = filteredTasks.filter(t => t.status === 'done').length;
    const todoCount = activeTasks.filter(t => t.status === 'todo').length;
    const doingCount = activeTasks.filter(t => t.status === 'doing').length;
    const unfinishCount = filteredTasks.filter(t => t.status === 'unfinish').length;

    const container = createElement('div', { style: { padding: '24px', maxWidth: '1200px', margin: '0 auto' } });

    // 年份选择器
    const headerRow = createElement('div', {
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    }, [
      createElement('h2', {
        style: { margin: '0', fontSize: '20px', fontWeight: '700', color: '#1e293b' },
      }, '📊 统计'),
      years.length > 0 ? createElement('select', {
        style: {
          padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '8px',
          fontSize: '14px', background: 'white', cursor: 'pointer',
        },
        onchange: (e) => {
          this.selectedStatsYear = e.target.value ? parseInt(e.target.value) : null;
          this.renderStatsPanel();
        },
      }, [
        createElement('option', { value: '', selected: this.selectedStatsYear === null }, '全部'),
        ...years.map(y =>
          createElement('option', {
            value: y,
            selected: y === this.selectedStatsYear,
          }, `${y} 年`)
        ),
      ]) : null,
    ]);
    container.appendChild(headerRow);

    // 概览统计卡片
    const cardGrid = createElement('div', {
      style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
    }, [
      this.createStatCard('📋 总任务', totalTasks, '#3b82f6'),
      this.createStatCard('📖 ' + this.taskStore.getStatusText('todo'), todoCount, '#3b82f6'),
      this.createStatCard('🚴 ' + this.taskStore.getStatusText('doing'), doingCount, '#f59e0b'),
      this.createStatCard('✅ ' + this.taskStore.getStatusText('done'), doneCount, '#10b981'),
      this.createStatCard('⏳ ' + this.taskStore.getStatusText('unfinish'), unfinishCount, '#ef4444'),
      this.createStatCard('🗄️ 已归档', totalArchived, '#64748b'),
    ]);
    container.appendChild(cardGrid);

    // 状态分布进度条（基于活跃任务）
    const progressSection = createElement('div', {
      style: {
        background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
        padding: '20px 24px',
      },
    }, [
      createElement('h3', {
        style: { margin: '0 0 16px', fontSize: '17px', fontWeight: '700', color: '#1e293b' },
      }, '📊 任务状态分布'),
      createElement('div', {
        style: { display: 'flex', flexDirection: 'column', gap: '12px' },
      }, [
        this.createProgressBar('📖 ' + this.taskStore.getStatusText('todo'), todoCount, totalTasks, 'var(--status-todo)'),
        this.createProgressBar('🚴 ' + this.taskStore.getStatusText('doing'), doingCount, totalTasks, 'var(--status-doing)'),
        this.createProgressBar('✅ ' + this.taskStore.getStatusText('done'), doneCount, totalTasks, 'var(--status-done)'),
        this.createProgressBar('⏳ ' + this.taskStore.getStatusText('unfinish'), unfinishCount, totalTasks, 'var(--status-unfinish)'),
      ]),
    ]);
    container.appendChild(progressSection);

    panel.appendChild(container);
  }

  createStatCard(label, count, color) {
    return createElement('div', {
      style: {
        padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0',
        background: '#ffffff', textAlign: 'center',
      },
    }, [
      createElement('div', {
        style: { fontSize: '13px', color: '#64748b', marginBottom: '8px' },
      }, label),
      createElement('div', {
        style: { fontSize: '32px', fontWeight: '700', color },
      }, String(count)),
    ]);
  }

  createProgressBar(label, count, total, color) {
    const pct = total > 0 ? (count / total * 100) : 0;
    return createElement('div', {
      style: {
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '10px 0',
      },
    }, [
      createElement('span', {
        style: { width: '120px', fontSize: '14px', fontWeight: '600', color: '#1e293b', flexShrink: 0 },
      }, label),
      createElement('div', {
        style: {
          flex: '1', height: '22px', borderRadius: '11px',
          background: '#f1f5f9', overflow: 'hidden',
        },
      }, [
        createElement('div', {
          style: {
            width: `${pct}%`, height: '100%', borderRadius: '11px',
            background: color, transition: 'width 0.3s ease',
          },
        }),
      ]),
      createElement('span', {
        style: { width: '40px', textAlign: 'right', fontSize: '14px', fontWeight: '700', color },
      }, String(count)),
    ]);
  }

  /******** 标签面板 ********/

  renderTagsPanel() {
    const panel = this.element.querySelector('#tagsPanel');
    if (!panel) return;
    while (panel.firstChild) panel.removeChild(panel.firstChild);

    // 收集所有标签
    const tagMap = new Map();
    this.taskStore.tasks.filter(t => !t.archived).forEach(task => {
      (task.tags || []).forEach(tag => {
        if (!tagMap.has(tag)) tagMap.set(tag, []);
        tagMap.get(tag).push(task);
      });
    });

    const sortedTags = [...tagMap.entries()].sort((a, b) => b[1].length - a[1].length);

    const container = createElement('div', { style: { padding: '24px', maxWidth: '1200px', margin: '0 auto' } });

    container.appendChild(createElement('h2', {
      style: { margin: '0 0 20px', fontSize: '20px', fontWeight: '700', color: '#1e293b' },
    }, '🏷️ 标签分类'));

    if (sortedTags.length === 0) {
      container.appendChild(createElement('div', {
        style: { textAlign: 'center', color: '#94a3b8', padding: '60px 0', fontSize: '15px' },
      }, '暂无标签，在编辑任务时添加标签'));
    } else {
      const tagGrid = createElement('div', {
        style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' },
      });

      sortedTags.forEach(([tag, tasks]) => {
        const statusColors = { todo: '#3b82f6', doing: '#f59e0b', done: '#10b981', unfinish: '#ef4444' };
        tagGrid.appendChild(createElement('div', {
          style: {
            padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0',
            background: '#ffffff', cursor: 'pointer',
            transition: 'all 0.15s ease',
          },
          onmouseenter: (e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#94a3b8'; },
          onmouseleave: (e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; },
          onclick: () => this.filterByTag(tag),
        }, [
          createElement('div', {
            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' },
          }, [
            createElement('span', {
              style: { fontSize: '16px', fontWeight: '700', color: '#0f172a' },
            }, `#${tag}`),
            createElement('span', {
              style: { fontSize: '13px', color: '#64748b', fontWeight: '600' },
            }, `${tasks.length} 个任务`),
          ]),
          createElement('div', {
            style: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
          }, [
            ...Object.entries(
              tasks.reduce((acc, t) => {
                acc[t.status] = (acc[t.status] || 0) + 1;
                return acc;
              }, {})
            ).map(([status, count]) =>
              createElement('span', {
                style: {
                  fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px',
                  background: statusColors[status] + '18', color: statusColors[status],
                },
              }, `${count}${({todo: '📖', doing: '🚴', done: '✅', unfinish: '⏳'})[status] || ''}`)
            ),
          ]),
        ]));
      });

      container.appendChild(tagGrid);
    }

    panel.appendChild(container);
  }

  filterByTag(tag) {
    this.filterTag = this.filterTag === tag ? null : tag;
    this.switchView('board');
    this.renderAllTasks();
  }

  renderSettingsPanel() {
    const panel = this.element.querySelector('#settingsPanel');
    if (!panel || panel.dataset.rendered) return;
    panel.dataset.rendered = 'true';

    panel.innerHTML = `
      <div style="padding:20px;max-width:600px;">
        <h3 style="margin:0 0 8px;font-size:16px;color:#1e293b;">⚙️ 设置</h3>
        <p style="font-size:13px;color:#64748b;margin:0 0 20px;line-height:1.5;">
          所有任务数据存储在挂件块的属性中，导出为 JSON 可备份或迁移到其他挂件。
        </p>

        <!-- 导出数据 -->
        <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:12px;">
          <div style="font-size:14px;font-weight:600;color:#1e293b;margin-bottom:4px;">📤 导出数据</div>
          <p style="font-size:13px;color:#64748b;margin:0 0 8px;">将所有任务导出为 JSON 文件。</p>
          <button id="settingsExportBtn"
            style="padding:8px 16px;border:1px solid #e2e8f0;border-radius:6px;background:#fff;cursor:pointer;font-size:14px;color:#1e293b;">导出 JSON</button>
        </div>

        <!-- 导入数据 -->
        <div style="background:#f8fafc;border-radius:8px;padding:16px;">
          <div style="font-size:14px;font-weight:600;color:#1e293b;margin-bottom:4px;">📥 导入数据</div>
          <p style="font-size:13px;color:#64748b;margin:0 0 8px;">从 JSON 文件导入任务（按标题去重）。</p>
          <button id="settingsImportBtn"
            style="padding:8px 16px;border:1px solid #e2e8f0;border-radius:6px;background:#fff;cursor:pointer;font-size:14px;color:#1e293b;">导入 JSON</button>
        </div>
      </div>
    `;

    // 导出
    panel.querySelector('#settingsExportBtn').onclick = () => {
      const data = this.taskStore.exportData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DynamicTodo_export_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };

    // 导入
    panel.querySelector('#settingsImportBtn').onclick = () => {
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
    };
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
