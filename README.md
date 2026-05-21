# DynamicTodo

思源笔记挂件 — 动态任务看板

> **抱歉**：v0.3.0 的数据存储方式存在设计缺陷，可能导致数据卡顿。v0.4.0 已修复此问题，回退到更稳定的存储方案，并自动兼容旧版本数据。如果遇到任务数据不显示，请更新到最新版本。

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

### JSON 导入格式

生成 JSON 文件后，在挂件中点击 **⚙️ → 导入数据** 选择文件即可导入。

```json
{
  "version": "1.0.0",
  "exportTime": "2026-05-20T03:33:26.128Z",
  "tasks": [
    {
      "id": "1779175153949-5rvsvbyc8",
      "title": "任务标题",
      "description": "支持 **Markdown** 的描述内容",
      "status": "todo",
      "createdAt": 1747612800000,
      "updatedAt": 1747612800000,
      "order": 0,
      "startDate": 1747612800000,
      "endDate": null,
      "archived": false,
      "tags": ["工作", "前端"]
    }
  ],
  "statusTexts": {
    "todo": "计划中",
    "doing": "进行中",
    "done": "已完成",
    "unfinish": "未完成"
  }
}
```

### 字段说明

#### 顶层字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `version` | `string` | 是 | 数据格式版本，固定 `"1.0.0"` |
| `exportTime` | `string` | 是 | 导出时间 ISO 格式 |
| `tasks` | `object[]` | 是 | 任务数组 |
| `statusTexts` | `object` | 是 | 状态文字映射 |

#### 任务字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | 是 | 唯一标识 |
| `title` | `string` | 是 | 任务标题 |
| `description` | `string` | 否 | Markdown 描述 |
| `status` | `string` | 是 | `todo` / `doing` / `done` / `unfinish` |
| `createdAt` | `number` | 否 | 创建时间戳（毫秒，需用当前日期生成） |
| `updatedAt` | `number` | 否 | 更新时间戳（同 createdAt） |
| `order` | `number` | 否 | 排序值 |
| `startDate` | `number\|null` | 否 | 开始日期时间戳 |
| `endDate` | `number\|null` | 否 | 结束日期时间戳 |
| `archived` | `boolean` | 否 | 归档标记，默认 `false` |
| `tags` | `string[]` | 否 | 标签数组 |

### 状态说明

| 状态值 | 显示文本 | 说明 |
|--------|----------|------|
| `todo` | 计划中 | 待办任务 |
| `doing` | 进行中 | 执行中任务 |
| `done` | 已完成 | 已完成任务 |
| `unfinish` | 未完成 | 未完成任务（如逾期） |

### 从思源文档生成任务卡片

1. Agent 通过 `cli-anything-siyuan export md <doc-id>` 导出文档 Markdown
2. 解析文档中的清单/笔记内容，按上方 JSON 格式生成 `tasks.json`
3. 用户拿到 JSON 文件后，在 DynamicTodo 挂件中 **⚙️ → 导入数据** 即可

生成的 JSON 文件保存在桌面（如 `~/Desktop/tasks.json`），**严禁放入代码目录或提交到 git**。

写法示例：`sy 20211103171034-f14h747 制作卡片`、`思源 制作卡片 <doc-id>`、`sy 导出为卡片 <doc-id>`



## 更新记录

详见 [./CHANGELOG.md](CHANGELOG.md)

## 捐赠

如果您认可这个项目，请我喝一杯咖啡吧，这将鼓励我持续更新，并创作出更多好用的工具~

<div>
<img src="https://cdn.jsdelivr.net/gh/hito0512/ImageStore/zs.jpg" alt="wechat" style="width:280px;height:280px;" />
</div>
