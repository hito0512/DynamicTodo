/**
 * 应用主入口
 */
import TaskStore from './models/TaskStore.js';
import TaskBoard from './components/TaskBoard.js';
import DragDropService from './services/DragDropService.js';
import { getWidgetBlockInfo } from './util.js';

// 全局变量
let taskStore = null;
let taskBoard = null;
let dragDropService = null;

/**
 * 初始化应用
 */
async function initApp() {
  try {
    let blockId = null;

    // 尝试获取挂件块ID（思源环境）
    try {
      const blockInfo = getWidgetBlockInfo();
      blockId = blockInfo?.id;
    } catch (e) {
      console.log('非思源挂件环境，使用测试模式');
      // 浏览器直接打开时使用模拟ID
      blockId = 'test-block-id';
    }

    if (!blockId) {
      console.error('获取挂件块ID失败');
      showError('初始化失败：无法获取挂件块信息');
      return;
    }

    // 初始化数据存储
    taskStore = new TaskStore(blockId);

    // 测试环境下禁用API调用，使用内存存储
    if (blockId === 'test-block-id') {
      // 模拟API返回空数据
      taskStore.api.getBlockAttrs = async () => ({});
      taskStore.api.setBlockAttrs = async () => {};
      console.log('测试模式：数据仅保存在内存中，刷新后丢失');
    }

    await taskStore.load();

    // 初始化看板组件
    taskBoard = new TaskBoard(taskStore);
    await taskBoard.loadTasks();

    // 替换页面中的现有内容
    const appContainer = document.querySelector('.app');
    const oldMain = appContainer.querySelector('main');
    if (oldMain) {
      oldMain.remove();
    }
    // 移除旧的表单和预览元素
    const oldAddTask = document.querySelector('#addTask');
    if (oldAddTask) oldAddTask.remove();
    const oldPreview = document.querySelector('#taskPreview');
    if (oldPreview) oldPreview.remove();

    // 添加新的看板
    appContainer.appendChild(taskBoard.getElement());

    // 初始化拖拽服务
    dragDropService = new DragDropService(
      taskBoard.getColumnElements(),
      (taskId, newStatus, newOrder) => {
        taskBoard.handleTaskDrop(taskId, newStatus, newOrder);
      }
    );

    console.log('DynamicTodo 初始化完成');
  } catch (error) {
    console.error('初始化失败:', error);
    showError('初始化失败：' + error.message);
  }
}

/**
 * 显示错误信息
 * @param {string} message 错误信息
 */
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff2f0;
    border: 1px solid #ffccc7;
    padding: 20px;
    border-radius: 4px;
    z-index: 99999;
    color: #ff4d4f;
  `;
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// 清理资源
window.addEventListener('beforeunload', () => {
  if (dragDropService) {
    dragDropService.destroy();
  }
  if (taskBoard) {
    taskBoard.destroy();
  }
});
