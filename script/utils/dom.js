/**
 * DOM操作工具函数
 */

/**
 * 创建DOM元素
 * @param {string} tag 标签名
 * @param {object} [attrs] 属性对象
 * @param {string|HTMLElement|Array} [children] 子元素
 * @returns {HTMLElement} 创建的元素
 */
export function createElement(tag, attrs = {}, children = []) {
  const element = document.createElement(tag);

  // 设置属性
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      // 处理事件属性
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, value);
    } else if (key.startsWith('data-')) {
      element.setAttribute(key, value);
    } else if (typeof value === 'boolean') {
      element[key] = value;
    } else {
      element.setAttribute(key, value);
    }
  });

  // 添加子元素
  if (Array.isArray(children)) {
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      }
    });
  } else if (typeof children === 'string') {
    element.textContent = children;
  } else if (children instanceof HTMLElement) {
    element.appendChild(children);
  }

  return element;
}

/**
 * 清空元素内容
 * @param {HTMLElement} element 要清空的元素
 */
export function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * 获取元素相对于文档的位置
 * @param {HTMLElement} element 元素
 * @returns {{top: number, left: number}} 位置信息
 */
export function getOffset(element) {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.pageYOffset,
    left: rect.left + window.pageXOffset,
  };
}

/**
 * 事件委托
 * @param {HTMLElement} parent 父元素
 * @param {string} selector 子元素选择器
 * @param {string} eventName 事件名
 * @param {Function} handler 事件处理函数
 */
export function delegateEvent(parent, selector, eventName, handler) {
  parent.addEventListener(eventName, event => {
    const target = event.target.closest(selector);
    if (target && parent.contains(target)) {
      handler.call(target, event, target);
    }
  });
}

/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {number} delay 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, delay) {
  let timeoutId;
  const debounced = function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
  debounced.cancel = () => clearTimeout(timeoutId);
  return debounced;
}

/**
 * 节流函数
 * @param {Function} func 要节流的函数
 * @param {number} delay 节流间隔（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, delay) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      func.apply(this, args);
    }
  };
}

/**
 * 使元素可拖动
 * @param {HTMLElement} element 要拖动的元素
 * @param {HTMLElement} handle 拖动手柄元素
 * @param {Function} [onDragStart] 拖动开始回调
 * @param {Function} [onDragMove] 拖动中回调
 * @param {Function} [onDragEnd] 拖动结束回调
 */
export function makeDraggable(element, handle, onDragStart, onDragMove, onDragEnd) {
  let isDragging = false;
  let startX, startY, initialX, initialY;

  const dragHandle = handle || element;

  dragHandle.style.cursor = 'move';

  dragHandle.addEventListener('mousedown', e => {
    // 点击按钮时不启动拖动
    if (e.target.closest('button')) return;

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initialX = element.offsetLeft;
    initialY = element.offsetTop;

    element.style.userSelect = 'none';
    element.style.pointerEvents = 'none';

    if (onDragStart) {
      onDragStart(e, { initialX, initialY });
    }

    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    const newX = initialX + deltaX;
    const newY = initialY + deltaY;

    element.style.left = `${newX}px`;
    element.style.top = `${newY}px`;

    if (onDragMove) {
      onDragMove(e, { x: newX, y: newY, deltaX, deltaY });
    }
  });

  document.addEventListener('mouseup', e => {
    if (!isDragging) return;

    isDragging = false;
    element.style.userSelect = '';
    element.style.pointerEvents = '';

    if (onDragEnd) {
      onDragEnd(e, {
        x: element.offsetLeft,
        y: element.offsetTop,
      });
    }
  });
}
