//此种导入使用时用 api.xxx() 调用;且由于api.js里全是异步函数,调用时需加上 await关键词,示例: await api.xxx()
import * as api from './api.js';
//此种导入使用时直接 xxx() 调用
import {
	curtime,assert,beautify,getWidgetBlockInfo,delayMs
} from "./util.js";
import {config} from "./config.js";

document.addEventListener('DOMContentLoaded', (event) => {
    var dragSrcEl = null;
    var global_init = false;

    function handleDragStart(e) {
        // this.style.opacity = '0.1';
        // this.style.border = '3px dashed #c4cad3';

        dragSrcEl = this;

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
    }

    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }

        e.dataTransfer.dropEffect = 'move';

        return false;
    }

    function handleDragEnter(e) {
        this.classList.add('task-hover');
    }

    function handleDragLeave(e) {
        this.classList.remove('task-hover');
    }

    function handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation(); // stops the browser from redirecting.
        }

        if (dragSrcEl != this) {
            dragSrcEl.innerHTML = this.innerHTML;
            this.innerHTML = e.dataTransfer.getData('text/html');
        }

        return false;
    }

    function handleDragEnd(e) {
        // this.style.opacity = '1';
        // this.style.border = 0;

        // items.forEach(function (item) {
        //     item.classList.remove('task-hover');
        // });
    }
    // 给每个任务增加编辑按钮：删除或重新编辑
    var openPanel = null;
    /*- 当前需要更新的div */
    var currentUpdateDiv = null; 
    // 增加任务函数岁鼠标拖动
    var isDragging = false;
    var mouseOffsetX, mouseOffsetY;

    // 初始化
    initSys().then(r => {console.log(' Todo Task 初始化完成!! '); });

    // 打开增加任务面板
    var aside = document.getElementById("addTask");   // div
    var taskSetting = document.getElementById('taskSetting');
    var addbtn = document.getElementById("submit");
    var update = document.getElementById("update");

    // 获取任务界面的相关参数
    var title = document.getElementById("taskname");      // 任务名称
    var content = document.getElementById("taskcontent"); // 任务内容
    var taskType = document.getElementById("taskType");   // 任务类型

    // 任务预览
    var taskPreview = document.getElementById("taskPreview");
    var previewDivTitle = document.getElementById("ptitle");
    var previewDivState = document.getElementById("pstate");
    var previewDivContent = document.getElementById("pcontent");
    var previewDivTime = document.getElementById("ptime");
    /*- ---------------------------------------------------------------------- */
    // 显示面板
    document.addEventListener('click', function (event) {
        if (event.target.className === 'project-column-heading__options') {
            toggleDiv(true);
        }
        
    });


    // 更新任务
    update.addEventListener('click', async function() {
        await updateDiv();

        // 创建结束后选项卡关闭
        taskSetting.classList.remove('visible');
        aside.classList.remove('visible');
        title.value = '';
        content.value = '';
    });

    // 创建任务
    addbtn.addEventListener('click', async function () {
        var flag = await addNewTask();
        if (flag) {
            // 创建结束后选项卡关闭
            taskSetting.classList.remove('visible');
            aside.classList.remove('visible');
            title.value = '';
            content.value = '';
        }
    });

    // 对任务的各种编辑
    document.addEventListener("click", function(event) {
        // 【添加按钮】
        addButton(event);

        // 关闭面板
        showAddPanel(event);

        // 【按钮功能】：重新编辑按钮,删除按钮增加功能
        buttonFunc(event);
        
        // 关闭预览
        closeTaskPreviewDiv(event);
    });

    // -----------------------  任务预览  ----------------
    document.addEventListener("mouseover", function (event) {
        dataPreview(event);
    });

    // 关闭任务预览
    taskPreview.addEventListener("mouseleave", function () {
        taskPreview.style.display = 'none';
    });
    // document.addEventListener("mouseout", function () {
    //     taskPreview.style.display = 'none';
    // });

    
    /*- ------------------ 其他函数 ------------------------- */
    // 初始化
    async function initSys() {
        if (!global_init) {
            global_init = true;
            // 获取块保存的数据信息
            var result = await getBlockInfo();
            // 取出保存的数据
            for (var key in result) {
                if (key.startsWith("custom")) {
                    var type = key.split("-")[1]
                    var preStr = result[key];
                    // 先转换为对象
                    var preDictAll = JSON.parse(preStr);
                    for (var i = 0; i < preDictAll.length; i++) {
                        var obj = preDictAll[i];
                        // var currentKey = Object.keys(obj);
                        // currentKey.forEach(curkey => {
                        //     console.log(curkey + ": " + obj[curkey])
                        //  });
                    
                        var task = {
                            title      : obj.title,
                            description: obj.description,
                        };
                        var createTime = {
                            year : obj.year,
                            month: obj.month,
                            day  : obj.day,
                            hour : obj.hour,
                            min  : obj.min,
                            sec  : obj.sec,
                        };
                        // 创建一个任务div
                        createTaskDiv(task, type, createTime);
                    }
                }
            }
        }
    }

    // 数据预览
    function dataPreview(event) {
        // 先设置预览框的位置
        var divNode = event.target;
        if (divNode.classList[0] === 'task__tag') {
            // 获取内容
            var parentDiv = divNode.parentNode.parentNode;
            var divType = divNode.classList[1].split("--")[1];
            var chineseType;
            if (divType === 'unfinish') {
                chineseType = '未完成';
            }
            else if (divType === 'done') {
                chineseType = '已完成';
            }
            else if (divType === 'doing') {
                chineseType = '进行中';
            }
            else {
                chineseType = '计划中';
            }
            
            var year = parentDiv.querySelector(".year");
            var time = parentDiv.querySelector(".time");
            // 进行显示
            var divContent = parentDiv.getElementsByTagName("p");      // 任务内容
            divContent = divContent[0].textContent;
            previewDivTitle.textContent = divNode.textContent;;
            previewDivState.textContent = chineseType;
            // markdown
            divContent = marked.parse(divContent);
            // previewDivContent.textContent = divContent;
            previewDivContent.innerHTML = divContent;
            previewDivTime.textContent = year.innerText + " - " + time.innerText.split(" ")[0];

            // 设定位置
            taskPreview.style.display = 'block';
            var left = event.clientX - taskPreview.offsetWidth -30;
            if (left < 0) {
                left = event.clientX + 30 ;
            }
            var top = event.clientY;
            if (event.clientY + taskPreview.offsetHeight > window.innerHeight) {
                top = event.clientY - taskPreview.offsetHeight / 2;
                left = left - 20;
            }
            taskPreview.style.top = top + 30 + "px";
            taskPreview.style.left = left + "px";
            var divHeight = previewDivContent.offsetHeight;
            taskPreview.style.height = divHeight + 220+  "px";
        }
    }
    // 更新数据
    async function updateDiv() {
        var taskTitle = title.value;     // 任务名称
        var taskContent = content.value;  // 任务内容
        var type = taskType.value;   // 任务类型
        
        var task = {
            title      : taskTitle,
            description: taskContent,
        };
        // 更新保存的数据
        var result = await getBlockInfo();
        // console.log('-- ' + beautify(result));
        // 更新数据的时候获取创建的时间，所以时间传null
        await updateDivData(result, task, type, true, null);
        if (currentUpdateDiv != null) {
            var parentDiv = currentUpdateDiv.parentNode.parentNode; // div.task
            var newTitle = parentDiv.querySelector(".task__tag");      // 任务名称
            var newContent = parentDiv.getElementsByTagName("p");      // 任务内容
            var oldTaskTypeAll = newTitle.classList[1];                   // 原始任务类型
            var oldTaskType = oldTaskTypeAll.split("--")[1];
            newTitle.textContent = taskTitle;
            newContent[0].textContent = taskContent;
            // 更新类别标签
            if (oldTaskType != type) {
                // 将任务的标签类型同时更改
                var newTag = oldTaskTypeAll.split("--")[0] + "--"+type;
                newTitle.classList.replace(newTitle.classList[1], newTag);
                // 将任务移动到新的任务类型下面
                var newType = 'project-' + type
                var newTaskType = document.getElementById(newType);
                // newTaskType.appendChild(parentDiv);

                var addTaskCard = newTaskType.querySelector('.addTaskCard');
                addTaskCard.parentNode.insertBefore(parentDiv, addTaskCard);
            }
        }
    }

    // 关闭创建任务界面
    function showAddPanel(event) {
        if (!taskSetting.contains(event.target) && event.target.className != 'project-column-heading__options') {
            taskSetting.classList.remove('visible');
            aside.classList.remove('visible');
        }
    }

    // 关闭任务预览
    function closeTaskPreviewDiv(event) {
        if ( !taskPreview.contains(event.target) ) {
            taskPreview.style.display = 'none';
        }
    }

    // 创建和更新切换
    function toggleDiv(flag) {
        if (!taskSetting.classList.contains('visible')) {
            taskSetting.classList.add('visible');
            aside.classList.add('visible');
            if (flag) {
                update.style.display = 'none';
                addbtn.style.display = 'block';
            }
            else {
                update.style.display = 'block';
                addbtn.style.display = 'none';
            }
        }
    }

    // 添加按钮
    function addButton(event) {
        closePanel(event, openPanel);
        if (event.target.tagName === "BUTTON" && (event.target.className === 'task__options')) {
            var parentDiv = event.target.parentNode.parentNode; // div.task
            var targetDiv = parentDiv.querySelector('.editPanel');
            openPanel = parentDiv;
            if (!parentDiv.contains(targetDiv)) {
                var panel = document.createElement('div');
                // 在面板中创建编辑按钮
                var editButton = document.createElement('button');
                editButton.className = 'edbutton'
                editButton.innerHTML = '<i class="editIcon"></i>编辑';
                panel.appendChild(editButton);
        
                // 在面板中创建删除按钮
                var deleteButton = document.createElement('button');
                deleteButton.className = 'delbutton';
                deleteButton.innerHTML = '<i class="delIcon"></i>删除';
                panel.appendChild(deleteButton);
                
                panel.className = 'editPanel';
                panel.id = 'editPanel_id';
                event.target.parentNode.parentNode.appendChild(panel);
            }
            else {
                var panel = parentDiv.querySelector('.editPanel');
                panel.style.display = 'flex';
            }
        }
    }

    // 按钮功能
    async function buttonFunc(event) {
        // 删除任务
        if (event.target.tagName === "BUTTON" && (event.target.className === 'delbutton')) {
            // 删除任务选项卡
            var parentDiv = event.target.parentNode.parentNode;
            var root = parentDiv.parentNode;
            root.removeChild(parentDiv);

            // 删除保存的数据
            currentUpdateDiv = event.target;
            var result = await getBlockInfo();
            await removeData(result);
            currentUpdateDiv = null;
        }
        
        // 重新编辑
        if (event.target.tagName === "BUTTON" && (event.target.className === 'edbutton')) {
            // 当前需要更新的界面id
            currentUpdateDiv = event.target;
            // 获取以前的旧数据
            var parentDiv = event.target.parentNode.parentNode;    // div.task
            var newTitle = parentDiv.querySelector(".task__tag");      // 任务名称
            var newContent = parentDiv.getElementsByTagName("p");      // 任务内容
            var oldTaskTypeAll = newTitle.classList[1];                   // 原始任务类型
            var oldTaskType = oldTaskTypeAll.split("--")[1];

            title.value    = newTitle.textContent;       // 原始的任务名称
            content.value  = newContent[0].textContent;  // 原始的任务内容
            taskType.value = oldTaskType;                // 原始的任务类型
            
            // 将以前的数据进行显示
            toggleDiv(false);
        }
    }

    // 数据保存
    async function updateDivData(result, task, type, remove, createTime) {
        // console.log("删除前: " + beautify(result))
        // 如果更新的话，首先删除已经存在的数据，然后重新添加
        if (remove) {
            createTime = await removeData(result);
            // 重新获取数据
            var result = await getBlockInfo();
        }

        // 打包数据
        var data = Object.assign({}, task, createTime);
        // 转为字符串
        data = JSON.stringify(data);
        var attr = 'custom-' + type;
        // 首先获取以前的数据
        if (result[attr] === undefined) {
            // 以前没有的话直接创建
            data = '[' + data + ']';
            setBAttrs([type], data).then(r => { });
        }
        else {
            // 先提取以前保存的数据
            var preStr = result[attr];
            // 先转换为对象
            var preDictAll = JSON.parse(preStr);
            var curStr = JSON.stringify(preDictAll);
            // var stem = curStr.match(/\[(.*?)\]/)[1];
            var stem = curStr.substring(1, curStr.length - 1);
            if (stem === '') {
                curStr = '[' + data + ']';
            }
            else {
                curStr = '[' + stem + ',' + data + ']';
            }     
            // 重新保存
            setBAttrs([type], curStr).then(r => { });
        }
    }

    // 删除数据, 获取以前的数据然后删除
    async function removeData(result) {
        if (currentUpdateDiv != null) {
            var parentDiv = currentUpdateDiv.parentNode.parentNode;    // div.task
            var Title = parentDiv.querySelector(".task__tag");         // 任务名称
            var newContent = parentDiv.getElementsByTagName("p");      // 任务内容
            var oldTaskTypeAll = Title.classList[1];                   // 原始任务类型
            var oldTaskType = oldTaskTypeAll.split("--")[1];
            var oldattr = 'custom-' + oldTaskType;
            var oldStr = result[oldattr];
            var oldDictAll = JSON.parse(oldStr);
            var oldtitle = Title.textContent;
            // 获取创建时间
            var createTime = {};
            oldDictAll.forEach(obj => {
                if (obj.title === oldtitle && obj.description === newContent[0].textContent ) {
                    createTime = {
                        year : obj.year,
                        month: obj.month,
                        day  : obj.day,
                        hour : obj.hour,
                        min  : obj.min,
                        sec  : obj.sec,
                    };
                }
            });
            
            oldDictAll = oldDictAll.filter(obj => { 
                return !(obj.title === oldtitle && obj.description === newContent[0].textContent)
            });

            var curStr = JSON.stringify(oldDictAll);
            // var stem = curStr.match(/\[(.*?)\]/)[1];
            var stem = curStr.substring(1, curStr.length - 1);
            curStr = '[' + stem + ']';
            // 重新保存
            await setBAttrs([oldTaskType], curStr);//.then(r => { });

            return createTime;
        }
    }

    
    // 关闭编辑界面
    function closePanel(event, Panel) {
        if (Panel != null && !Panel.contains(event.target)) {
            var panel = Panel.querySelector('.editPanel');
            panel.style.display = 'none';
            Panel = null;
        }
    }

    // 鼠标按下时开始拖动
    aside.addEventListener("mousedown", function (event) {
        if (event.target.className !== 'taskname' && event.target.className !== 'taskcontent') {
            if (aside.contains(event.target)) {
                isDragging = true;
                mouseOffsetX = event.clientX - aside.offsetLeft;
                mouseOffsetY = event.clientY - aside.offsetTop;
            }
        }
        
    });

    // 鼠标移动时更新 div 的位置
    document.addEventListener("mousemove", function (event) {
        
        if (event.target.className !== 'taskname' && event.target.className !== 'taskcontent') {
            if (aside.contains(event.target) && isDragging) {
                aside.style.left = event.clientX - mouseOffsetX + "px";
                aside.style.top = event.clientY - mouseOffsetY + "px";
                if (aside.style.left < aside.offsetLeft) {
                    aside.style.left += 5;
                }
                if (aside.style.top < aside.offsetTop) {
                    aside.style.top += 5;
                }
            }
            
        }
    });

    // 鼠标松开时停止拖动
    document.addEventListener("mouseup", function () {
        isDragging = false;
    });



    /*- ------------------ 异步函数 ------------------------- */
    // 创建任务
    async function addNewTask() {
        var taskTitle = title.value;     // 任务名称
        var taskContent = content.value;  // 任务内容
        var type = taskType.value;   // 任务类型

        // 不允许空任务
        if (taskTitle === '' || taskContent === '') {
            content.value = 'Title or Content cannot be empty!';
            return false;
        }
        
        // 获取当前时间
        var createTime = taskCreateTime();

        // 将数据以块属性的方式进行保存
        var task = {
            title      : taskTitle,
            description: taskContent,
        };
        // 创建一个任务div
        createTaskDiv(task, type,createTime);
        // console.log('-- ' + beautify(task));
        var result = await getBlockInfo();
        await updateDivData(result, task, type, false, createTime);

        return true;
    }

    function taskCreateTime() {
        // 获取当前时间
        var now = new Date();
        var year  = now.getFullYear();
        var month = now.getMonth();     // 获取月份，返回值从0开始计算
        var day   = now.getDate();
        var hour  = now.getHours();
        var min   = now.getMinutes();
        var sec = now.getSeconds();
        var createTime = {
            year : year,
            month: month,
            day  : day,
            hour : hour,
            min  : min,
            sec  : sec,
        }

        // 将月份转换为英语表示
        // var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
        // var monthName = monthNames[monthNum];
        
        return createTime;
    }

    // 创建任务div
    function createTaskDiv(task, type, createTime) {
        // 创建一个div
        var taskDiv = document.createElement("div");
        // 添加类名为 "task"，并设置一些属性
        taskDiv.setAttribute("class", "task");
        taskDiv.setAttribute("draggable", "true");

        // 创建新的div
        taskDiv.innerHTML = "<div class='task__tags' id='task__tags'> \
                            <span class='task__tag task__tag--"+ type + "'>" + task.title + "</span> \
                            <button class='task__options'> </button> </div>\
                            <p>"+ task.description + "</p> \
                            <div class='task__stats'>\
                            <span class='year'>"+ createTime.year + "-" + (createTime.month + 1) + "-" + createTime.day + "</span>\
                            <span class='time'>"+ createTime.hour + ":" + createTime.min + ":" + createTime.sec + " create </span> <span class='task__owner'></span></div>";
        
        // 将整个 div 结构添加到页面中的某个容器元素中
        var unfinish = document.getElementById("project-unfinish");
        var doing = document.getElementById("project-doing");
        var done = document.getElementById("project-done");
        var todo = document.getElementById("project-todo");
        var addTaskCard;
        if (type === 'unfinish') {
            addTaskCard = unfinish.querySelector('.addTaskCard');
            addTaskCard.parentNode.insertBefore(taskDiv, addTaskCard);
        }
        else if (type === 'done') {
            // done.appendChild(taskDiv);
            addTaskCard = done.querySelector('.addTaskCard');
            addTaskCard.parentNode.insertBefore(taskDiv, addTaskCard);
        }
        else if (type === 'doing') {
            addTaskCard = doing.querySelector('.addTaskCard');
            addTaskCard.parentNode.insertBefore(taskDiv, addTaskCard);
        }
        else {
            addTaskCard = todo.querySelector('.addTaskCard');
            addTaskCard.parentNode.insertBefore(taskDiv, addTaskCard);
        }
    }

    // 获取块属性
    async function getBlockInfo() {
        // 获取挂件所在块的信息
        let widgetBlockInfo = getWidgetBlockInfo();
        let blockAttrs = await api.getBlockAttrs(widgetBlockInfo.id);
        // console.log("blockAttrs: " + beautify(blockAttrs))
        return blockAttrs;
    }

    // 将数据保存为块属性
    async function setBAttrs(type, msg) {
        var attr = 'custom-' + type;
        var data = {
            [attr]:msg,
        };
        // data.attr
        // 获取挂件所在块的信息
        let widgetBlockInfo = getWidgetBlockInfo();
        let customAttr = await api.setBlockAttrs(widgetBlockInfo.id, data);
    }




});