import { config } from '../config.js';

/**
 * 思源笔记API统一封装
 * 清理冗余API，仅保留项目所需功能，修复安全问题
 */
class SiyuanApi {
  static instance = null;

  static getInstance() {
    if (!SiyuanApi.instance) {
      SiyuanApi.instance = new SiyuanApi();
    }
    return SiyuanApi.instance;
  }

  constructor() {
    this.baseUrl = '';
    this.token = config.token;
  }

  /**
   * 通用POST请求
   * @param {string} url API路径
   * @param {object} data 请求数据
   * @returns {Promise<any>} 响应数据
   */
  async post(url, data = {}) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${this.token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${url} ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result.code !== 0) {
        throw new Error(`API错误: ${result.msg || '未知错误'}`);
      }

      return result.data;
    } catch (error) {
      console.error('思源API请求错误:', error);
      throw error;
    }
  }

  /**
   * 获取块属性
   * @param {string} blockId 块ID
   * @returns {Promise<object>} 属性对象
   */
  async getBlockAttrs(blockId) {
    return this.post('/api/attr/getBlockAttrs', { id: blockId });
  }

  /**
   * 设置块属性
   * @param {string} blockId 块ID
   * @param {object} attrs 属性对象
   * @returns {Promise<void>}
   */
  async setBlockAttrs(blockId, attrs) {
    return this.post('/api/attr/setBlockAttrs', {
      id: blockId,
      attrs: attrs,
    });
  }

  /**
   * 执行SQL查询（参数化，防止SQL注入）
   * @param {string} sql SQL语句
   * @param {array} params 参数列表
   * @returns {Promise<array>} 查询结果
   */
  async sqlQuery(sql, params = []) {
    // 简单参数替换，防止SQL注入
    let processedSql = sql;
    params.forEach((param, index) => {
      const escapedParam = param.replace(/'/g, "''");
      processedSql = processedSql.replace(`$${index + 1}`, `'${escapedParam}'`);
    });

    return this.post('/api/query/sql', { stmt: processedSql });
  }

  /**
   * 追加子块
   * @param {string} parentID 父块ID
   * @param {string} dataType 数据类型（markdown/dom等）
   * @param {string} data 块内容
   * @returns {Promise<object>} 包含新块ID的响应
   */
  async appendBlock(parentID, dataType = 'markdown', data = '') {
    return this.post('/api/block/appendBlock', {
      parentID,
      dataType,
      data,
    });
  }

  /**
   * 删除块
   * @param {string} blockId 块ID
   * @returns {Promise<void>}
   */
  async deleteBlock(blockId) {
    return this.post('/api/block/deleteBlock', { id: blockId });
  }

  /**
   * 更新块内容
   * @param {string} blockId 块ID
   * @param {string} dataType 数据类型
   * @param {string} data 新内容
   * @returns {Promise<void>}
   */
  async updateBlock(blockId, dataType = 'markdown', data = '') {
    return this.post('/api/block/updateBlock', {
      id: blockId,
      dataType,
      data,
    });
  }

  /**
   * 创建文档
   * @param {string} notebookId 笔记本ID
   * @param {string} path 文档路径（如 "/MyDoc"）
   * @param {string} markdown 可选初始内容
   * @returns {Promise<string>} 新文档ID
   */
  async createDocWithMd(notebookId, path, markdown = '') {
    const data = await this.post('/api/filetree/createDocWithMd', {
      notebook: notebookId,
      path,
      markdown,
    });
    return data; // 返回文档ID字符串
  }

  /**
   * 获取子块列表（通过SQL查询）
   * @param {string} parentId 父块ID
   * @param {string} blockType 块类型，如 'p'（段落）
   * @returns {Promise<array>} 子块信息数组
   */
  async getBlockChildren(parentId, blockType = 'p') {
    return this.sqlQuery(
      'SELECT id, type, content FROM blocks WHERE parent_id = $1 AND type = $2 ORDER BY updated ASC',
      [parentId, blockType]
    );
  }

  /**
   * 获取思源服务器当前时间
   * @returns {Promise<number>} 当前时间戳（毫秒）
   */
  async getCurrentTime() {
    const data = await this.post('/api/system/currentTime', {});
    return data?.time || Date.now();
  }

  /**
   * 根据块ID获取锚文本
   * @param {string} blockId 块ID
   * @returns {Promise<string>} 锚文本
   */
  async getAnchorText(blockId) {
    const cleanBlockId = blockId.replace('((', '').replace('))', '');
    const results = await this.sqlQuery('select * from blocks where id = $1', [cleanBlockId]);
    return results?.[0]?.content || '';
  }

}

export default SiyuanApi;
