# bztree安装和使用

## Installation 
 `npm install bztree`

## 配置和API

>**必须配置项：**

1. **zNodes: 树节点(treeNode)对象数组**
    
    treeNode对象：

    属性|类型|备注
    -|-|-|
    id|number|节点id
    pId|number|所在文件夹的节点id
    name|string|节点名称(default:null)
    open|bool|是否展开文件夹(default:false)
    isParent|bool|是否文件夹
    path|string|路径（由组件内部自动生成）
    
    示例:

        
            const zNodes = [{ "id": 1, "pId": 0, "name": "pNode1", "open": true },
            { "id": 11, "pId": 1, "name": "pNode 11", },
            { "id": 111, "pId": 11, "name": "sNode 111.js", },
            { "id": 112, "pId": 11, "name": "sNode 112.json" },
            { "id": 2, "pId": 0, "name": "pNode 2", "isParent":"true"},
            { "id": 3, "pId": 0, "name": "index.js", },
            { "id": 4, "pId": 0, "name": "package.json", }
            ];
             
        
2. **configure: 相关事件配置**

    - 右键菜单 *Create File* 点击事件
    
        addFile: (oldpath,parentNode,newfile,newfilename)=>{}
    
            参数说明：
            - oldpath: 新建文件时以文件名 new file 生成的文件路径
            - parentNode: 新文件所在文件夹的节点数据,若在根节点下新建则parentNode为undefined(pId=0)
            - newfile: 新建节点的数据
            - newfilename: 新建节点名称(default:new file)
            

    - 右键菜单 *Create Folder* 点击事件
    
        addFolder: (parentNode,newfolder,newfoldername)=>{}
        
            参数说明：
            - parentNode: 新建文件夹所在文件夹的节点数据,若在根节点下新建则parentNode为undefined(pI=0)
            - newfolder: 新建文件夹的节点数据
            - newfoldername: 新建文件夹名称(default:new folder)
            
    - 右键菜单 *Rename* 点击事件
    
        rename: (oldpath,node,oldname,newname)=>{}
    
            参数说明：
            - oldpath: 重命名前的文件路径
            - node: 重命名后的节点数据
            - oldname: 重命名前节点名称
            - newname: 重命名后节点名称
         
    - 右键菜单 *Delete* 点击事件
    
        remove: (node)=>{}
    
            参数说明：
            - node: 删除的节点
         
    - 点击文件树节点事件 
    
        clickFile: (openedPath,treeNode)=>{}
        
            参数|类型|备注
                -|-|-
            openedPath|string|点击的文件的路径
            
            参数说明：
            - openedPath: 点击的文件的路径
            - treeNode: 点击的文件的节点数据


>**获取组件实例，调用zTree插件API**

 [jquery zTree]: http://www.treejs.cn/v3/api.php "jquery zTree API"
使用ref获取ztree实例，进而可以使用 [jquery zTree] 中的API(更多treeNode属性也可在里面查看)

    获取zTreeObj: this.ztree.current.ztreeObj


## example
```js
import * as React from 'react';
import Ztree from 'bztree';

const zNodes = [{ "id": 1, "pId": 0, "name": "pNode 1", "open": true },
{ "id": 11, "pId": 1, "name": "pNode 11", },
{ "id": 111, "pId": 11, "name": "sNode 111.js", },
{ "id": 112, "pId": 11, "name": "sNode 112.html", },
{ "id": 113, "pId": 11, "name": "sNode 113.css" },
{ "id": 114, "pId": 11, "name": "sNode 114.json" },
{ "id": 2, "pId": 0, "name": "pNode 3", "isParent":"true" },
{ "id": 3, "pId": 0, "name": "index.js", },
{ "id": 4, "pId": 0, "name": "package.json", }
];

export default class MySandpackProvider extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.ztree=React.createRef()
    }
    
    saveFiles = () => {
        //获取zTree对象：this.ztree.current.ztreeObj
        this.ztree.current.ztreeObj.cancelSelectedNode();
        this.ztree.current.ztreeObj.selectNode(ele);
    };
    

    render() {
        const configure = {
            addFile: (oldpath,parentNode, newfile, newfilename) => {
                //新建文件事件
                console.log("APP configure file parentNode", parentNode)
                console.log("APP configure 新增file是：" , newfile)
                console.log("APP configure 新增file的name是：" + newfilename)
            },
            addFolder: (parentNode, newfolder, newfoldername) => {
                //新建文件夹事件
                console.log("APP configure folder parentNode", parentNode)
                console.log("APP configure 新增folder是：", newfolder)
                console.log("APP configure 新增folder的name是：" + newfoldername)
            },
            rename: (oldpath,node, oldname, newname) => {
                //重命名节点事件
                console.log("APP configure rename node:", node)
                console.log("APP configure rename:" + newname);
                console.log("APP configure old name:" + oldname)
            },
            remove: (node) => {
                //删除节点事件
                console.log("APP remove", node);
            },
            clickFile: (openedPath, treeNode) => {
                //点击文件事件
                console.log("APP clickFile", treeNode);
            }
        };

        return (
            <div className='sandpack'>
                <Ztree
                    zNodes={zNodes}
                    configure={configure}
                    ref={this.ztree}
                />
            </div>
        );
    }
}

```
