# cli-anything-siyuan 与任务 JSON 格式
cli-anything-siyuan and the task JSON format

[中文](#中文) | [English](#english)

---

## 中文

DynamicTodo 挂件只做两件事：**导入 JSON、显示看板**。读思源文档、把内容整理成任务卡片，
是 [CLI-Anything](https://github.com/HKUDS/CLI-Anything) 里思源 CLI（`cli-anything-siyuan`）的活。

```text
思源文档 → cli-anything-siyuan 导出 → Agent（或你）按本文格式写 tasks.json → 挂件 ⚙️ 导入
```

本文管两件事：怎么装这个 CLI，以及它输出的 JSON 必须遵守什么格式。

### 一、安装

前置：思源 3.x 正在运行，Python 3.10+。

先把仓库拉下来：

```bash
git clone https://github.com/HKUDS/CLI-Anything.git
cd CLI-Anything/siyuan/agent-harness
```

然后二选一装。**推荐方式一**，因为它顺手把后面「命令找不到」的问题也解决了。

#### 方式一：装进虚拟环境（推荐）

```bash
python -m venv .venv

# Windows 激活
.venv\Scripts\activate
# macOS / Linux 激活
source .venv/bin/activate

pip install -e .                  # 想用交互式 REPL 就装 pip install -e ".[repl]"
```

激活状态下 `.venv` 自己的 Scripts 目录会自动进 PATH，`cli-anything-siyuan` 直接能用。
代价是**每次开新终端都要先激活一次**（回到 `agent-harness` 目录执行上面那句 activate）。

#### 方式二：装进系统 Python

```bash
pip install -e .                  # 想用交互式 REPL 就装 pip install -e ".[repl]"
```

装完会多一个 `cli-anything-siyuan` 命令。如果运行时提示 `command not found`，
Windows 下提示「不是内部或外部命令」，说明 Python 的 Scripts 目录不在系统 PATH 里，
照下面把路径加进去。

先查出脚本目录：

```bash
python -c "import sysconfig; print(sysconfig.get_path('scripts'))"
```

- **Windows**：把这条命令输出的路径（形如 `C:\Users\你的用户名\AppData\Local\Programs\Python\Python312\Scripts`）
  加进「系统属性 → 高级 → 环境变量 → 用户变量 Path」。如果装的时候用了 `pip install --user`，
  目录在 `%APPDATA%\Python\PythonXY\Scripts`。
- **macOS / Linux**：在 `~/.zshrc`（zsh）或 `~/.bashrc`（bash）末尾加一行，
  路径用上面命令的输出；用 `--user` 装的通常在 `~/.local/bin`：

  ```bash
  export PATH="$HOME/.local/bin:$PATH"
  ```

  `source ~/.zshrc`（或 `~/.bashrc`）让改动立即生效。

改完 PATH 要**重开终端**才算生效。验证：

```bash
cli-anything-siyuan --help
```

#### 临时办法：不改 PATH，直接用绝对路径

把本文后面所有 `cli-anything-siyuan` 换成脚本目录下的完整文件名即可：

```bash
# Windows
"C:\...\Python312\Scripts\cli-anything-siyuan.exe" export md <doc-id>
# macOS / Linux
/path/to/scripts/cli-anything-siyuan export md <doc-id>
```

#### 配置

首次使用先写配置，放到 `~/.siyuan-cli.json`：

```json
{
  "host": "127.0.0.1",
  "port": 6806,
  "token": "你的 API token"
}
```

Token 在 **思源 → 设置 → 关于 → API Token**。
也可以改用环境变量 `SIYUAN_HOST` / `SIYUAN_PORT` / `SIYUAN_TOKEN`。

#### 让 Agent 代办

不想自己拼 JSON，就把它的 skill 装上，之后一句话让它干活：

```bash
npx skills add HKUDS/CLI-Anything --skill cli-anything-siyuan -g -y
```

指令示例：`sy 20211103171034-f14h747 制作卡片`、`思源 制作卡片 <doc-id>`、`sy 导出为卡片 <doc-id>`
（`sy` 只是 `cli-anything-siyuan` 的简写别名，按自己习惯设。）

#### 手动流程

1. `cli-anything-siyuan export md <doc-id>` 导出文档 Markdown
2. 按下面的格式生成 `tasks.json`
3. 在挂件里 **⚙️ → 导入数据** 选择该文件

CLI 的完整用法（notebook / doc / block / search / sql 等命令）见它的
[README](https://github.com/HKUDS/CLI-Anything/blob/main/siyuan/agent-harness/cli_anything/siyuan/README.md)。

### 二、任务 JSON 格式

这一节是**挂件导入时的契约**，cli-anything-siyuan（或任何脚本、AI）生成的 `tasks.json`
必须按这个来，否则任务会被静默丢弃，或者把已有任务的内容覆盖掉。

#### 导入入口

挂件里点 **⚙️ → 导入数据**，选 JSON 文件。导入结果不弹窗提示：合法条目直接写入，
不合法条目静默跳过，所以导入前先照下面的硬约束自查一遍。

#### 完整示例

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

#### 顶层字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `version` | `string` | 是 | 数据格式版本，固定 `"1.0.0"` |
| `exportTime` | `string` | 是 | 导出时间，ISO 格式 |
| `tasks` | `object[]` | 是 | 任务数组 |
| `statusTexts` | `object` | 是 | 状态文字映射 |

#### 任务字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | 是 | 唯一标识，缺了整条丢弃 |
| `title` | `string` | 是 | 任务标题，同时是导入时的去重依据 |
| `description` | `string` | 否 | Markdown 描述 |
| `status` | `string` | 是 | `todo` / `doing` / `done` / `unfinish` |
| `createdAt` | `number` | 否 | 创建时间戳（毫秒） |
| `updatedAt` | `number` | 否 | 更新时间戳（毫秒） |
| `order` | `number` | 否 | 排序值 |
| `startDate` | `number\|null` | 否 | 开始日期时间戳（毫秒） |
| `endDate` | `number\|null` | 否 | 结束日期时间戳（毫秒） |
| `archived` | `boolean` | 否 | 归档标记，默认 `false` |
| `tags` | `string[]` | 否 | 标签数组 |

#### 状态取值

| 状态值 | 默认显示 | 含义 |
|--------|----------|------|
| `todo` | 计划中 | 待办任务 |
| `doing` | 进行中 | 进行中的任务 |
| `done` | 已完成 | 已完成任务 |
| `unfinish` | 未完成 | 未完成任务（如逾期） |

#### 硬约束

生成 JSON 前逐条对照，这几条都是踩过的：

1. **`id` / `title` / `status` 三个缺一个，整条任务被丢弃**，不报错、不提示。
2. **`status` 必须是 `todo` / `doing` / `done` / `unfinish` 之一**，写 `"完成"`、`"pending"` 这类值同样会被丢弃。
3. **同标题视为同一条任务**：已存在同标题任务时执行**覆盖更新** ——
   更新 `description`、`status`、`startDate`、`endDate`、`tags`；保留原 `title`、`createdAt`、`archived`。
   不会新增第二条。所以同一批文档重复导出是安全的。
4. **覆盖时省略的可选字段会被清空**：上面那五个字段在覆盖路径里都用空值兜底，
   只改状态却漏写 `description` / `tags`，原有描述和标签会被清空。要保留就一起带上。
5. **时间戳统一毫秒（13 位）**，不是秒；日期没设定就传 `null`，不要传空字符串。
6. **`statusTexts` 一旦给出就整体覆盖看板四列的名称**（先和默认值合并，再写回挂件）。
   不想改列名就把这个字段整个省掉，别传空对象。
7. **`version` 固定 `"1.0.0"`**，`exportTime` 用 ISO 字符串，两者目前不参与校验，但保持格式一致便于排查。

---

## English

The DynamicTodo widget does exactly two things: **import JSON and render the board**. Reading a SiYuan
document and turning it into task cards is the job of the SiYuan CLI (`cli-anything-siyuan`) that ships with
[CLI-Anything](https://github.com/HKUDS/CLI-Anything).

```text
SiYuan document → cli-anything-siyuan export → agent (or you) writes tasks.json → import in the widget
```

This document covers two things: how to install that CLI, and the exact JSON format it must produce.

### 1. Installation

Requirements: a running SiYuan 3.x instance, Python 3.10+.

Clone the repository first:

```bash
git clone https://github.com/HKUDS/CLI-Anything.git
cd CLI-Anything/siyuan/agent-harness
```

Then install it one of two ways. **Option 1 is recommended** — it also takes care of the
"command not found" problem described below.

#### Option 1: install into a virtual environment (recommended)

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -e .                  # add the interactive REPL with: pip install -e ".[repl]"
```

While the environment is active, its own `Scripts` directory is on `PATH`, so `cli-anything-siyuan` just works.
The trade-off: **you have to activate it again in every new terminal** (go back to `agent-harness` and run the
`activate` line above).

#### Option 2: install into the system Python

```bash
pip install -e .                  # add the interactive REPL with: pip install -e ".[repl]"
```

This adds a `cli-anything-siyuan` command. If running it reports `command not found`
(or "not recognized as an internal or external command" on Windows), the Python `Scripts` directory is not on
your `PATH`. Add it as follows.

Find the directory first:

```bash
python -c "import sysconfig; print(sysconfig.get_path('scripts'))"
```

- **Windows**: add the printed path (something like
  `C:\Users\<you>\AppData\Local\Programs\Python\Python312\Scripts`) to
  "System Properties → Advanced → Environment Variables → User variables → Path".
  If you installed with `pip install --user`, the directory is `%APPDATA%\Python\PythonXY\Scripts`.
- **macOS / Linux**: append one line to `~/.zshrc` (zsh) or `~/.bashrc` (bash), using the path printed above —
  with `--user` installs it is usually `~/.local/bin`:

  ```bash
  export PATH="$HOME/.local/bin:$PATH"
  ```

  Run `source ~/.zshrc` (or `~/.bashrc`) to apply it immediately.

**Open a new terminal** for `PATH` changes to take effect. Verify:

```bash
cli-anything-siyuan --help
```

#### Shortcut: skip `PATH` entirely

Replace every `cli-anything-siyuan` below with the full path of the launcher:

```bash
# Windows
"C:\...\Python312\Scripts\cli-anything-siyuan.exe" export md <doc-id>
# macOS / Linux
/path/to/scripts/cli-anything-siyuan export md <doc-id>
```

#### Configuration

Create `~/.siyuan-cli.json`:

```json
{
  "host": "127.0.0.1",
  "port": 6806,
  "token": "your API token"
}
```

The token is under **SiYuan → Settings → About → API token**. You can also use the environment variables
`SIYUAN_HOST` / `SIYUAN_PORT` / `SIYUAN_TOKEN` instead.

#### Let an agent do the work

If you would rather not write JSON by hand, install its skill and just ask in plain language:

```bash
npx skills add HKUDS/CLI-Anything --skill cli-anything-siyuan -g -y
```

Example prompts: `sy 20211103171034-f14h747 制作卡片`, `思源 制作卡片 <doc-id>`, `sy 导出为卡片 <doc-id>`.
(`sy` is just a shorthand alias for `cli-anything-siyuan` — set it up however you like.)

#### Manual flow

1. `cli-anything-siyuan export md <doc-id>` exports the document as Markdown
2. Write `tasks.json` in the format below
3. In the widget, open **⚙️ → Import data** and pick the file

The full command reference (notebook / doc / block / search / sql and friends) is in the CLI's own
[README](https://github.com/HKUDS/CLI-Anything/blob/main/siyuan/agent-harness/cli_anything/siyuan/README.md).

### 2. Task JSON format

This section is the **import contract** of the widget. Any `tasks.json` produced by `cli-anything-siyuan`,
a script or an AI model must follow it — otherwise tasks are silently dropped, or existing tasks get
overwritten.

#### Import entry point

In the widget, open **⚙️ → Import data** and choose a JSON file. There is no dialog afterwards: valid entries
are written straight away, invalid entries are skipped without a message. Check the hard rules below before
importing.

#### Complete example

```json
{
  "version": "1.0.0",
  "exportTime": "2026-05-20T03:33:26.128Z",
  "tasks": [
    {
      "id": "1779175153949-5rvsvbyc8",
      "title": "Task title",
      "description": "Description supporting **Markdown**",
      "status": "todo",
      "createdAt": 1747612800000,
      "updatedAt": 1747612800000,
      "order": 0,
      "startDate": 1747612800000,
      "endDate": null,
      "archived": false,
      "tags": ["work", "frontend"]
    }
  ],
  "statusTexts": {
    "todo": "Planned",
    "doing": "In progress",
    "done": "Done",
    "unfinish": "Unfinished"
  }
}
```

#### Top-level fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | `string` | yes | Data format version, always `"1.0.0"` |
| `exportTime` | `string` | yes | Export time, ISO format |
| `tasks` | `object[]` | yes | Array of tasks |
| `statusTexts` | `object` | yes | Mapping of status code to column title |

#### Task fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | yes | Unique identifier; the whole task is dropped without it |
| `title` | `string` | yes | Task title, also the key used for de-duplication on import |
| `description` | `string` | no | Markdown description |
| `status` | `string` | yes | `todo` / `doing` / `done` / `unfinish` |
| `createdAt` | `number` | no | Creation timestamp (milliseconds) |
| `updatedAt` | `number` | no | Last update timestamp (milliseconds) |
| `order` | `number` | no | Sort value |
| `startDate` | `number\|null` | no | Start date timestamp (milliseconds) |
| `endDate` | `number\|null` | no | End date timestamp (milliseconds) |
| `archived` | `boolean` | no | Archive flag, defaults to `false` |
| `tags` | `string[]` | no | Tag array |

#### Status values

| Value | Default title (Chinese UI) | Default title (English UI) | Meaning |
|-------|----------------------------|----------------------------|---------|
| `todo` | 计划中 | Planned | To do |
| `doing` | 进行中 | In progress | Being worked on |
| `done` | 已完成 | Done | Finished |
| `unfinish` | 未完成 | Unfinished | Not finished, e.g. overdue |

#### Hard rules

Check every item before generating JSON — each of these has bitten someone:

1. **Leave out any of `id` / `title` / `status` and the whole task is dropped**, with no error and no warning.
2. **`status` must be one of `todo` / `doing` / `done` / `unfinish`.** Values such as `"done "` with whitespace,
   `"pending"` or a translated label like `"完成"` are dropped as well.
3. **A task with the same title counts as the same task.** If one already exists it is **updated in place**:
   `description`, `status`, `startDate`, `endDate` and `tags` are overwritten, while `title`, `createdAt` and
   `archived` are kept. No second card is created, so re-exporting the same document is safe.
4. **Omitted optional fields are cleared on update.** All five of those fields fall back to empty values on the
   update path — change only the status without repeating `description` / `tags` and the existing description
   and tags are wiped. Send them along if you want to keep them.
5. **All timestamps are milliseconds (13 digits)**, not seconds. Use `null` for "no date set", never an empty
   string.
6. **A `statusTexts` object replaces all four column titles** (merged over the defaults, then written back to the
   widget). If you do not want to rename the columns, omit the field entirely rather than sending `{}`.
7. **`version` is always `"1.0.0"`** and `exportTime` is an ISO string. Neither is validated today, but keeping
   them consistent makes debugging easier.
