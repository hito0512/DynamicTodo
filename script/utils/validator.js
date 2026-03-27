/**
 * 验证工具函数
 */

/**
 * 检查是否为非空字符串
 * @param {any} value 要检查的值
 * @returns {boolean} 是否为非空字符串
 */
export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * 检查是否为有效的任务ID
 * @param {any} id 要检查的ID
 * @returns {boolean} 是否为有效ID
 */
export function isValidTaskId(id) {
  return isNonEmptyString(id) && /^\d{13}-[a-z0-9]{9}$/.test(id);
}

/**
 * 检查是否为有效的任务状态
 * @param {any} status 要检查的状态
 * @returns {boolean} 是否为有效状态
 */
export function isValidTaskStatus(status) {
  const validStatuses = ['todo', 'doing', 'done', 'unfinish'];
  return typeof status === 'string' && validStatuses.includes(status);
}

/**
 * 检查是否为有效的时间戳
 * @param {any} timestamp 要检查的时间戳
 * @returns {boolean} 是否为有效时间戳
 */
export function isValidTimestamp(timestamp) {
  return typeof timestamp === 'number' && timestamp > 0 && timestamp < Date.now() + 86400000 * 365 * 10;
}

/**
 * 检查是否为有效的块ID
 * @param {any} blockId 要检查的块ID
 * @returns {boolean} 是否为有效块ID
 */
export function isValidBlockId(blockId) {
  return isNonEmptyString(blockId) && blockId.length === 23 && /^[0-9a-f]{23}$/.test(blockId);
}

/**
 * 检查URL是否安全
 * @param {string} url 要检查的URL
 * @param {string[]} allowedProtocols 允许的协议列表
 * @returns {boolean} 是否安全
 */
export function isSafeUrl(url, allowedProtocols = ['http:', 'https:', 'siyuan:']) {
  try {
    const parsedUrl = new URL(url);
    return allowedProtocols.includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}
