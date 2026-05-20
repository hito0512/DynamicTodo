# DynamicTodo

思源笔记挂件 — 动态任务看板

## 功能

- **双视图切换**：看板视图 / 日历视图，标签切换
- **任务管理**：创建、编辑、删除任务
- **拖拽排序**：任务卡片拖拽到不同状态列
- **日期范围**：支持开始日期和结束日期，日历视图连续显示
- **任务预览**：鼠标悬停预览任务详情
- **Markdown 支持**：任务描述支持 Markdown 语法和超链接
- **状态自定义**：任务状态文本可自定义，支持双击编辑列标题
- **标签系统**：任务标签分类，创建/编辑时逗号分隔（支持中英文逗号）
- **标签筛选**：看板工具栏标签输入实时筛选，任务卡片标签徽章点击一键筛选
- **标签面板**：展示所有标签及任务数、状态分布，点击自动切换看板并筛选
- **按年筛选**：看板视图、统计面板、归档面板均支持按年筛选
- **归档管理**：完成任务可归档，归档面板按未完成/已完成分区展示
- **归档恢复**：归档卡片支持恢复原样或新建（日期设为今天）两种方式
- **统计面板**：各状态任务分布及完成进度条，支持按年/全部统计

## 预览

<div>
<img src="https://cdn.jsdelivr.net/gh/hito0512/ImageStore/1.png" />
</div>

<div>
<img src="https://cdn.jsdelivr.net/gh/hito0512/ImageStore/2.png" />
</div>

## 数据结构 — 任务 JSON

供外部工具/Agent 创建任务卡片时使用。

### 创建任务

```json
{
  "title": "任务标题",
  "description": "支持 Markdown 的描述内容",
  "status": "todo",
  "tags": ["工作", "前端"],
  "startDate": 1747612800000,
  "endDate": null,
  "createdAt": 1747612800000
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | `string` | 是 | 任务标题 |
| `description` | `string` | 否 | Markdown 描述 |
| `status` | `string` | 是 | `todo` / `doing` / `done` / `unfinish` |
| `tags` | `string[]` | 否 | 标签数组 |
| `startDate` | `number\|null` | 否 | 开始日期时间戳，默认创建时间 |
| `endDate` | `number\|null` | 否 | 结束日期时间戳 |
| `createdAt` | `number` | 否 | 创建时间戳，自动生成 |
| `archived` | `boolean` | 否 | 归档标记，默认 `false` |

### 状态说明

| 状态值 | 显示文本 | 说明 |
|--------|----------|------|
| `todo` | 计划中 | 待办任务 |
| `doing` | 进行中 | 执行中任务 |
| `done` | 已完成 | 已完成任务 |
| `unfinish` | 未完成 | 未完成任务（如逾期） |

### 持久化格式

数据以 JSON 字符串存入思源笔记块属性 `custom-tasks` 中：

```json
{
  "version": "1.0.0",
  "tasks": [
    { "id": "...", "title": "...", "status": "todo", ... }
  ],
  "updatedAt": 1747612800000
}
```

## 开发

### cli-anything-siyuan

基于 [CLI-Anything](https://github.com/HKUDS/CLI-Anything) 方法论构建的思源笔记 CLI 工具，通过 HTTP API 连接运行中的内核。可用于查询任务数据、调试和自动化操作。



### 数据调试

DynamicTodo 将任务数据以 JSON 字符串存储在思源块属性 `custom-tasks` 中：

```bash
# 查看挂件块的完整属性
cli-anything-siyuan block get <挂件块ID>

# 直接读取 .sy 文件查找挂件
find ~/SiYuan/data -name "*.sy" | xargs grep -l "DynamicTodo" 2>/dev/null
```


## 更新记录

详见 [./CHANGELOG.md](CHANGELOG.md)

## 捐赠

如果您认可这个项目，请我喝一杯咖啡吧，这将鼓励我持续更新，并创作出更多好用的工具~

<div>
<img src="https://cdn.jsdelivr.net/gh/hito0512/ImageStore/zs.jpg" alt="wechat" style="width:280px;height:280px;" />
</div>
