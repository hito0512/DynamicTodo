/* 思源 API 调用
   修改自 [weihan-Chen/WordCounter](https://github.com/weihan-Chen/WordCounter/blob/master/script/api.js)
   原始引用信息:
   REF [cc-baselib/siYuanApi.js at main · leolee9086/cc-baselib](https://github.com/leolee9086/cc-baselib/blob/main/src/siYuanApi.js)
 */

import { config } from './config.js';

export {
    向思源请求数据 as request,
    以sql向思源请求块数据 as sql,
    获取思源块链接锚文本 as getAnchor,

    新建思源笔记本 as createNotebook,
    删除思源笔记本 as removeNotebook,
    保存思源笔记本配置 as setNotebookConf,
    向思源请求笔记本列表 as lsNotebooks,
    获取思源笔记本配置 as getNotebookConf,
    打开思源笔记本 as openNotebook,
    关闭思源笔记本 as closeNotebook,
    重命名思源笔记本 as renameNotebook,

    通过markdown创建文档 as createDocWithMd,
    删除思源文档 as removeDoc,
    重命名思源文档 as renameDoc,
    移动思源文档 as moveDoc,
    以id获取文档内容 as getDoc,
    以id获取文档聚焦内容 as getFocusedDoc,
    以id获取文档块markdown as exportMdContent,

    以id获取思源块属性 as getBlockAttrs,
    设置思源块属性 as setBlockAttrs,

    根据思源路径获取人类可读路径 as getHPathByPath,
    根据思源ID获取人类可读路径 as getHPathByID,
    列出指定路径下文档 as listDocsByPath,
    以id获取反向链接 as getBacklink,
    以sql获取嵌入块内容 as searchEmbedBlock,
    获取标签列表 as getTag,
    渲染模板 as render,

    以id获取局部图谱 as getLocalGraph,
    获取全局图谱 as getGraph,

    以关键词搜索文档 as searchDocs,
    以关键词搜索块 as searchBlock,
    以关键词搜索模板 as searchTemplate,

    插入块 as insertBlock,
    插入前置子块 as prependBlock,
    插入后置子块 as appendBlock,
    删除块 as deleteBlock,
    更新块 as updateBlock,
    sql以id获取思源块信息 as getBlockByID,

    检查更新 as checkUpdate,
    获取系统版本 as version,
    向网页请求数据 as httpRequest,
    httpGet,
    httpPost,
    获取文件内容 as getFileContent,
    写入文件 as putFile,
    克隆文档 as duplicateDoc,
    刷新文档树 as refreshFiletree,
    以id获取完整人类可读路径 as getFullHPathByID,
    获取块信息 as getBlockInfo,
    getRefIDs,
    getBlockDOM,
    getDocInfo,createBacklink,reindexTree,
};

//重建单个文档索引, putfile之后使用
//path示例: /data/x/y.sy ,其中/data位于工作空间目录下
async function reindexTree(path) {
    let url = '/api/filetree/reindexTree'
    let data = {
        path:path
    }
    return 解析响应体(向思源请求数据(url, data))
    // return 向思源请求数据(url, data)
}

// 创建反链
// 	defID := arg["defID"].(string)
// 	refID := arg["refID"].(string)
// 	refText := arg["refText"].(string)
// 	isDynamic := arg["isDynamic"].(bool)
async function createBacklink(defID,refID,refText,isDynamic) {
    let data = {
        defID:defID,
        refID:refID,
        refText:refText,
        isDynamic:isDynamic
    }
    let url = '/api/ref/createBacklink'
    // return 解析响应体(向思源请求数据(url, data))
    return 向思源请求数据(url, data)
}
//获取文档信息
async function getDocInfo(docId) {
    let data = {
        id:docId
    }
    let url = '/api/block/getDocInfo'
    return 解析响应体(向思源请求数据(url, data))
    // return 向思源请求数据(url, data)
}

async function getBlockDOM(blockid) {
    let data = {
        id:blockid
    }
    let url = '/api/block/getBlockDOM'
    return 解析响应体(向思源请求数据(url, data))
    // return 向思源请求数据(url, data)
}

/**
 *
 *     if (response.status === 200)
 *         return await response.json();
 *     else return null;
 *
 *     response.text().then(function(text) {
 *     return text ? JSON.parse(text) : {}
 *   })
 */
