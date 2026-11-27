/**
 * 应用主入口
 */
import TaskStore from './models/TaskStore.js';
import TaskBoard from './components/TaskBoard.js';
import DragDropService from './services/DragDropService.js';
import SiyuanApi from './services/SiyuanApi.js';
import { getWidgetBlockInfo } from './util.js';
import { t } from './i18n.js';

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
    let isTestMode = false;

    // 尝试获取挂件块ID（思源环境）
    try {
      const blockInfo = getWidgetBlockInfo();
      blockId = blockInfo?.id;
    } catch (e) {
      console.log('非思源挂件环境，使用测试模式');
      blockId = 'test-block-id';
      isTestMode = true;
    }

    if (!blockId) {
      console.error('获取挂件块ID失败');
      showError(t('初始化失败：无法获取挂件块信息'));
      return;
    }

    // 初始化数据存储
    taskStore = new TaskStore(blockId);

    // 测试环境下禁用API调用，使用内存存储
    if (isTestMode) {
      taskStore.api.getBlockAttrs = async () => ({});
      taskStore.api.setBlockAttrs = async () => {};
      console.log('测试模式：数据仅保存在内存中，刷新后丢失');
    }

    await taskStore.load();

    // 初始化看板组件
    taskBoard = new TaskBoard(taskStore, { onLanguageChange: rebuildUI });
    await taskBoard.loadTasks();

    // 将看板挂载到容器
    const appContainer = document.querySelector('.app');
    if (!appContainer) {
      console.error('未找到 .app 容器元素');
      showError(t('初始化失败：未找到容器元素'));
      return;
    }
    appContainer.appendChild(taskBoard.getElement());

    // 初始化拖拽服务
    dragDropService = createDragDropService();

    window.__taskBoard = taskBoard;
    window.__taskStore = taskStore;
    console.log('DynamicTodo 初始化完成');
  } catch (error) {
    console.error('初始化失败:', error);
    showError(t('初始化失败：{0}', error.message));
  }
}

/**
 * 创建拖拽服务，绑定当前看板的列元素
 * @returns {DragDropService}
 */
function createDragDropService() {
  return new DragDropService(
    taskBoard.getColumnElements(),
    (taskId, newStatus, newOrder) => {
      taskBoard.handleTaskDrop(taskId, newStatus, newOrder);
    }
  );
}

/**
 * 语言切换后重建整个界面
 * 界面文案在渲染时通过 t() 取值，不重建就还是旧语言。
 * @param {string} view 重建后停留的视图
 */
async function rebuildUI(view) {
  const container = document.querySelector('.app');
  if (!container) return;

  const keepView = view || 'board';
  const keepYear = taskBoard ? taskBoard.boardYear : null;

  // 拖拽服务持有旧的列元素，必须一并销毁
  if (dragDropService) {
    dragDropService.destroy();
    dragDropService = null;
  }
  if (taskBoard) {
    taskBoard.destroy();
  }

  // 重新读一次数据：默认状态名要按新语言重算
  await taskStore.load();

  taskBoard = new TaskBoard(taskStore, { onLanguageChange: rebuildUI });
  taskBoard.boardYear = keepYear;
  await taskBoard.loadTasks();

  while (container.firstChild) container.removeChild(container.firstChild);
  container.appendChild(taskBoard.getElement());

  dragDropService = createDragDropService();

  // 停回原来的视图
  if (taskBoard.activeView !== keepView) {
    taskBoard.activeView = keepView;
    taskBoard.refreshView();
  }

  window.__taskBoard = taskBoard;
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
