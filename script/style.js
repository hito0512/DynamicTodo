import * as api from './api.js';
import {getWidgetBlockInfo
} from "./util.js";


document.addEventListener('DOMContentLoaded', (event) => {
    var global_init = false;

    var openPanel = null;
    var currentUpdateDiv = null; 
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
        addButton(event);

        showAddPanel(event);

        buttonFunc(event);
        
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

    /*- ------------------ 其他函数 ------------------------- */
    // 初始化
    async function initSys() {
        if (!global_init) {
            global_init = true;
            var result = await getBlockInfo();
            for (var key in result) {
                if (key.startsWith("custom")) {
                    var type = key.split("-")[1]
                    var preStr = result[key];
                    var preDictAll = JSON.parse(preStr);
                    for (var i = 0; i < preDictAll.length; i++) {
                        var obj = preDictAll[i];
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
                        createTaskDiv(task, type, createTime);
                    }
                }
            }
        }
    }

    // 数据预览
    function dataPreview(event) {
        var divNode = event.target;
        if (divNode.classList[0] === 'task__tag') {
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
            var divContent = parentDiv.getElementsByTagName("p");      // 任务内容
            divContent = divContent[0].textContent;
            previewDivTitle.textContent = divNode.textContent;;
            previewDivState.textContent = chineseType;

            divContent = marked.parse(divContent);

            previewDivContent.innerHTML = divContent;
            const linkElements = previewDivContent.querySelectorAll('a');
            
            linkElements.forEach((linkElement) => {
                const href = linkElement.getAttribute('href');
                const httpTitle = linkElement.textContent;
                if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
                    const buttonElement = document.createElement('button');
                    buttonElement.className = 'linkButton'
                    buttonElement.textContent = httpTitle;
                    
                    buttonElement.addEventListener('click', function() {
                    const parentWindow = window.parent;
                    parentWindow.open(href, '_blank', 'noopener');
                    });
                    linkElement.parentNode.replaceChild(buttonElement, linkElement);
                }
              });


            previewDivTime.textContent = year.innerText + " - " + time.innerText.split(" ")[0];
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
        var taskTitle = title.value;     
        var taskContent = content.value;  
        var type = taskType.value;   
        
        var task = {
            title      : taskTitle,
            description: taskContent,
        };
        var result = await getBlockInfo();
        await updateDivData(result, task, type, true, null);
        if (currentUpdateDiv != null) {
            var parentDiv = currentUpdateDiv.parentNode.parentNode; 
            var newTitle = parentDiv.querySelector(".task__tag");     
            var newContent = parentDiv.getElementsByTagName("p");      
            var oldTaskTypeAll = newTitle.classList[1];                   
            var oldTaskType = oldTaskTypeAll.split("--")[1];
            newTitle.textContent = taskTitle;
            newContent[0].textContent = taskContent;
            if (oldTaskType != type) {
                var newTag = oldTaskTypeAll.split("--")[0] + "--"+type;
                newTitle.classList.replace(newTitle.classList[1], newTag);
                var newType = 'project-' + type
                var newTaskType = document.getElementById(newType);
                var addTaskCard = newTaskType.querySelector('.addTaskCard');
                addTaskCard.parentNode.insertBefore(parentDiv, addTaskCard);
            }
        }
    }

    function showAddPanel(event) {
        if (!taskSetting.contains(event.target) && event.target.className != 'project-column-heading__options') {
            taskSetting.classList.remove('visible');
            aside.classList.remove('visible');
        }
    }

    function closeTaskPreviewDiv(event) {
        if ( !taskPreview.contains(event.target) ) {
            taskPreview.style.display = 'none';
        }
    }

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
                
                var editButton = document.createElement('button');
                editButton.className = 'edbutton'
                editButton.innerHTML = '<i class="editIcon"></i>编辑';
                panel.appendChild(editButton);
        
                
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
                
                if (panel.style.display === 'block' ) {
                    panel.style.display = 'none';
                }
                else if(panel.style.display === 'none'){
                    panel.style.display = 'block';
                }
                else if(panel.style.display === ''){
                    panel.style.display = 'none';
                }
            }
        }
    }

    async function buttonFunc(event) {
        if (event.target.tagName === "BUTTON" && (event.target.className === 'delbutton')) {
            var parentDiv = event.target.parentNode.parentNode;
            var root = parentDiv.parentNode;
            root.removeChild(parentDiv);

            currentUpdateDiv = event.target;
            var result = await getBlockInfo();
            await removeData(result);
            currentUpdateDiv = null;
        }
        if (event.target.tagName === "BUTTON" && (event.target.className === 'edbutton')) {
            currentUpdateDiv = event.target;
            var parentDiv = event.target.parentNode.parentNode;    
            var newTitle = parentDiv.querySelector(".task__tag");      
            var newContent = parentDiv.getElementsByTagName("p");      
            var oldTaskTypeAll = newTitle.classList[1];                   
            var oldTaskType = oldTaskTypeAll.split("--")[1];

            title.value    = newTitle.textContent;       
            content.value  = newContent[0].textContent; 
            taskType.value = oldTaskType;                

            toggleDiv(false);
        }
    }


    async function updateDivData(result, task, type, remove, createTime) {
        if (remove) {
            createTime = await removeData(result);
            var result = await getBlockInfo();
        }


        var data = Object.assign({}, task, createTime);

        data = JSON.stringify(data);
        var attr = 'custom-' + type;

        if (result[attr] === undefined) {

            data = '[' + data + ']';
            setBAttrs([type], data).then(r => { });
        }
        else {
          
            var preStr = result[attr];
           
            var preDictAll = JSON.parse(preStr);
            var curStr = JSON.stringify(preDictAll);
           
            var stem = curStr.substring(1, curStr.length - 1);
            if (stem === '') {
                curStr = '[' + data + ']';
            }
            else {
                curStr = '[' + stem + ',' + data + ']';
            }     
          
            setBAttrs([type], curStr).then(r => { });
        }
    }

   
    async function removeData(result) {
        if (currentUpdateDiv != null) {
            var parentDiv = currentUpdateDiv.parentNode.parentNode;    
            var Title = parentDiv.querySelector(".task__tag");         
            var newContent = parentDiv.getElementsByTagName("p");      
            var oldTaskTypeAll = Title.classList[1];                   
            var oldTaskType = oldTaskTypeAll.split("--")[1];
            var oldattr = 'custom-' + oldTaskType;
            var oldStr = result[oldattr];
            var oldDictAll = JSON.parse(oldStr);
            var oldtitle = Title.textContent;
          
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
           
            var stem = curStr.substring(1, curStr.length - 1);
            curStr = '[' + stem + ']';
           
            await setBAttrs([oldTaskType], curStr);

            return createTime;
        }
    }


    function closePanel(event, Panel) {
        if (Panel != null && !Panel.contains(event.target)) {
            var panel = Panel.querySelector('.editPanel');
            panel.style.display = 'none';
            Panel = null;
        }
    }


    aside.addEventListener("mousedown", function (event) {
        if (event.target.className !== 'taskname' && event.target.className !== 'taskcontent') {
            if (aside.contains(event.target)) {
                isDragging = true;
                mouseOffsetX = event.clientX - aside.offsetLeft;
                mouseOffsetY = event.clientY - aside.offsetTop;
            }
        }
        
    });


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

    document.addEventListener("mouseup", function () {
        isDragging = false;
    });



    /*- ------------------ 异步函数 ------------------------- */
    // 创建任务
    async function addNewTask() {
        var taskTitle = title.value;     
        var taskContent = content.value;  
        var type = taskType.value;   

        if (taskTitle === '' || taskContent === '') {
            content.value = 'Title or Content cannot be empty!';
            return false;
        }
        
        var createTime = taskCreateTime();


        var task = {
            title      : taskTitle,
            description: taskContent,
        };

        createTaskDiv(task, type,createTime);

        var result = await getBlockInfo();
        await updateDivData(result, task, type, false, createTime);

        return true;
    }

    function taskCreateTime() {
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
        return createTime;
    }


    function createTaskDiv(task, type, createTime) {

        var taskDiv = document.createElement("div");

        taskDiv.setAttribute("class", "task");
        taskDiv.setAttribute("draggable", "true");

        taskDiv.innerHTML = "<div class='task__tags' id='task__tags'> \
                            <span class='task__tag task__tag--"+ type + "'>" + task.title + "</span> \
                            <button class='task__options'> </button> </div>\
                            <p>"+ task.description + "</p> \
                            <div class='task__stats'>\
                            <span class='year'>"+ createTime.year + "-" + (createTime.month + 1) + "-" + createTime.day + "</span>\
                            <span class='time'>"+ createTime.hour + ":" + createTime.min + ":" + createTime.sec + " create </span> <span class='task__owner'></span></div>";
        

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


    async function getBlockInfo() {

        let widgetBlockInfo = getWidgetBlockInfo();
        let blockAttrs = await api.getBlockAttrs(widgetBlockInfo.id);
        return blockAttrs;
    }

    async function setBAttrs(type, msg) {
        var attr = 'custom-' + type;
        var data = {
            [attr]:msg,
        };
        let widgetBlockInfo = getWidgetBlockInfo();
        let customAttr = await api.setBlockAttrs(widgetBlockInfo.id, data);
    }




});