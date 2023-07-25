# ToDo List

动态更新的ToDo List

## 缘由

> 集市中的SiYuanToDo挂件不更新了也找不到了，新创建的也无法初始化，思来想去决定还是自己做一个吧。


## 介绍
* 每个文档都可以建多个DynamicTodo
* 实现了任务创建，更新，删除，预览
* 任务创建，跟新面板可以拖动
* 数据存放为挂件的块属性，多谢[学习思源挂件]这个挂件给的启示。
* 如果挂件挂死，多半是数据有问题，参考sample.json，对属性中对应的数据进行手动修复，将错误的数据进行删除。
* 支持markdown语法，markdown超链接支持网址。markdown超链接不要链接除思源和网址外的其他地址！！！！
* 其他的我不会！

## 其它

* 非专业前端，无审美，有问题可能会需要很久才能修复。
* [界面参考](https://dribbble.com/shots/14552329--Exploration-Task-Management-Dashboard/attachments/6241009?mode=media)

## 捐赠

如果您认可这个项目，请我喝一杯咖啡吧，这将鼓励我持续更新，并创作出更多好用的工具~

<div>
<img src="https://cdn.jsdelivr.net/gh/hito0512/ImageStore/zs.jpg" alt="wechat" style="width:280px;height:280px;" />
</div>


## 预览

#### 预览1
<div>
<img src="https://cdn.jsdelivr.net/gh/hito0512/ImageStore/1.png"  />
</div>


#### 预览2
<div>
<img src="https://cdn.jsdelivr.net/gh/hito0512/ImageStore/2.png"  />
</div>


## 更新记录
v0.1.5

[更新]

1. markdown增加支持http和https

[修复]

1. 修复一些已知的问题
2. 减小任务卡的高度
3. 提高非选中状态下的透明度

---
v0.1.4

[更新]
1. 增加支持markdown
2. 界面美化

[提醒]
1. markdown超链接不要写网址链接，这会导致在挂件内打开网址。

---
v0.1.3
[更新]
1. 更新挂件发布的版本信息

---
v0.1.2
[增加]
1. 增加任务预览，鼠标移动到任务标题即可
2. 创建任务成功后，创建任务面板自动关闭
3. 更新任务后，更新任务面板自动关闭

[修复]
1. 修复更新任务后，原始数据依然保留，导致出现两个任务卡的问题
2. 修复内容中含有[]会导致挂件崩溃的问题
3. 修复更新内容后再次创建任务时仍然有上次的内容

---
v0.1.1
1. 修复一些版本发布中widget.json的书写问题

---
v0.1.0 初版
1. 实现了一些基础功能：创建任务，更新任务，删除任务
   