async function 向思源请求数据1(url, data) {
    let resData = null
    await fetch(url, {
        body: JSON.stringify(data),
        method: 'POST',
        headers: {
            Authorization: `Token ${config.token}`,
        }
    }).then(function (response) {
        // console.info(`向思源请求数据(${url}) ${response}`)
        // console.info(`向思源请求数据(${url}) ${JSON.stringify(response)}`)
        // @获取 response的状态码,200表示正常
        // console.info(`向思源请求数据(${url})status: ${response.status}`)
        // resData = response.json()  //
        // resData = response.text()  //
        // console.log("resData:"+resData)
        // return  resData
        // response.text()
        // return response.text().then(function(text) {
         // return text ? JSON.parse(text) : "的点点滴滴"
         // return text ? "发生过" : "的点点滴滴"
        // })
        if (response.ok) {
            resData = response.json()
        }else {
            // return Promise.reject('something went wrong!')
            // return Promise.reject(response.statusText)
            // let error_msg=response.status+" "+response.statusText
            let error_msg=`(${url})${response.status} ${response.statusText}`
            throw "gggggggggggg1"

            // return Promise.reject(error_msg)
            // return null;
        }
        /*
        resData= response.text().then(function(text) {
            // console.log("text:"+text)
            // console.log("text type:"+(typeof text)) //string
         // return text ? JSON.parse(text) : "的点点滴滴"
         return text ? JSON.parse(text) : null
         //    return text ? "发生过" : "的点点滴滴"
        })
        */
    })
    // .catch(function (reason) {
    //     console.error("错误:"+reason)
    //     //如果在catch里再throw,程序会停止
    //     // throw "ffffffffffffff"
    // })
    return resData
    // return "分割"
}

/*
返回json对象
{
  "code": 0,
  "msg": "",
  "data": {}
}
code：非 0 为异常情况
msg：正常情况下是空字符串，异常情况下会返回错误文案
data：可能为 {}、[] 或者 NULL 或者 字符串，根据不同接口而不同
详见:https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md#%E8%A7%84%E8%8C%83
*/
async function 向思源请求数据(url, data) {
    let resData = null
    await fetch(url, {
        body: JSON.stringify(data),
        method: 'POST',
        headers: {
            Authorization: `Token ${config.token}`,
        }
    }).then(function (response) {
        if(response.ok){
             resData = response.json()
            // return resData = response.json()
            // return response.json()
            return
        }
        let error_msg=`API错误:(${url})${response.status} ${response.statusText}`
        console.error(error_msg)
    })
    return resData
}

// 原始
async function 向思源请求数据0(url, data) {
    let resData = null
    await fetch(url, {
        body: JSON.stringify(data),
        method: 'POST',
        headers: {
            Authorization: `Token ${config.token}`,
        }
    }).then(function (response) { resData = response.json() })
    return resData
}

async function 解析响应体(response) {
    let r = await response       //
    // console.log(r)
    //r 可能是个null
    // return r.code === 0 ? r.data : null
    return r && r.code === 0 ? r.data : null
}

//----------qz add

