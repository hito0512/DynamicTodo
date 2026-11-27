# DynamicTodo

思源笔记挂件 — 动态任务看板

> v0.3.0 的存储方式存在设计缺陷，可能导致数据卡顿。v0.4.0 已回退到更稳定的块属性存储方案，并自动兼容旧版本数据。如果任务数据不显示，请更新到最新版本。

## 功能

- **双视图**：看板视图 / 日历视图，顶部标签一键切换
- **任务管理**：创建、编辑、删除，描述支持 Markdown 与超链接
- **拖拽排序**：任务卡片在状态列之间拖动即可改变状态
- **日期范围**：支持开始 / 结束日期，日历视图按区间连续显示
- **悬停预览**：鼠标停在卡片上预览任务详情
- **状态自定义**：双击列标题即可改名
- **标签**：创建 / 编辑时逗号分隔（支持中英文逗号），工具栏实时筛选，标签面板汇总
- **按年筛选**：看板、统计、归档面板均支持
- **归档管理**：完成的任务可归档，支持「恢复原样」与「新建（今天）」
- **统计面板**：各状态任务分布与完成进度
- **中英双语**：跟随思源界面语言自动切换

## 预览

<div>
<img src="https://cdn.jsdelivr.net/gh/hito0512/ImageStore/1.png" />
</div>

<div>
<img src="https://cdn.jsdelivr.net/gh/hito0512/ImageStore/2.png" />
</div>

## 安装

- **集市**：思源 → 集市 → 挂件 → 搜索 `DynamicTodo`
- **手动**：下载 Release 中的 `package.zip`，解压到 `data/widgets/` 下的 `DynamicTodo` 目录，然后刷新页面

## 使用

在文档中输入 `/挂件` 新建一个挂件块并选择 DynamicTodo，即可看到看板。

- 列标题右侧 `+` 新建任务
- 卡片右上角按钮依次为编辑、归档、删除
- 任务数据保存在挂件块的 `custom-tasks` 属性中，移动挂件块时数据随之移动

## English

The UI follows SiYuan's interface language: Chinese when SiYuan runs in Chinese, English otherwise. There is no language switch inside the widget.

- Kanban board and calendar view, drag tasks between status columns
- Archive, statistics and tag panels
- Import / export all tasks as JSON from the ⚙️ Settings tab

Install from the SiYuan marketplace (search `DynamicTodo`), or unzip `package.zip` from the latest release into `data/widgets/DynamicTodo`.

## 数据格式

挂件支持从 JSON 导入任务，方便用脚本或 AI 生成任务卡片。

### 导入格式

在挂件中点击 **⚙️ → 导入数据**，选择 JSON 文件即可，按标题去重。

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

顶层字段：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `version` | `string` | 是 | 数据格式版本，固定 `"1.0.0"` |
| `exportTime` | `string` | 是 | 导出时间，ISO 格式 |
| `tasks` | `object[]` | 是 | 任务数组 |
| `statusTexts` | `object` | 是 | 状态文字映射 |

任务字段：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | 是 | 唯一标识 |
| `title` | `string` | 是 | 任务标题 |
| `description` | `string` | 否 | Markdown 描述 |
| `status` | `string` | 是 | `todo` / `doing` / `done` / `unfinish` |
| `createdAt` | `number` | 否 | 创建时间戳（毫秒） |
| `updatedAt` | `number` | 否 | 更新时间戳（毫秒） |
| `order` | `number` | 否 | 排序值 |
| `startDate` | `number\|null` | 否 | 开始日期时间戳 |
| `endDate` | `number\|null` | 否 | 结束日期时间戳 |
| `archived` | `boolean` | 否 | 归档标记，默认 `false` |
| `tags` | `string[]` | 否 | 标签数组 |

状态取值：

| 状态值 | 默认显示 | 含义 |
|--------|----------|------|
| `todo` | 计划中 | 待办任务 |
| `doing` | 进行中 | 进行中的任务 |
| `done` | 已完成 | 已完成任务 |
| `unfinish` | 未完成 | 未完成任务（如逾期） |

## 从思源文档生成任务卡片

配合 `cli-anything-siyuan` 可以把文档内容整理成任务：

1. 将 `cli-anything-siyuan.exe` 放到系统 PATH 下，供命令行或 Agent 调用
2. `cli-anything-siyuan export md <doc-id>` 导出文档 Markdown
3. 按上文格式生成 `tasks.json`
4. 在挂件里 **⚙️ → 导入数据** 选择该文件

指令示例：`sy 20211103171034-f14h747 制作卡片`、`思源 制作卡片 <doc-id>`、`sy 导出为卡片 <doc-id>`

## 更新记录

详见 [CHANGELOG.md](./CHANGELOG.md)

## 捐赠

如果这个挂件对你有帮助，欢迎请我喝杯咖啡，这会鼓励我继续更新。

<div>
<img src="https://cdn.jsdelivr.net/gh/hito0512/ImageStore/zs.jpg" alt="wechat" style="width:280px;height:280px;" />
</div>
