/**
 * 日期时间工具函数
 */

/**
 * 格式化时间戳为日期字符串
 * @param {number} timestamp 时间戳（毫秒）
 * @param {string} format 格式化字符串，支持 YYYY, MM, DD, HH, mm, ss
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(timestamp, format = 'YYYY-MM-DD HH:mm') {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 获取当前时间戳
 * @returns {number} 当前时间戳（毫秒）
 */
export function now() {
  return Date.now();
}

/**
 * 格式化相对时间
 * @param {number} timestamp 时间戳
 * @returns {string} 相对时间字符串
 */
export function formatRelativeTime(timestamp) {
  const diff = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`;
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`;
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`;
  } else if (diff < month) {
    return `${Math.floor(diff / week)}周前`;
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`;
  } else {
    return `${Math.floor(diff / year)}年前`;
  }
}
