/**
 * 全局常量配置
 */

// 任务状态
export const TASK_STATUS = {
  TODO: 'todo',
  DOING: 'doing',
  DONE: 'done',
  UNFINISH: 'unfinish',
};

// 任务状态对应的显示文本
export const STATUS_TEXT = {
  [TASK_STATUS.TODO]: '计划中',
  [TASK_STATUS.DOING]: '进行中',
  [TASK_STATUS.DONE]: '已完成',
  [TASK_STATUS.UNFINISH]: '未完成',
};

// 任务状态对应的列ID
export const STATUS_COLUMN_ID = {
  [TASK_STATUS.TODO]: 'project-todo',
  [TASK_STATUS.DOING]: 'project-doing',
  [TASK_STATUS.DONE]: 'project-done',
  [TASK_STATUS.UNFINISH]: 'project-unfinish',
};

// CSS选择器常量
export const SELECTORS = {
  TASK_BOARD: '.project-tasks',
  TASK_COLUMN: '.project-column',
  TASK_CARD: '.task',
  ADD_TASK_BTN: '#appendTask',
  TASK_FORM: '#addTask',
  TASK_FORM_SUBMIT: '#submit',
  TASK_FORM_UPDATE: '#update',
  TASK_FORM_TITLE: '#taskname',
  TASK_FORM_CONTENT: '#taskcontent',
  TASK_FORM_STATUS: '#taskType',
  TASK_PREVIEW: '#taskPreview',
};

// UI常量
export const UI_CONSTANTS = {
  PREVIEW_OFFSET_X: 20,
  PREVIEW_OFFSET_Y: 30,
  PREVIEW_MAX_WIDTH: 320,
  TASK_DRAG_HANDLE: '.task__tags',
};

// 安全配置
export const SECURITY = {
  // XSS过滤允许的标签
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 'del', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'code', 'pre', 'blockquote', 'hr', 'img'
  ],
  // 允许的标签属性
  ALLOWED_ATTRIBUTES: {
    'a': ['href', 'title', 'target'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
  },
  // 允许的链接协议
  ALLOWED_PROTOCOLS: ['http:', 'https:', 'siyuan:'],
};

// 日期格式
export const DATE_FORMATS = {
  FULL: 'YYYY-MM-DD HH:mm:ss',
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm',
  SIMPLE: 'MM-DD HH:mm',
};
