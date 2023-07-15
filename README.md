# ToDo List

## 动态更新的ToDo List

## 缘由

> 集市中的SiYuanToDo挂件不更新了也找不到了，新创建的也无法初始化，思来想去决定还是自己做一个吧。 **位置: 集市 -> 挂件-> DynamicTodo**




## 介绍
* 每个文档都可以建多个DynamicTodo
* 实现了任务创建，更新，删除，预览
* 任务创建，跟新面板可以拖动
* 数据存放为挂件的块属性，多谢[学习思源挂件]这个挂件给的启示。
* 如果挂件挂死，多半是数据有问题，参考sample.json，对属性中对应的数据进行手动修复，将错误的数据进行删除【已经做了多次各种测试，[]错误引发的挂死已经修复，暂没找到其他字符导致的挂死】。
* 其他的我不会！

## 其它

* 非专业前端，无审美，有问题可能会需要很久才能修复。
* [界面参考](https://dribbble.com/shots/14552329--Exploration-Task-Management-Dashboard/attachments/6241009?mode=media)

## 预览

#### 预览1

![preview](https://github.com/hito0512/DynamicTodo/blob/main/preview/preview.png)

#### 预览2

![preview2](https://github.com/hito0512/DynamicTodo/blob/main/preview/preview2.png)


## 更新记录
v0.1.2
[增加]
1. 增加任务预览，鼠标移动到任务标题即可
2. 创建任务成功后，创建任务面板自动关闭
3. 更新任务后，更新任务面板自动关闭

[修复]
1. 修复更新任务后，原始数据依然保留，导致出现两个任务卡的问题
2. 修复内容中含有[]会导致挂件崩溃的问题
3. 修复更新内容后再次创建任务时仍然有上次的内容


v0.1.1
1. 修复一些版本发布中widget.json的书写问题

v0.1.0 初版
1. 实现了一些基础功能：创建任务，更新任务，删除任务
   
