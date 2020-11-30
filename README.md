# file-ztree安装和使用

## Installation 
 `npm install file-ztree`

## 配置和API

>**必须配置项：**

1. **filetree: 文件树节点(fileNode)对象数组**
    
    fileNode对象：

    属性|类型|备注
    -|-|-|
    filename|string|文件名(用户指定)
    isFolder|bool|是否为文件夹(用户指定,default:false)
    extend|bool|是否展开文件夹(用户指定,default:false)
    subdirectory|fileNode数组|子文件目录(用户指定,default:[])
    tId|string|fileNode唯一标识(组件内部生成，请勿提前赋值)
    

    示例:

        const filetree = [
        {
            filename: "pNode0 1",
            isFolder: true,
            extend: true,
            subdirectory: [
                {
                    filename: "pNode1 1",
                    isFolder: true,
                    extend: false,
                    subdirectory: [
                    {
                        filename: "sNode11 1.js",
                        isFolder: false,
                    }]
                }
            ]}]

             
        
2. **configure: 相关事件配置**

    - error: (bool，default:false)是否执行用户自定义的错误处理回调，为true时请务必定义errorCallBack回调函数。

    - errorCallBack:()=>{}
    用户自定义错误处理回调函数

    - 右键菜单 *Create File* 点击事件
    
        addFile: (parentFolder, newFile)=>{}
    
            参数说明：
            - parentFolder: (fileNode)新建文件所在文件夹的节点数据.若新建文件不存在上级目录，parentFolder=null
            - newFile: (fileNode)新建文件的节点数据,默认文件名为"new file"
            
            返回值：promise
            

    - 右键菜单 *Create Folder* 点击事件
    
        addFolder: (parentFolder,newfolder)=>{}
        
            参数说明：
            - parentFolder: (fileNode)新建文件夹所在文件夹的节点数据.若新建文件夹不存在上级目录，parentFolder=null
            - newfolder: (fileNode)新建文件夹的节点数据,默认文件名为"new folder"
            
            返回值：promise

    - 右键菜单 *Rename* 点击事件
    
        rename: (beforeFile，afterFile)=>{}
    
            参数说明：
            - beforeFile: (fileNode)重命名前的文件节点数据
            - afterFile: (fileNode)重命名后的文件节点数据
            
            返回值：promise

    - 右键菜单 *Delete* 点击事件
    
        remove: (fileNode)=>{}
    
            参数说明：
            - fileNode: (fileNode)删除的节点数据
            
            返回值：promise
         
    - 点击文件树节点事件 
    
        clickFile: (fileNode)=>{}
        
            参数说明：
            - fileNode: (fileNode)点击的文件节点数据
            
            返回值：promise


>**可选项：id**

    指定文件树id，生成文件tId前缀，用于标识文件所属文件树。(default:filetree)

>**获取组件实例**

在本组件上指定属性onRef

    <Ztree onRef={(ref) => { this.ztree = ref}}/>

之后可以通过 this.tab_control 调用本组件内的方法：

    - this.ztree.selectFile(tId)
        
        用途：选中指定文件，原先被选中的文件节点会被取消选中状态

        参数说明：
            tId: (string)组件初始化时为fileNode添加的属性tId

        无返回值

    - this.ztree.cancelSelectedFile()

        用途：取消选中当前选中文件
            
        无返回值

    - this.ztree.getSelectedFiles()

        用途：获取当前选中节点的数据

        返回值：(fileNode)当前被选中的节点数据集合

## example
```js
import * as React from 'react';
import Ztree from 'file-ztree'

function App() {
    const filetree = [
        {
            filename: "pNode0 1",
            isFolder: true,
            extend: true,
            subdirectory: [
                {
                    filename: "pNode1 1",
                    isFolder: true,
                    extend: false,
                    subdirectory: [
                        {
                            filename: "sNode11 1.js",
                            isFolder: false,
                        },
                        {
                            filename: "sNode11 2.html",
                            isFolder: false,
                        },
                        {
                            filename: "sNode11 3.css",
                            isFolder: false,
                        }
                    ]
                }
            ]
        },
        {
            filename: "pNode0 2",
            isFolder: true,
            extend: false,
            subdirectory: []
        },
        {
            filename: "sNode0 3.js",
            isFolder: false,
        }
    ]


    const configure = {
        error: false,
        errorCallBack: () => {
            console.log("error");
        },
        addFile: (parentFolder, newFile) => {
            console.log("APP configure file _source", newFile)
            console.log("APP configure parentNode是：", parentFolder)

            return new Promise((resolve, reject) => {
                let num = Math.round(Math.random() * 10);
                if (num % 2 === 0) {
                    console.log(num);
                    resolve();
                } else {
                    console.log(num);
                    reject();
                }
            })
        },
        addFolder: (parentFolder, newFolder) => {
            console.log("APP configure folder _source", newFolder)
            console.log("APP configure parentNode是：", parentFolder)

            return new Promise((resolve, reject) => {
                let num = Math.round(Math.random() * 10);
                if (num % 2 === 0) {
                    console.log(num);
                    resolve();
                } else {
                    console.log(num);
                    reject();
                }
            })
        },
        rename: (beforeFile, afterFile) => {
            console.log("APP configure rename _source:", afterFile)
            console.log("APP configure rename oldsource", beforeFile);

            return new Promise((resolve, reject) => {
                let num = Math.round(Math.random() * 10);
                if (num % 2 === 0) {
                    console.log(num);
                    resolve();
                } else {
                    console.log(num);
                    reject();
                }
            })
        },
        remove: (fileNode) => {
            console.log("APP remove _source", fileNode);

            return new Promise((resolve, reject) => {
                let num = Math.round(Math.random() * 10);
                if (num % 2 === 0) {
                    console.log(num);
                    resolve();
                } else {
                    console.log(num);
                    reject();
                }
            })
        },
        clickFile: (fileNode) => {
            console.log("APP clickFile _source", fileNode);

            return new Promise((resolve, reject) => {
                let num = Math.round(Math.random() * 10);
                if (num % 2 === 0) {
                    console.log(num);
                    resolve();
                } else {
                    console.log(num);
                    reject();
                }
            })
        }
    };

    return (
        <div className="App">
            <Ztree
                id="treeDemo"
                configure={configure}
                filetree={filetree}
                onRef={(ref) => { this.ztree = ref}}
            />
        </div>
    );
}

export default App;

```
