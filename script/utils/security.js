import { SECURITY } from '../config/constants.js';

/**
 * 安全工具函数
 */

/**
 * XSS过滤，清理不安全的HTML内容
 * @param {string} html 原始HTML内容
 * @returns {string} 清理后的安全HTML
 */
export function sanitizeHtml(html) {
  if (!html) return '';

  // 创建临时DOM元素
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // 遍历所有元素
  const elements = temp.querySelectorAll('*');
  elements.forEach(element => {
    // 移除不允许的标签
    if (!SECURITY.ALLOWED_TAGS.includes(element.tagName.toLowerCase())) {
      element.replaceWith(element.textContent);
      return;
    }

    // 移除不允许的属性
    const allowedAttrs = SECURITY.ALLOWED_ATTRIBUTES[element.tagName.toLowerCase()] || [];
    Array.from(element.attributes).forEach(attr => {
      const attrName = attr.name.toLowerCase();
      if (!allowedAttrs.includes(attrName)) {
        element.removeAttribute(attrName);
      }
    });

    // 检查链接的协议
    if (element.tagName.toLowerCase() === 'a') {
      const href = element.getAttribute('href');
      if (href) {
        try {
          const url = new URL(href);
          if (!SECURITY.ALLOWED_PROTOCOLS.includes(url.protocol)) {
            element.removeAttribute('href');
            element.classList.add('unsafe-link');
          } else {
            // 外部链接强制新窗口打开
            element.setAttribute('target', '_blank');
            element.setAttribute('rel', 'noopener noreferrer');
          }
        } catch {
          // 无效URL，移除href
          element.removeAttribute('href');
        }
      }
    }

    // 检查图片的协议
    if (element.tagName.toLowerCase() === 'img') {
      const src = element.getAttribute('src');
      if (src) {
        try {
          const url = new URL(src);
          if (!SECURITY.ALLOWED_PROTOCOLS.includes(url.protocol)) {
            element.removeAttribute('src');
            element.setAttribute('alt', '不安全的图片链接');
          }
        } catch {
          // 无效URL，移除src
          element.removeAttribute('src');
          element.setAttribute('alt', '无效的图片链接');
        }
      }
    }

    // 移除内联事件处理器
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.toLowerCase().startsWith('on')) {
        element.removeAttribute(attr.name);
      }
    });
  });

  return temp.innerHTML;
}

/**
 * 转义HTML特殊字符
 * @param {string} text 原始文本
 * @returns {string} 转义后的文本
 */
export function escapeHtml(text) {
  if (!text) return '';

  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 验证任务数据
 * @param {object} taskData 任务数据
 * @returns {boolean} 验证是否通过
 */
export function validateTaskData(taskData) {
  if (!taskData || typeof taskData !== 'object') {
    return false;
  }

  // 标题不能为空
  if (!taskData.title || typeof taskData.title !== 'string' || taskData.title.trim().length === 0) {
    return false;
  }

  // 状态必须是有效值
  const validStatuses = ['todo', 'doing', 'done', 'unfinish'];
  if (taskData.status && !validStatuses.includes(taskData.status)) {
    return false;
  }

  return true;
}
