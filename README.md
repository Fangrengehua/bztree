# bztree安装和使用

## Installation 
 `npm install bztree`

## 配置和API

>**必须配置项：**

1. **filetree: 文件树节点(fileNode)对象数组**
    
    fileNode对象：

    属性|类型|备注
    -|-|-|
    id|number|由组件内部自动生成
    filename|string|文件名
    isFolder|bool|是否文件夹
    extend|bool|是否展开文件夹
    filePath|string|绝对路径
    subdirectory|fileNode数组|子文件目录
    
    示例:

        
        const filetree = [
        {
            filename: "pNode0 1",
            isFolder: true,
            filePath: "",
            extend: true,
            subdirectory: [
                {
                    filename: "pNode1 1",
                    isFolder: true,
                    filePath: "",
                    extend: false,
                    subdirectory: [
                    {
                        filename: "sNode11 1.js",
                        isFolder: false,
                        filePath: "",
                    }]
                }
            ]}]

             
        
2. **configure: 相关事件配置**

    - 右键菜单 *Create File* 点击事件
    
        addFile: (parentFolder, newFile)=>{}
    
            参数说明：
            - parentFolder: (fileNode)新建文件所在文件夹的节点数据.若新建文件不存在上级目录，parentFolder=null
            - newFile: (fileNode)新建文件的节点数据
            

    - 右键菜单 *Create Folder* 点击事件
    
        addFolder: (parentFolder,newfolder)=>{}
        
            参数说明：
            - parentFolder: (fileNode)新建文件夹所在文件夹的节点数据.若新建文件夹不存在上级目录，parentFolder=null
            - newfolder: (fileNode)新建文件夹的节点数据

    - 右键菜单 *Rename* 点击事件
    
        rename: (beforeFile，afterFile)=>{}
    
            参数说明：
            - beforeFile: (fileNode)重命名前的文件节点数据
            - afterFile: (fileNode)重命名后的文件节点数据

    - 右键菜单 *Delete* 点击事件
    
        remove: (fileNode)=>{}
    
            参数说明：
            - fileNode: (fileNode)删除的节点数据
         
    - 点击文件树节点事件 
    
        clickFile: (fileNode)=>{}
        
            参数说明：
            - fileNode: (fileNode)点击的文件的路径


>**获取组件实例，调用zTree插件API**

 [jquery zTree]: http://www.treejs.cn/v3/api.php "jquery zTree API"
使用ref获取ztree实例，进而可以使用 [jquery zTree] 中的API(更多treeNode属性也可在里面查看)

    获取zTreeObj: this.ztree.current.ztreeObj


## example
```js
import * as React from 'react';
import Ztree from 'bztree'

function App() {

    const filetree = [
        {
            filename: "pNode0 1",
            isFolder: true,
            filePath: "",
            extend: true,
            subdirectory: [
                {
                    filename: "pNode1 1",
                    isFolder: true,
                    filePath: "",
                    extend: false,
                    subdirectory: [
                        {
                            filename: "sNode11 1.js",
                            isFolder: false,
                            filePath: "",
                        },
                        {
                            filename: "sNode11 2.html",
                            isFolder: false,
                            filePath: "",
                        },
                        {
                            filename: "sNode11 3.css",
                            isFolder: false,
                            filePath: "",
                        }
                    ]
                }
            ]
        },
        {
            filename: "pNode0 2",
            isFolder: true,
            filePath: "",
            extend: false,
            subdirectory: []
        },
        {
            filename: "sNode0 3.js",
            isFolder: false,
            filePath: "",
        }
    ]

    const configure = {
    addFile: (parentFolder,newFile) => {
      console.log("APP configure file _source", newFile)
      console.log("APP configure parentNode是：", parentFolder)
    },
    addFolder: (parentFolder, newFolder) => {
      console.log("APP configure folder _source", newFolder)
      console.log("APP configure parentNode是：", parentFolder)
    },
    rename: (beforeFile,afterFile) => {
      console.log("APP configure rename _source:", afterFile)
      console.log("APP configure rename oldsource", beforeFile);
    },
    remove: (fileNode) => {
      console.log("APP remove _source", fileNode);
    },
    clickFile: (fileNode) => {
      console.log("APP clickFile _source", fileNode);
    }
  };

    return (
        <div className="App">
            <Ztree
                configure={configure}
                filetree={filetree}
            />
        </div>
    );
}

export default App;


```
