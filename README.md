# bztree安装和使用

## Installation 
 `npm install bztree`

## 配置和API

>**必须配置项：**

1. **filetree: 文件树节点(fileNode)对象数组**
    
    fileNode对象：

    属性|类型|备注
    -|-|-|
    tId|string|文件唯一标识:"文件树id_number"(组件内部生成 eg:filetree_1)
    pTId|string|文件父节点tId(组件内部生成)
    filePath|string|绝对路径(组件内部生成)
    filename|string|文件名(用户指定)
    isFolder|bool|是否为文件夹(用户指定)
    extend|bool|是否展开文件夹(用户指定)
    subdirectory|fileNode数组|子文件目录(用户指定)
    
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

    - 右键菜单 *Create File* 点击事件
    
        addFile: (parentFolder, newFile)=>{}
    
            参数说明：
            - parentFolder: (object)新建文件所在文件夹的节点数据.若新建文件不存在上级目录，parentFolder=null
            - newFile: (object)新建文件的节点数据,默认文件名为"new file"
            

    - 右键菜单 *Create Folder* 点击事件
    
        addFolder: (parentFolder,newfolder)=>{}
        
            参数说明：
            - parentFolder: (object)新建文件夹所在文件夹的节点数据.若新建文件夹不存在上级目录，parentFolder=null
            - newfolder: (object)新建文件夹的节点数据,默认文件名为"new folder"

    - 右键菜单 *Rename* 点击事件
    
        rename: (beforeFile，afterFile)=>{}
    
            参数说明：
            - beforeFile: (object)重命名前的文件节点数据
            - afterFile: (object)重命名后的文件节点数据

    - 右键菜单 *Delete* 点击事件
    
        remove: (fileNode)=>{}
    
            参数说明：
            - fileNode: (object)删除的节点数据
         
    - 点击文件树节点事件 
    
        clickFile: (fileNode)=>{}
        
            参数说明：
            - fileNode: (object)点击的文件的路径


>**id**

    指定文件树id，生成文件tId前缀，用于标识文件所属文件树。(default:filetree)

<!-- >**获取组件实例，调用zTree插件API**

 [jquery zTree]: http://www.treejs.cn/v3/api.php "jquery zTree API"
使用ref获取ztree实例，进而可以使用 [jquery zTree] 中的API(更多treeNode属性也可在里面查看)

    获取zTreeObj: this.ztree.current.ztreeObj -->


## example
```js
import * as React from 'react';
import Ztree from 'bztree'

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
    addFile: (parentFolder,newFile) => {
      console.log("APP configure newFile", newFile)
      console.log("APP configure parentNode是：", parentFolder)
    },
    addFolder: (parentFolder, newFolder) => {
      console.log("APP configure newFolder", newFolder)
      console.log("APP configure parentNode是：", parentFolder)
    },
    rename: (beforeFile,afterFile) => {
      console.log("APP configure after rename:", afterFile)
      console.log("APP configure before rename:", beforeFile);
    },
    remove: (fileNode) => {
      console.log("APP remove fileNode", fileNode);
    },
    clickFile: (fileNode) => {
      console.log("APP clickFile fileNode", fileNode);
    }
  };

    return (
        <div className="App">
            <Ztree
                id="treeDemo"
                configure={configure}
                filetree={filetree}
            />
        </div>
    );
}

export default App;


```
