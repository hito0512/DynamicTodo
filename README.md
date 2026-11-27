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
- **中英双语**：默认跟随思源界面语言，也可在设置面板里单独指定中文 / English

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

The UI follows SiYuan's interface language by default. You can also force Chinese or English for this widget only, in the Settings tab.

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

这一步不是挂件自己做的。挂件只负责「导入 JSON、显示看板」，读笔记、整理成任务是
[CLI-Anything](https://github.com/HKUDS/CLI-Anything) 里思源 CLI（`cli-anything-siyuan`）的活：
CLI 把文档导出来，Agent 按下面的格式写成 `tasks.json`，再导入挂件。

### 安装 cli-anything-siyuan

前置：思源 3.x 正在运行，Python 3.10+。

先把仓库拉下来：

```bash
git clone https://github.com/HKUDS/CLI-Anything.git
cd CLI-Anything/siyuan/agent-harness
```

然后二选一装。**推荐方式一**，因为它顺手把后面「命令找不到」的问题也解决了。

**方式一：装进虚拟环境（推荐）**

```bash
python -m venv .venv

# Windows 激活
.venv\Scripts\activate
# macOS / Linux 激活
source .venv/bin/activate

pip install -e .                  # 想用交互式 REPL 就装 pip install -e ".[repl]"
```

激活状态下 `.venv` 自己的 Scripts 目录会自动进 PATH，`cli-anything-siyuan` 直接能用。
代价是**每次开新终端都要先激活一次**（重进 `agent-harness` 目录执行上面那句 activate）。

**方式二：装进系统 Python**

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

**临时办法：不改 PATH，直接用绝对路径**

把本文后面所有 `cli-anything-siyuan` 换成脚本目录下的完整文件名即可：

```bash
# Windows
"C:\...\Python312\Scripts\cli-anything-siyuan.exe" export md <doc-id>
# macOS / Linux
/path/to/scripts/cli-anything-siyuan export md <doc-id>
```

首次使用先写配置，放到 `~/.siyuan-cli.json`：

```json
{
  "host": "127.0.0.1",
  "port": 6806,
  "token": "你的 API token"
}
```

Token 在 **思源 → 设置 → 关于 → API Token**。也可以改用环境变量 `SIYUAN_HOST` / `SIYUAN_PORT` / `SIYUAN_TOKEN`。

### 让 Agent 代办

不想自己拼 JSON，就把它的 skill 装上，之后一句话让它干活：

```bash
npx skills add HKUDS/CLI-Anything --skill cli-anything-siyuan -g -y
```

指令示例：`sy 20211103171034-f14h747 制作卡片`、`思源 制作卡片 <doc-id>`、`sy 导出为卡片 <doc-id>`
（`sy` 只是 `cli-anything-siyuan` 的简写别名，按自己习惯设。）

### 手动流程

1. `cli-anything-siyuan export md <doc-id>` 导出文档 Markdown
2. 按上文格式生成 `tasks.json`
3. 在挂件里 **⚙️ → 导入数据** 选择该文件

CLI 的完整用法（notebook / doc / block / search / sql 等命令）见它的
[README](https://github.com/HKUDS/CLI-Anything/blob/main/siyuan/agent-harness/cli_anything/siyuan/README.md)。

## 更新记录

详见 [CHANGELOG.md](./CHANGELOG.md)

## 捐赠

如果这个挂件对你有帮助，欢迎请我喝杯咖啡，这会鼓励我继续更新。

<div>
<img src="https://cdn.jsdelivr.net/gh/hito0512/ImageStore/zs.jpg" alt="wechat" style="width:280px;height:280px;" />
</div>
