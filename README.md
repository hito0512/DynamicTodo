# DynamicTodo

思源笔记挂件 — 动态任务看板
A dynamically updating todo list widget for SiYuan

[中文](#中文) | [English](#english)

---

## 中文

> v0.3.0 的存储方式存在设计缺陷，可能导致数据卡顿。v0.4.0 已回退到更稳定的块属性存储方案，并自动兼容旧版本数据。如果任务数据不显示，请更新到最新版本。

### 功能

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
- **中英双语**：默认跟随思源界面语言，也可在设置面板里单独指定中文 / English

### 预览

<div>
<img src="https://cdn.jsdelivr.net/gh/hito0512/ImageStore/1.png" />
</div>

<div>
<img src="https://cdn.jsdelivr.net/gh/hito0512/ImageStore/2.png" />
</div>

### 安装

- **集市**：思源 → 集市 → 挂件 → 搜索 `DynamicTodo`
- **手动**：下载 Release 中的 `package.zip`，解压到 `data/widgets/` 下的 `DynamicTodo` 目录，然后刷新页面

### 使用

在文档中输入 `/挂件` 新建一个挂件块并选择 DynamicTodo，即可看到看板。

- 列标题右侧 `+` 新建任务
- 卡片右上角按钮依次为编辑、归档、删除
- 任务数据保存在挂件块的 `custom-tasks` 属性中，移动挂件块时数据随之移动

### 数据格式

挂件用 JSON 导入导出任务：**⚙️ → 导入数据** 选择文件即可。同标题的任务视为同一条，
会覆盖更新而不是新增一条。

字段表、完整示例，以及导入时的硬约束（哪三个字段缺了整条会被丢弃、同标题覆盖会清空哪些字段），
见 [CLI-ANYTHING.md](https://github.com/hito0512/DynamicTodo/blob/main/CLI-ANYTHING.md) 的第二节。

### 从思源文档生成任务卡片

挂件自己不会读笔记。读思源文档、整理成任务卡片，是
[CLI-Anything](https://github.com/HKUDS/CLI-Anything) 的思源 CLI（`cli-anything-siyuan`）的活：
它把文档导出来，再按上面的 JSON 格式写成 `tasks.json`，最后导入挂件。

安装（含把命令加入系统 PATH 的配置）、用法、让 Agent 代办的写法，见
[CLI-ANYTHING.md](https://github.com/hito0512/DynamicTodo/blob/main/CLI-ANYTHING.md)。

### 更新记录

详见 [CHANGELOG.md](./CHANGELOG.md)。

### 捐赠

如果这个挂件对你有帮助，欢迎请我喝杯咖啡，这会鼓励我继续更新。

<div>
<img src="https://cdn.jsdelivr.net/gh/hito0512/ImageStore/zs.jpg" alt="wechat" style="width:280px;height:280px;" />
</div>

---

## English

> Version 0.3.0 stored tasks in a way that could make the board sluggish. Version 0.4.0 reverts to the
> more stable block-attribute storage and migrates old data automatically. If your tasks are missing,
> please update to the latest version.

### Features

- **Two views**: kanban board and calendar, switch with the tabs at the top
- **Task management**: create, edit and delete tasks; descriptions support Markdown and links
- **Drag to sort**: drag a card between status columns to change its status
- **Date ranges**: optional start / end date, and the calendar shows the whole range
- **Hover preview**: hover a card to peek at its details
- **Custom status names**: double-click a column header to rename it
- **Tags**: comma-separated when creating or editing (both `,` and `，` work); filter from the toolbar and see an overview in the tag panel
- **Filter by year**: available in the board, statistics and archive panels
- **Archive**: archive finished tasks, then restore them as they were or as a new task dated today
- **Statistics**: task count per status and overall progress
- **Chinese / English UI**: follows SiYuan's interface language by default, and can be forced to Chinese or English for this widget only in the Settings tab

### Preview

Screenshots are shown in the Chinese section above.

### Install

- **Marketplace**: SiYuan → Marketplace → Widgets → search `DynamicTodo`
- **Manual**: download `package.zip` from a release, unzip it into `data/widgets/DynamicTodo`, then reload the page

### Usage

Type `/widget` in a document, insert a widget block and choose DynamicTodo.

- `+` to the right of a column header creates a task
- The buttons on a card, left to right: edit, archive, delete
- Tasks are stored in the `custom-tasks` attribute of the widget block, so they move together with the block

### Data format

Tasks are imported and exported as JSON: open **⚙️ → Import data** and pick a file.
A task whose title matches an existing one is treated as the same task and updated in place —
it is not added a second time.

Field tables, a complete example and the import rules (which three fields cause a task to be dropped,
which fields are cleared on update) are in section 2 of
[CLI-ANYTHING.md](https://github.com/hito0512/DynamicTodo/blob/main/CLI-ANYTHING.md), which is bilingual.

### Generate tasks from your notes

The widget does not read your notes. Reading a SiYuan document and turning it into task cards is the job of
`cli-anything-siyuan`, the SiYuan CLI shipped with
[CLI-Anything](https://github.com/HKUDS/CLI-Anything). It exports the document, the cards are written out as
`tasks.json` in the format above, and the file is then imported into the widget.

Installation (including how to get the command onto your system `PATH`), usage and the agent shortcut are
documented in the English section of
[CLI-ANYTHING.md](https://github.com/hito0512/DynamicTodo/blob/main/CLI-ANYTHING.md).

### Changelog

See [CHANGELOG.md](./CHANGELOG.md).

### Donation

If this widget helps you, you can buy me a coffee — it keeps the updates coming.
The WeChat QR code is shown in the Chinese section above.
