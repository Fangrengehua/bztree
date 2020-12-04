import React, { PureComponent } from 'react';
import $ from 'jquery';
import './jquery.ztree.all';
import './css/tree-style.css'
import './css/icon.css'

export default class ReactZtree extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            menuvisibility: 'hidden',
            menuX: 0,
            menuY: 0,
            itemclassName: 'item',
            isOut: false,
        }
        this.ztree = React.createRef()
        this.selectFile.bind(this);
        this.cancelSelectedFile.bind(this);
        this.getSelectedFiles.bind(this);
    }
    convert(filetree, zNodes, pId) {
        filetree.forEach((filenode, index) => {
            pId = pId ? pId : 0;
            var zid = pId * 10 + index + 1;
            filenode.id = zid;
            filenode.isFolder = filenode.isFolder ? filenode.isFolder : false;
            filenode.extend = filenode.extend ? filenode.extend : false;
            if (filenode.isFolder) {
                filenode.subdirectory = filenode.subdirectory ? filenode.subdirectory : []
            }
            zNodes.push({
                id: zid,
                pId: pId,
                name: filenode.filename,
                isParent: filenode.isFolder,
                open: filenode.extend,
                _source: filenode
            })
            if (filenode.isFolder) {
                this.convert(filenode.subdirectory, zNodes, filenode.id)
            }
        });
        return zNodes;
    }
    componentDidMount() {
        const { filetree } = this.props
        const setting = {
            view: {
                dblClickExpand: false,
                selectedMulti: true,
                showTitle: false
            },
            data: {
                keep: {
                    parent: true,
                    leaf: true
                },
                simpleData: {
                    enable: true
                }
            },
            edit: {
                enable: true
            },
            check: {
                enable: false
            },
            callback: {
                onClick: this.onClick.bind(this),
                onRightClick: this.onRightClick.bind(this),
            }
        }
        this.props.onRef && this.props.onRef(this)
        var zNodes = [];
        zNodes = this.convert(filetree, zNodes);
        //初始化文件树
        this.ztreeObj = $.fn.zTree.init($(this.ztree.current), setting, zNodes);
        this.filecount = 1;
        this.foldercount = 1;
    }
    onClick(e, treeId, treeNode) {
        const zTree = this.ztreeObj;
        zTree.expandNode(treeNode);
        const configure = this.props.configure;
        let result = configure.clickFile(treeNode._source);
        result.then(null, () => {
            console.log("用户click执行失败");
        })
    }
    onRightClick(event, treeId, treeNode) {
        const zTree = this.ztreeObj;
        if (!treeNode && event.target.tagName.toLowerCase() !== "button" && $(event.target).parents("a").length === 0) {
            zTree.cancelSelectedNode();
            this.showRMenu("root", event.clientX, event.clientY);
        } else if (treeNode && !treeNode.noR) {
            zTree.selectNode(treeNode);
            this.showRMenu("node", event.clientX, event.clientY);
        }
    }
    showRMenu(type, x, y) { //type决定menu菜单内容，x,y决定menu显示位置
        y += document.body.scrollTop;
        x += document.body.scrollLeft;
        if (type === "root") {
            this.setState({ menuvisibility: 'visible', menuX: x, menuY: y, itemclassName: 'falseitem', isOut: true })
        } else {
            this.setState({ menuvisibility: 'visible', menuX: x, menuY: y, itemclassName: 'item', isOut: false })
        }

        $("body").bind("mousedown", (event) => { this.onBodyMouseDown(event) });
    }
    onBodyMouseDown(event, node) {
        if (!(event.target.id === "rMenu" || $(event.target).parents("#rMenu").length > 0)) {
            this.setState({ menuvisibility: 'hidden' });
        }
    }
    hideRMenu() {
        if (this.setState({ menuvisibility: 'hidden' }));
        $("body").unbind("mousedown", (event) => { this.onBodyMouseDown(event) });
    }
    selectFile(tId) {
        if (!tId) {
            return;
        }
        var node = this.ztreeObj.getNodeByTId(tId);
        this.ztreeObj.selectNode(node)
    }
    cancelSelectedFile() {
        this.ztreeObj.cancelSelectedNode();
    }
    getSelectedFiles() {
        var nodes = this.ztreeObj.getSelectedNodes();
        var files = nodes[0]._source;
        return files;
    }
    create(isFolder) {
        this.hideRMenu();
        const configure = this.props.configure;
        const zTree = this.ztreeObj;
        var newfilename = isFolder ? "new folder" + this.foldercount++ : "new file" + this.filecount++;
        var newId, pId;
        var parentNode = zTree.getSelectedNodes()[0];
        //生成pId和id
        if (parentNode) {
            if (parentNode.check_Child_State < 0) { //空文件夹中新建
                newId = parentNode.id * 10 + 1;
            } else {
                let parentLastChildId = parentNode.children[parentNode.children.length - 1].id
                newId = parentLastChildId + 1;
            }
            pId = parentNode.id;
        } else {
            var parentNodes = zTree.getNodes();
            newId = parentNodes.length + 1;
            pId = 0;
        }
        //生成树节点和文件节点
        var newfile = {
            id: newId,
            pId: pId,
            isParent: isFolder,
            name: newfilename
        }
        newfile._source = {
            id: newfile.id,
            tId: newfile.tId,
            pTId: newfile.parentTId,
            filename: newfile.name,
            isFolder: isFolder,
        }
        if (isFolder) {
            newfile._source.entend = false;
            newfile._source.subdirectory = [];
        }
        parentNode = zTree.addNodes(parentNode, newfile);

        if (parentNode) { //生成成功重命名
            newfile = parentNode[0];
            this.editName(newfile, (inputval) => {
                let fileobj = this.exeConfigureAdd(inputval, newfile)
                let result = isFolder ?
                    configure.addFolder(fileobj.parentFolder, fileobj.newfile._source)
                    : configure.addFile(fileobj.parentFolder, fileobj.newfile._source)

                result.then(() => { this.ztreeObj.selectNode(newfile) },
                    () => { //错误处理
                        if (configure.error) {
                            configure.errorCallBack ? configure.errorCallBack() : console.log("errorCallBack is undefined")
                        }
                        this.removeFilefromParent(fileobj.newfile)
                        zTree.removeNode(fileobj.newfile);
                        console.log("用户create执行失败");
                    })
            });
        }
    }
    rename() {
        this.hideRMenu();
        const configure = this.props.configure;
        const zTree = this.ztreeObj;
        var node = zTree.getSelectedNodes()[0];
        //const oldsource = { ...node._source };
        var oldsource = $.extend({}, node._source); //jquery深拷贝
        const oldname = node.name;

        this.editName(node, (inputval) => {
            this.exeConfigureRename(inputval, oldsource, node);
            let result = configure.rename(oldsource, node._source);
            result.then(null, () => {
                if (configure.error) {
                    configure.errorCallBack ? configure.errorCallBack() : console.log("errorCallBack is undefined")
                }
                node.name = oldname;
                this.exeConfigureRename(node.name, oldsource, node);
                console.log("用户rename执行失败")
            })
        })
    }
    remove() {
        this.hideRMenu();
        const configure = this.props.configure;
        const zTree = this.ztreeObj;
        let node = zTree.getSelectedNodes()[0];
        let result = configure.remove(node._source);
        result.then(
            () => {
                this.removeFilefromParent(node)
                zTree.removeNode(node);
                console.log("用户remove执行成功");
            },
            () => {
                if (configure.error) {
                    configure.errorCallBack ? configure.errorCallBack() : console.log("errorCallBack is undefined")
                }
                console.log("用户remove执行失败");
            })
    }
    exeConfigureAdd(inputval, newfile) {
        newfile.name = inputval;
        var parentFolder = null;
        var parentNode = newfile.getParentNode();
        if (parentNode) {
            parentNode._source.subdirectory.push(newfile._source);
            this.repairUpdirectory(parentNode)
            parentFolder = parentNode._source;
        }
        this.ztreeObj.updateNode(newfile);
        return { newfile, parentFolder }

    }
    exeConfigureRename(inputval, oldsource, node) {
        node.name = inputval;
        var parentNode = node.getParentNode();
        var fileNode = node._source;
        if (parentNode) {
            var parentSubdirectory = parentNode._source.subdirectory;
            for (let i = 0; i < parentSubdirectory.length; i++) {
                if (parentSubdirectory[i].id === oldsource.id) {
                    parentSubdirectory[i] = fileNode;
                    break;
                }
            }
            this.repairUpdirectory(parentNode)
        }

        this.ztreeObj.updateNode(node);
        this.repairSubdirectory(node)
        //configure.rename && configure.rename(oldsource, node._source)
    }
    repairUpdirectory(parentNode) { //更新上级目录的子目录
        //向上更改
        var upparentNode = parentNode.getParentNode();
        if (upparentNode) {
            upparentNode._source.subdirectory = parentNode._source;
            return this.repairUpdirectory(upparentNode)
        }
    }
    repairSubdirectory(treeNode) { //向下更改 存在子文件的文件夹    
        if (treeNode.isParent && treeNode.check_Child_State === 0) {
            let children = treeNode.children;
            children.forEach((child) => {
                child.path = treeNode.path + '/' + child.name;
                console.log(child.path)
                child._source.filePath = child.path;
                return this.repairSubdirectory(child)
            })
        }
    }
    removeFilefromParent(node) {
        var parentNode = node.getParentNode();
        var fileNode = node._source;
        if (parentNode) {
            let parentSubdirectory = parentNode._source.subdirectory;
            for (let i = 0; i < parentSubdirectory.length; i++) {
                if (parentSubdirectory[i].tId == fileNode.tId) {
                    parentSubdirectory.splice(i, 1);
                    break;
                }
            }
            this.repairUpdirectory(parentNode);
        }
    }
    checkName(inputval, treeNode) { //重命名检查
        var reason = null;
        var parentNode = treeNode.getParentNode(); //父树节点
        if (inputval.length === 0) {  //文件名为空
            reason = "文件名不能为空";
            return reason;
        } else { //文件名不为空
            if (parentNode && parentNode.check_Child_State === 0) { //父节点存在且存在子节点
                var children = parentNode.children; // 
                children.forEach((item) => {
                    if (item.tId !== treeNode.tId && item.name === inputval) {
                        reason = "文件名重复";
                        return reason;
                    }
                })
            } else {
                var nodes = this.ztreeObj.getNodes(); //根目录
                nodes.forEach((item) => {
                    if (item.tId !== treeNode.tId && item.name === inputval) {
                        reason = "文件名重复";
                        return reason;
                    }
                })
            }
            return reason;
        }
    }
    editName(node, cb) {
        const _this = this;
        var check; //输入检查标记，true:文件名不重复不为空，false：文件名为空或重复
        this.ztreeObj.cancelSelectedNode()
        $("#" + node.tId + "_span").html("<input type=text class='rename' id='renameInput' treeNodeinput/>");
        var inputObj = $("#renameInput");
        inputObj.click(function () { return false; });
        inputObj.attr("value", node.name);
        inputObj.focus();
        inputObj.select();
        inputObj.bind('input propertychange', function () {
            $("#input-warning").remove();
            let reason = _this.checkName($(this).val(), node); //null:文件名不重复不为空 string:"文件名不能为空"/"文件名重复"
            if (reason === null) {
                check = true;
            } else {
                let x = $('#' + node.tId + "_span").offset().left
                let y = $('#' + node.tId + "_span").offset().top

                $("<div id='input-warning'>" + reason + "</div>").css({
                    top: y + 18 + 'px',
                    left: x + "px",
                }).appendTo('#' + node.tId + "_span");//追加到body内
                inputObj.focus();
                check = false;
            }
        })
        inputObj.bind('blur', function (event) {
            var inputval = inputObj.val();
            if (!check) {
                inputval = node.name;
            }
            cb(inputval);

        }).bind('keydown', function (event) {
            var inputval = inputObj.val();
            if (event.keyCode === 13 || event.keyCode === 27) {
                if (!check) {
                    inputval = node.name;
                }
                cb(inputval);
            }
        }).bind('click', function (event) {
            return false;
        }).bind('dblclick', function (event) {
            return false;
        });
    }

    render() {
        const id = this.props.id ? this.props.id : "filetree";
        const rMenustyle = {
            visibility: this.state.menuvisibility,
            top: this.state.menuY,
            left: this.state.menuX
        }
        return (
            <div id='tree'>
                <div id={id} className="ztree" ref={this.ztree}></div>
                <div id="rMenu" style={rMenustyle}>
                    <ul className="menu">
                        <li onClick={() => { this.create(false) }} className='item'>新建文件</li>
                        <li onClick={() => { this.create(true) }} className='item'>新建文件夹</li>
                        <li onClick={this.state.isOut ? null : () => { this.rename() }} className={this.state.itemclassName} >重命名</li>
                        <li onClick={this.state.isOut ? null : () => { this.remove() }} className={this.state.itemclassName} >删除</li>
                    </ul>
                </div>
            </div>
        )
    }
}