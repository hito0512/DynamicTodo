import { createElement } from '../utils/dom.js';

/**
 * 日历视图组件
 * 按开始日期分组任务，支持日期范围连接线
 */
class TaskCalendar {
  constructor(taskStore, callbacks = {}) {
    this.taskStore = taskStore;
    this.onEditTask = callbacks.onEditTask || (() => {});
    this.onPreviewTask = callbacks.onPreviewTask || (() => {});
    this.currentDate = new Date();
    this.currentDate.setDate(1);
    this.selectedDate = null;
    this.element = null;
    this.render();
  }

  render() {
    this.element = createElement('div', { className: 'calendar' }, [
      this.renderHeader(),
      this.renderWeekdays(),
      this.renderGrid(),
    ]);
  }

  renderHeader() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth() + 1;

    return createElement('div', { className: 'calendar__header' }, [
      createElement('button', {
        className: 'calendar__nav-btn',
        onclick: () => this.prevMonth(),
      }, '◀'),
      createElement('span', { className: 'calendar__title' },
        `${year} 年 ${month} 月`),
      createElement('button', {
        className: 'calendar__nav-btn',
        onclick: () => this.nextMonth(),
      }, '▶'),
      createElement('button', {
        className: 'calendar__today-btn',
        onclick: () => this.goToday(),
      }, '📅 今天'),
    ]);
  }

  renderWeekdays() {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return createElement('div', { className: 'calendar__weekdays' },
      weekdays.map(d => createElement('span', { className: 'calendar__weekday' }, d))
    );
  }

  dateKey(y, m, d) {
    return `${y}-${m}-${d}`;
  }

  tsKey(ts) {
    const d = new Date(ts);
    return this.dateKey(d.getFullYear(), d.getMonth(), d.getDate());
  }

  renderGrid() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const todayStr = this.dateKey(today.getFullYear(), today.getMonth(), today.getDate());

    // 构建按天索引：每个任务出现在它覆盖的每一天（含 range）
    const tasksByDay = {};
    this.taskStore.tasks.filter(t => !t.archived).forEach(task => {
      const startTs = task.startDate || task.createdAt;
      const endTs = task.endDate || startTs;
      const startKey = this.tsKey(startTs);

      let cursor = new Date(startTs);
      const endDate = new Date(endTs);
      while (cursor <= endDate) {
        const key = this.dateKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
        if (!tasksByDay[key]) tasksByDay[key] = [];
        tasksByDay[key].push({
          task,
          isStart: key === startKey,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
    });

    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(createElement('div', { className: 'calendar__day calendar__day--empty' }));
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const key = this.dateKey(year, month, d);
      const isToday = key === todayStr;
      const isSelected = this.selectedDate
        && this.selectedDate.year === year
        && this.selectedDate.month === month
        && this.selectedDate.day === d;

      const dayEntries = tasksByDay[key] || [];
      const dayClasses = ['calendar__day'];
      if (isToday) dayClasses.push('calendar__day--today');
      if (isSelected) dayClasses.push('calendar__day--selected');
      if (dayEntries.length === 0) dayClasses.push('calendar__day--empty-task');

      const maxVisible = 3;
      const visibleEntries = dayEntries.slice(0, maxVisible);
      const overflow = dayEntries.length - maxVisible;

      // 范围内每天都显示状态色线条，开始日显示标题，延续日只显示连接线
      const taskItems = visibleEntries.map(entry => {
        const { task, isStart } = entry;
        return createElement('div', {
          className: `calendar__task-item calendar__task-item--${task.status}${isStart ? '' : ' calendar__task-item--range'}`,
          onclick: (e) => {
            e.stopPropagation();
            this.onEditTask(task);
          },
          onmouseenter: (e) => this.onPreviewTask(task, e),
          onmouseleave: () => this.onPreviewTask(null),
        }, [
          isStart
            ? createElement('span', { className: 'calendar__task-title' }, task.title)
            : null,
        ]);
      });

      if (overflow > 0) {
        taskItems.push(
          createElement('div', { className: 'calendar__task-more' }, `+${overflow} 更多`)
        );
      }

      cells.push(createElement('div', {
        className: dayClasses.join(' '),
        onclick: () => this.selectDay(year, month, d),
      }, [
        createElement('span', { className: 'calendar__day-number' }, `${d}`),
        ...taskItems,
      ]));
    }

    return createElement('div', { className: 'calendar__grid' }, cells);
  }

  selectDay(year, month, day) {
    if (this.selectedDate
      && this.selectedDate.year === year
      && this.selectedDate.month === month
      && this.selectedDate.day === day) {
      this.selectedDate = null;
    } else {
      this.selectedDate = { year, month, day };
    }
    this.refresh();
  }

  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.selectedDate = null;
    this.refresh();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.selectedDate = null;
    this.refresh();
  }

  goToday() {
    const now = new Date();
    this.currentDate = new Date(now.getFullYear(), now.getMonth(), 1);
    this.selectedDate = { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
    this.refresh();
  }

  refresh() {
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }
    this.element.appendChild(this.renderHeader());
    this.element.appendChild(this.renderWeekdays());
    this.element.appendChild(this.renderGrid());
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

export default TaskCalendar;
