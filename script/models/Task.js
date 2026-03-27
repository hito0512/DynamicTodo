/**
 * 任务数据模型
 */
class Task {
  /**
   * 创建任务实例
   * @param {object} data 任务数据
   * @param {string} data.id 任务唯一ID
   * @param {string} data.title 任务标题
   * @param {string} data.description 任务描述
   * @param {string} data.status 任务状态: todo/doing/done/unfinish
   * @param {number} data.createdAt 创建时间戳
   * @param {number} data.updatedAt 更新时间戳
   * @param {number} data.order 排序权重
   */
  constructor(data) {
    this.id = data.id || this.generateId();
    this.title = data.title || '';
    this.description = data.description || '';
    this.status = data.status || 'todo';
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
    this.order = data.order !== undefined ? data.order : 0;
  }

  /**
   * 生成唯一ID
   * @returns {string} 唯一ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 更新任务数据
   * @param {object} data 要更新的字段
   */
  update(data) {
    Object.assign(this, data);
    this.updatedAt = Date.now();
  }

  /**
   * 转换为纯对象
   * @returns {object} 任务数据对象
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      order: this.order,
    };
  }

  /**
   * 从旧格式数据创建任务实例
   * @param {object} oldTask 旧格式任务数据
   * @param {string} status 任务状态
   * @param {number} order 排序权重
   * @returns {Task} 任务实例
   */
  static fromOldFormat(oldTask, status, order = 0) {
    // 解析旧格式时间
    let createdAt = Date.now();
    if (oldTask.year && oldTask.month && oldTask.day && oldTask.hour && oldTask.min && oldTask.sec) {
      createdAt = new Date(
        oldTask.year,
        oldTask.month - 1,
        oldTask.day,
        oldTask.hour,
        oldTask.min,
        oldTask.sec
      ).getTime();
    }

    return new Task({
      title: oldTask.title || '',
      description: oldTask.description || '',
      status: status,
      createdAt: createdAt,
      updatedAt: createdAt,
      order: order,
    });
  }
}

export default Task;
