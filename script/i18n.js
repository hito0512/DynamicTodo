/**
 * 界面文案（中/英）
 *
 * 默认中文；当思源界面语言不是中文时自动使用英文，界面内不提供语言切换。
 * 用法：t('看板视图')、t('{0} 年', 2026)
 * 词表以中文原文为键，新增文案时同步补充下方 EN 表。
 */

const EN = {
  // 视图标签
  '📋 看板视图': '📋 Board',
  '📅 日历': '📅 Calendar',
  '🗄️ 归档': '🗄️ Archive',
  '📊 统计': '📊 Stats',
  '🏷️ 标签': '🏷️ Tags',
  '⚙️ 设置': '⚙️ Settings',

  // 看板工具栏
  '📅 按年筛选': '📅 Filter by year',
  '全部': 'All',
  '{0} 年': '{0}',
  '输入标签筛选...': 'Filter by tag...',
  '拖拽到任务卡片上即可添加标签「{0}」': 'Drag onto a task card to add tag "{0}"',
  '编辑失败：{0}': 'Failed to save: {0}',

  // 归档
  '任务回到看板，保持原有状态和日期': 'Move back to the board, keeping status and dates',
  '🔄 恢复原样': '🔄 Restore',
  '复制内容创建新任务，日期设为今天': 'Create a new task from this copy, dated today',
  '➕ 新建（今天）': '➕ New (today)',
  '取消': 'Cancel',
  '⏳ {0}归档': '⏳ Archived: {0}',
  '✅ {0}归档': '✅ Archived: {0}',
  '{0} 年暂无{1}归档': 'No archived {1} in {0}',
  '暂无{0}归档': 'No archived {0}',
  '暂无归档任务': 'No archived tasks',
  '恢复': 'Restore',

  // 统计
  '📋 总任务': '📋 Total',
  '🗄️ 已归档': '🗄️ Archived',
  '📊 任务状态分布': '📊 Status distribution',

  // 标签面板
  '🏷️ 标签分类': '🏷️ By tag',
  '暂无标签，在编辑任务时添加标签': 'No tags yet — add tags when editing a task',
  '{0} 个任务': '{0} tasks',

  // 设置
  '所有任务数据存储在挂件块的属性中，导出为 JSON 可备份或迁移到其他挂件。':
    'All task data is stored in the widget block attributes. Export it as JSON to back up or migrate to another widget.',
  '📤 导出数据': '📤 Export',
  '将所有任务导出为 JSON 文件。': 'Export all tasks to a JSON file.',
  '导出 JSON': 'Export JSON',
  '📥 导入数据': '📥 Import',
  '从 JSON 文件导入任务（按标题去重）。': 'Import tasks from a JSON file (duplicates by title are skipped).',
  '导入 JSON': 'Import JSON',
  '导入失败：数据格式不正确': 'Import failed: invalid data format',
  '导入失败：{0}': 'Import failed: {0}',

  // 任务列
  '添加任务': 'Add task',
  '双击编辑标题': 'Double-click to rename',

  // 任务卡片
  '编辑任务': 'Edit task',
  '归档任务': 'Archive task',
  '删除任务': 'Delete task',
  '按「{0}」筛选': 'Filter by "{0}"',
  '确定要删除这个任务吗？': 'Delete this task?',
  '删除': 'Delete',

  // 任务表单
  '创建任务': 'Create task',
  '任务名称': 'Task name',
  '输入任务名称...': 'Enter a task name...',
  '任务状态': 'Status',
  '开始日期': 'Start date',
  '结束日期': 'End date',
  '任务描述': 'Description',
  '输入任务描述（支持 Markdown）...': 'Enter a description (Markdown supported)...',
  '标签（逗号分隔）': 'Tags (comma separated)',
  '例如: 工作, 个人, 学习': 'e.g. work, personal, study',
  '创建': 'Create',
  '更新': 'Update',
  '确定': 'OK',
  '任务标题不能为空': 'Task title is required',

  // 任务预览
  '关闭': 'Close',

  // 日历
  '📅 今天': '📅 Today',
  '+{0} 更多': '+{0} more',

  // 状态默认名称
  '计划中': 'Planned',
  '进行中': 'In progress',
  '已完成': 'Done',
  '未完成': 'Unfinished',

  // 相对时间
  '刚刚': 'just now',
  '{0}分钟前': '{0} min ago',
  '{0}小时前': '{0} h ago',
  '{0}天前': '{0} d ago',
  '{0}周前': '{0} w ago',
  '{0}个月前': '{0} mo ago',
  '{0}年前': '{0} y ago',

  // 初始化与安全
  '初始化失败：无法获取挂件块信息': 'Init failed: cannot read widget block info',
  '初始化失败：未找到容器元素': 'Init failed: container element not found',
  '初始化失败：{0}': 'Init failed: {0}',
  '不安全的图片链接': 'Unsafe image link',
  '无效的图片链接': 'Invalid image link',
};

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * 读取思源界面语言，读不到时退回浏览器语言
 * @returns {string}
 */
function detectLang() {
  let lang = '';
  try {
    const siyuan = (window.parent && window.parent.siyuan) || window.siyuan;
    if (siyuan && siyuan.config && siyuan.config.lang) {
      lang = String(siyuan.config.lang);
    }
  } catch (e) {
    // 跨域访问父窗口时忽略，退回浏览器语言
  }
  if (!lang && navigator.language) lang = navigator.language;
  return lang;
}

const DETECTED = detectLang();

/** 是否为中文界面 */
export const isZh = /^zh/i.test(DETECTED);

/** 当前语言代码 */
export const lang = isZh ? 'zh_CN' : 'en_US';

if (typeof document !== 'undefined') {
  document.documentElement.lang = isZh ? 'zh-CN' : 'en';
}

/**
 * 取文案
 * @param {string} text 中文原文
 * @param {...any} args 占位符 {0}、{1} 的替换值
 * @returns {string}
 */
export function t(text, ...args) {
  let out = text;
  if (!isZh) out = EN[text] !== undefined ? EN[text] : text;
  args.forEach((value, index) => {
    out = out.replaceAll(`{${index}}`, String(value));
  });
  return out;
}

/**
 * 日历标题（年月）
 * @param {number} year
 * @param {number} month 1-12
 * @returns {string}
 */
export function monthTitle(year, month) {
  return isZh ? `${year} 年 ${month} 月` : `${MONTHS_EN[month - 1]} ${year}`;
}

/**
 * 日历星期表头
 * @returns {string[]}
 */
export function weekdays() {
  return isZh ? ['一', '二', '三', '四', '五', '六', '日'] : WEEKDAYS_EN;
}
