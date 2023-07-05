export {
    curtime, assert, beautify, getWidgetBlockInfo
}

// 当前本时区时间,格式2022-8-17 20:38:15
function curtime() {
    return new Date().toLocaleString().replaceAll("/", "-")
}

//断言函数
function assert(condition, message) {
    // console.assert(condition,message)
    if (!condition) {
        throw new Error(message || "断言失败!");
    }
}

//序列化(JavaScript对象转字符串), 使用制表符缩进
function beautify(obj) {
    return JSON.stringify(obj, null, "\t")
}

// 获取挂件所在块信息
function getWidgetBlockInfo() {
    let widgetBlockEle = window.frameElement.parentElement.parentElement;
    let widgetBlkID = widgetBlockEle.getAttribute('data-node-id');
    return {
        id: widgetBlkID  //挂件块id
    }
}

/**
 * 延迟特定毫秒,到时打印特定消息;返回promise
 * 使用时await delayMs(1000) 等待1秒(1000毫秒)
 * @param {number} ms: 延迟多少毫秒
 * @param {string} msg: 可选参数,时间到时输出的消息
 */
export function delayMs(ms, msg = "时间到") {
    return new Promise(function (resolve, reject) {
        console.log(`等待${ms}毫秒...`)
        setTimeout(function () {
            console.log(msg);
            resolve();
        }, ms);
    });
}
