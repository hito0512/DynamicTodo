# DynamicTodo

思源笔记挂件 — 动态任务看板

## 功能

- **双视图切换**：看板视图 / 日历视图，标签切换
- **任务管理**：创建、编辑、删除任务
- **拖拽排序**：任务卡片拖拽到不同状态列
- **日期范围**：支持开始日期和结束日期，日历视图连续显示
- **任务预览**：鼠标悬停预览任务详情
- **Markdown 支持**：任务描述支持 Markdown 语法和超链接
- **状态自定义**：任务状态文本可自定义
- **数据持久化**：数据存放在思源块属性中

## 预览

<div>
<img src="https://cdn.jsdelivr.net/gh/hito0512/ImageStore/1.png" />
</div>

<div>
<img src="https://cdn.jsdelivr.net/gh/hito0512/ImageStore/2.png" />
</div>

## 开发

所需文件：

- `widget.json` — 挂件配置
- `icon.png` (160*160) — 挂件图标
- `preview.png` (1024*768) — 预览图
- `README.md` — 自述文件
- `index.html` — 入口文件

## widget.json

```json
{
  "name": "DynamicTodo",
  "author": "hito0512",
  "url": "https://github.com/hito0512/DynamicTodo",
  "version": "0.1.6",
  "minAppVersion": "2.9.3",
  "displayName": {
    "default": "DynamicTodoList",
    "zh_CN": "DynamicTodo"
  },
  "description": {
    "default": "This is a dynamically updating todo list.",
    "zh_CN": "这是一个动态更新的 todo list。"
  },
  "readme": {
    "default": "README.md",
    "zh_CN": "README.md"
  }
}
```

## 更新记录

详见 [CHANGELOG.md](CHANGELOG.md)

## 捐赠

如果您认可这个项目，请我喝一杯咖啡吧，这将鼓励我持续更新，并创作出更多好用的工具~

<div>
<img src="https://cdn.jsdelivr.net/gh/hito0512/ImageStore/zs.jpg" alt="wechat" style="width:280px;height:280px;" />
</div>