async function 向网页请求数据(url,method, data) {
    let resData = null
    await fetch(url, {
        body: JSON.stringify(data),
        method: method,
        headers: {
            Authorization: `Token ${config.token}`,
        }
    }).then(function (response) { resData = response.json() })
    return resData
}
async function httpPost(url,method, data) {
    let resData = null
    await fetch(url, {
        body: JSON.stringify(data),
        method: "POST",
        headers: {
            Authorization: `Token ${config.token}`,
        }
    }).then(function (response) { resData = response.json() })
    return resData
}
async function httpGet(url) {
    let resData = null
    await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Token ${config.token}`,
        }
    }).then(function (response) { resData = response.json() })
    return resData
}

async function 检查更新(showMsg) {
    let data = {
        showMsg: showMsg,
    }
    let url = '/api/system/checkUpdate'
    return 解析响应体(向思源请求数据(url, data))
}


async function 获取系统版本() {
    let data = {
    }
    let url = '/api/system/version'
    return 解析响应体(向思源请求数据(url, data))
}


//这个api直接返回文件内容,没有封装到data键里
//返回的是object ,不是字符串
//path示例: /data/20210808180117-6v0mkxr/20200923234011-ieuun1p.sy
//如果path不存在,会报post 404错误
async function 获取文件内容(path) {
    let url = '/api/file/getFile'
    let data = {
        path:path,
    }
    // return 解析响应体(向思源请求数据(url, data))
    return 向思源请求数据(url, data)
}

async function 写入文件(path,isDir,modTime,file) {
    let data = {
        path:path,
        isDir:isDir,
        modTime:modTime,
        file:file,
    }
    let url = '/api/file/putFile'
    // return 解析响应体(向思源请求数据(url, data))
    return 向思源请求数据(url, data)
}

async function getRefIDs(id) {
    let data = {
        id:id,
    }
    let url = '/api/block/getRefIDs'
    return 解析响应体(向思源请求数据(url, data))
    // return 向思源请求数据(url, data)
}

async function 克隆文档(id) {
    let data = {
        id:id,
    }
    let url = '/api/filetree/duplicateDoc'
    // return 解析响应体(向思源请求数据(url, data))
    return 向思源请求数据(url, data)
}


//重建索引
async function 刷新文档树() {
    let data = {
    }
    let url = '/api/filetree/refreshFiletree'
    // return 解析响应体(向思源请求数据(url, data))
    return 向思源请求数据(url, data)
}

//返回 笔记本名+人类可读路径,示例:思源笔记用户指南/请从这里开始/编辑器/排版元素
//id 可以是文档id,也可以是块id
async function 以id获取完整人类可读路径(id) {
    let data = {
        id: id,
    }
    let url = '/api/filetree/getFullHPathByID'
    return 解析响应体(向思源请求数据(url, data))
    // return 向思源请求数据(url, data)
}

// 这个强, 不通过sql方式,
//能获取 box/path/标题(rootTitle)等信息
async function 获取块信息(块id) {
    let data = {
        id: 块id,
    }
    let url = '/api/block/getBlockInfo'
    return 解析响应体(向思源请求数据(url, data))
    // return 向思源请求数据(url, data)
}

//-----------qz add end

async function 以sql向思源请求块数据(sql) {
    let sqldata = {
        stmt: sql,
    }
    let url = '/api/query/sql'
    return 解析响应体(向思源请求数据(url, sqldata))
}

async function 向思源请求笔记本列表() {
    let sqldata = { stmt: sql语句 }
    let url = '/api/notebook/lsNotebooks'
    return 解析响应体(向思源请求数据(url, sqldata))
}

async function 获取思源块链接锚文本(链接源文本) {
    链接源文本 = 链接源文本.replace("((", "").replace("))", "")
    let sql = `select * from blocks where id = '${链接源文本}'`
    let 临时块属性 = await 以sql向思源请求块数据(sql)
    //  console.log ("临时块属性",临时块属性)
    let anchor = ""
    if (临时块属性) {
        try {
            if (临时块属性[0][
                name]) {
                anchor = 临时块属性[0][
                    name]
            }
            else if (临时块属性[0]["content"]) { anchor = 临时块属性[0]["content"] }
            else { anchor = 链接源文本 }
        }
        catch (e) { anchor = "解析错误" }
    }
    //   console.log("锚文本",anchor)
    return anchor
}

async function 打开思源笔记本(笔记本id) {
    let data = {
        notebook: 笔记本id,
    }
    let url = '/api/notebook/openNotebook'
    return 解析响应体(向思源请求数据(url, data))
    //返回空数据
}

async function 关闭思源笔记本(笔记本id) {
    let data = {
        notebook: 笔记本id,
    }
    let url = '/api/notebook/closeNotebook'
    return 解析响应体(向思源请求数据(url, data))
    //返回空数据
}

async function 重命名思源笔记本(笔记本id, 笔记本的新名称) {
    let data = {
        notebook: 笔记本id,
        name: 笔记本的新名称,
    }
    let url = '/api/notebook/renameNotebook'
    return 解析响应体(向思源请求数据(url, data))
    //返回空数据
}

async function 新建思源笔记本(笔记本名称) {
    let data = {
        name: 笔记本名称,
    }
    let url = '/api/notebook/createNotebook'
    return 解析响应体(向思源请求数据(url, data))
    //返回空数据
}

async function 删除思源笔记本(笔记本id) {
    let data = { notebook: 笔记本id }
    let url = '/api/notebook/removeNotebook'
    return 解析响应体(向思源请求数据(url, data))
    //返回空数据
}

async function 获取思源笔记本配置(笔记本id) {
    let data = { notebook: 笔记本id }
    let url = '/api/notebook/getNotebookConf'
    return 解析响应体(向思源请求数据(url, data))
    //返回笔记本配置
}

async function 保存思源笔记本配置(笔记本id) {
    let data = { notebook: 笔记本id }
    let url = '/api/notebook/setNotebookConf'
    return 解析响应体(向思源请求数据(url, data))
    //返回笔记本配置
}

async function 重命名思源文档(笔记本id, 文档路径, 文档新标题) {
    let data = {
        notebook: 笔记本id,
        path: 文档路径,
        title: 文档新标题,
    }
    let url = '/api/filetree/renameDoc'
    return 解析响应体(向思源请求数据(url, data))
    //返回空数据
}

async function 删除思源文档(笔记本id, 文档路径) {
    let data = {
        notebook: 笔记本id,
        path: 文档路径,
    }
    let url = '/api/filetree/removeDoc'
    return 解析响应体(向思源请求数据(url, data))
    //返回空数据
}

async function 移动思源文档(源笔记本ID, 源路径, 目标笔记本ID, 目标路径) {
    let data = {
        fromNotebook: 源笔记本ID,
        fromPath: 源路径,
        toNotebook: 目标笔记本ID,
        toPath: 目标路径,
    }
    let url = '/api/filetree/moveDoc'
    return 解析响应体(向思源请求数据(url, data))
    //返回空数据
}

async function 根据思源路径获取人类可读路径(笔记本ID, 路径) {
    let data = {
        Notebook: 笔记本ID,
        Path: 路径,
    }
    let url = '/api/filetree/getHPathByPath'
    return 解析响应体(向思源请求数据(url, data))
    //返回路径
}

async function 根据思源ID获取人类可读路径(块ID) {
    let data = {
        id: 块ID,
    }
    let url = '/api/filetree/getHPathByID'
    return 解析响应体(向思源请求数据(url, data))
    //返回路径
}

//暂缺上传文件

async function 以id获取思源块属性(内容块id) {
    let data = {
        id: 内容块id,
    }
    let url = '/api/attr/getBlockAttrs'
    return 解析响应体(向思源请求数据(url, data))
}
// 通过sql查询的, 有些api操作之后并不能马上查询到,比如 createDocWithMd api; 建议使用api(/api/block/getBlockInfo)
async function sql以id获取思源块信息(内容块id) {
    let sql = `select * from blocks where id ='${内容块id}'`
    let data = await 以sql向思源请求块数据(sql)
    return data[0]
}

async function 设置思源块属性(内容块id, 属性对象) {
    let url = '/api/attr/setBlockAttrs'
    return 解析响应体(向思源请求数据(url, {
        id: 内容块id,
        attrs: 属性对象,
    }))
}

async function 以id获取文档块markdown(文档id) {
    let data = {
        id: 文档id,
    }
    let url = '/api/export/exportMdContent'
    return 解析响应体(向思源请求数据(url, data))
    //文档hepath与Markdown 内容
}

async function 列出指定路径下文档0(路径) {
    let data = {
        path: 路径,
    }
    let url = '/api/filetree/listDocsByPath'
    return 解析响应体(向思源请求数据(url, data))
    //文档hepath与Markdown 内容
}
async function 列出指定路径下文档(notebook,path) {
    let data = {
        notebook:notebook,
        path: path,
    }
    let url = '/api/filetree/listDocsByPath'
    return 解析响应体(向思源请求数据(url, data))
    //文档hepath与Markdown 内容
}

function html转义(原始字符串) {
    var 临时元素 = document.createElement("div");
    临时元素.innerHTML = 原始字符串;
    var output = 临时元素.innerText || 临时元素.textContent;
    临时元素 = null;
    // console.log(output)
    return output;
}

async function 以id获取反向链接(id) {
    let data = {
        id: id,
        beforeLen: 10,
        k: "",
        mk: ""
    }
    let url = '/api/ref/getBacklink'
    return 解析响应体(向思源请求数据(url, data))
}

async function 以sql获取嵌入块内容(外部id数组, sql) {
    let data = {
        stmt: sql,
        excludeIDs: 外部id数组,
    }
    let url = '/api/search/searchEmbedBlock'
    return 解析响应体(向思源请求数据(url, data))

}
async function 以id获取文档内容(id) {
    let data = {
        id: id,
        k: "",
        mode: 2,
        size: 36,
    }
    let url = '/api/filetree/getDoc'
    return 解析响应体(向思源请求数据(url, data))
}
async function 以id获取文档聚焦内容(id) {
    let data = {
        id: id,
        k: "",
        mode: 0,
        size: 36,
    }
    let url = '/api/filetree/getDoc'
    return 解析响应体(向思源请求数据(url, data))
}
async function 获取标签列表() {
    let data = {}
    let url = '/api/tag/getTag'
    return 解析响应体(向思源请求数据(url, data))
}
async function 以id获取局部图谱(k, id, conf, reqId) {
    let data = {
        id: id,
        k: k,
        conf: conf,
        reqId: reqId,
    }
    let url = '/api/graph/getLocalGraph'
    return 解析响应体(向思源请求数据(url, data))
}
async function 获取全局图谱(k, conf, reqId) {
    let data = {
        k: k,
        conf: conf,
        reqId: reqId,
    }
    let url = '/api/graph/getGraph'
    return 解析响应体(向思源请求数据(url, data))
}

async function 以关键词搜索文档(k) {
    let data = {
        k: k,
    }
    let url = '/api/filetree/searchDocs'
    return 解析响应体(向思源请求数据(url, data))
}
async function 以关键词搜索块(query) {
    let data = {
        "query": query,
    }
    let url = '/api/search/searchBlock'
    return 解析响应体(向思源请求数据(url, data))
}
async function 以关键词搜索模板(k) {
    let data = {
        k: k,
    }
    let url = '/api/search/searchTemplate'
    return 解析响应体(向思源请求数据(url, data))
}


async function createDoc(notebook, path,title ,md) {
    let data = {
        notebook: notebook,
        path: path,
        title: title,
        md:md
    }
    let url = '/api/filetree/createDoc'
    return 解析响应体(向思源请求数据(url, data))
}
//https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md#%E9%80%9A%E8%BF%87-markdown-%E5%88%9B%E5%BB%BA%E6%96%87%E6%A1%A3
//注:如果创建的新文档已经存在,则添加形如"-ng4bkui"的后缀
//这里path 是hpath
async function 通过markdown创建文档(notebook, path, markdown) {
    let data = {
        notebook: notebook,
        path: path,
        markdown: markdown,
    }
    let url = '/api/filetree/createDocWithMd'
    return 解析响应体(向思源请求数据(url, data))
}
//https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md#%E6%B8%B2%E6%9F%93%E6%A8%A1%E6%9D%BF
async function 渲染模板(docid,markdown_path) {
    let url = '/api/template/render'
    return 解析响应体(向思源请求数据(url, {
        "id":docid,
        "path":markdown_path,
    }))
}

async function 渲染模板0(data) {
    let url = '/api/template/render'
    return 解析响应体(向思源请求数据(url, data))
}

async function 插入块(previousID, data,dataType="markdown") {
    let url = '/api/block/insertBlock'
    return 解析响应体(向思源请求数据(
        url = url,
        data = {
            previousID: previousID,
            data: data,
            dataType: dataType,
        },
    ))
}

async function 插入前置子块(parentID, dataType, data) {
    let url = '/api/block/prependBlock'
    return 解析响应体(向思源请求数据(
        url = url,
        data = {
            parentID: parentID,
            dataType: dataType,
            data: data,
        },
    ))
}
//https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md#%E6%8F%92%E5%85%A5%E5%90%8E%E7%BD%AE%E5%AD%90%E5%9D%97
// 可以用来往文档里增加新块,此时parentID是文档id
async function 插入后置子块(parentID, dataType, data) {
    let url = '/api/block/appendBlock'
    return 解析响应体(向思源请求数据(
        url = url,
        data = {
            parentID: parentID,
            dataType: dataType,
            data: data,
        },
    ))
}

//更新块
//dataType：待更新数据类型，值可选择 markdown 或者 dom
async function 更新块(blockId, dataType, newData) {
    let data = {
        id: blockId,
        dataType: dataType,
        data: newData,
    }
    let url = '/api/block/updateBlock'
    // return 解析响应体(向思源请求数据(url, data))
    return 向思源请求数据(url, data)
}


async function 删除块(blockId) {
    let url = '/api/block/deleteBlock'
    let data = {
        id: blockId,
    }
    return 解析响应体(向思源请求数据(url,data))
}
