import React, { PureComponent } from 'react';
import $ from 'jquery';
import './jquery.ztree.all';
import '../src/css/tree-style.css'
import '../src/css/icon.css'

export default class ReactZtree extends PureComponent {
    constructor(props) {
        super(props);
        this.ztree = React.createRef()
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
        const _this = this;
        var zNodes = [];
        const { filetree } = this.props
        zNodes = _this.convert(filetree, zNodes);
        var setting = {
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
                onClick: onClick,
                onRightClick: onRightClick,
            }
        }

        var zTree = this.ztreeObj = $.fn.zTree.init($(this.ztree.current), setting, zNodes);
        function onRightClick(event, treeId, treeNode) {
            if (!treeNode && event.target.tagName.toLowerCase() !== "button" && $(event.target).parents("a").length === 0) {
                zTree.cancelSelectedNode();
                showRMenu("root", event.clientX, event.clientY);
                console.log(treeId)
            } else if (treeNode && !treeNode.noR) {
                zTree.selectNode(treeNode);
                showRMenu("node", event.clientX, event.clientY);
            }
            //console.log("onRightClick:"+treeNode.name)
        }
        function showRMenu(type, x, y) { //type决定menu菜单内容，x,y决定menu显示位置
            $("#rMenu ul").show();
            if (type === "root") {
                $("#m_del").unbind('click', remove).css('color', '#cfcfcf').removeClass('item');
                $("#m_rename").unbind('click', rename).css('color', '#cfcfcf').removeClass('item');
            } else {
                $("#m_del").unbind('click').bind('click', remove).removeAttr("style").addClass('item');
                $("#m_rename").unbind('click').bind('click', rename).removeAttr("style").addClass('item');
            }
            y += document.body.scrollTop;
            x += document.body.scrollLeft;
            $('#rMenu').css({ "top": y + "px", "left": x + "px", "visibility": "visible" });

            $("body").bind("mousedown", onBodyMouseDown);
        }
        function onBodyMouseDown(event, node) {
            if (!(event.target.id === "rMenu" || $(event.target).parents("#rMenu").length > 0)) {
                $('#rMenu').css({ "visibility": "hidden" });
            }
        }
        function hideRMenu() {
            if ($('#rMenu')) $('#rMenu').css({ "visibility": "hidden" });
            $("body").unbind("mousedown", onBodyMouseDown);
        }
        $("#m_addfile").unbind('click').bind('click', addFile);
        $("#m_addfolder").unbind('click').bind('click', addFolder);
        $("#m_rename").unbind('click').bind('click', rename);
        $("#m_del").unbind('click').bind('click', remove);

        function onClick(e, treeId, treeNode) {
            zTree.expandNode(treeNode);
            const configure = _this.props.configure;
            let result = configure.clickFile(treeNode._source);
            result.then(() => {
                console.log("onClick", treeNode);
            }, () => {
                console.log("用户click执行失败");
            })
        }
        var filecount = 1;
        function addFile(parentNode, newfilename) {
            hideRMenu();
            const configure = _this.props.configure;

            newfilename = "new file" + filecount++;
            parentNode = zTree.getSelectedNodes()[0];
            var newId;
            if (parentNode) {
                if (parentNode.check_Child_State < 0) { //空文件夹中新建
                    newId = parentNode.id * 10 + 1;
                } else {
                    let parentLastChildId = parentNode.children[parentNode.children.length - 1].id
                    newId = parentLastChildId + 1;
                }
                var newfile = {
                    id: newId,
                    pId: parentNode.id,
                    isParent: false,
                    name: newfilename
                }
                newfile._source = {
                    id: newfile.id,
                    tId: newfile.tId,
                    pTId: newfile.parentTId,
                    filename: newfile.name,
                    isFolder: false,
                }
                parentNode = zTree.addNodes(parentNode, newfile);
            } else {
                var parentNodes = zTree.getNodes(); //可以获取所有的父节点
                newfile = {
                    id: parentNodes.length + 1,
                    pId: 0,
                    isParent: false,
                    name: newfilename
                }
                newfile._source = {
                    id: newfile.id,
                    tId: newfile.tId,
                    pTId: newfile.parentTId,
                    filename: newfile.name,
                    isFolder: false,
                }
                parentNode = zTree.addNodes(null, newfile)
            }
            if (parentNode) {
                newfile = parentNode[0];
                _this.editName(newfile, (inputval) => {
                    var fileobj = _this.exeConfigureAddFile(inputval, newfile)
                    let result = configure.addFile(fileobj.parentFolder, fileobj.newfile._source)
                    result.then(null,
                        () => {
                            if (configure.error) {
                                configure.errorCallBack ? configure.errorCallBack() : console.log("errorCallBack is undefined")
                            }
                            _this.removeFilefromParent(fileobj.newfile)
                            zTree.removeNode(fileobj.newfile);
                            console.log("用户addFile执行失败");
                        })
                });
            }
        }
        var foldercount = 1;
        function addFolder(parentNode) {
            hideRMenu();
            const configure = _this.props.configure;
            var newfolder;
            var newfoldername = "new folder" + foldercount++
            parentNode = zTree.getSelectedNodes()[0];
            var newId;
            if (parentNode) {  //选中节点下新建
                if (parentNode.check_Child_State < 0) {//空文件夹中新建
                    newId = parentNode.id * 10 + 1;
                } else {
                    let parentLastChildId = parentNode.children[parentNode.children.length - 1].id
                    newId = parentLastChildId + 1;
                }
                newfolder = {
                    id: newId,
                    pId: parentNode.id,
                    isParent: true,
                    name: newfoldername
                }
                newfolder._source = {
                    id: newfolder.id,
                    tId: newfolder.tId,
                    pTId: newfolder.parentTId,
                    filename: newfolder.name,
                    isFolder: true,
                    entend: false,
                    subdirectory: []
                }
                parentNode = zTree.addNodes(parentNode, newfolder);
            } else { //根目录下新建
                var nodes = zTree.getNodes(); //可以获取所有的父节点
                newfolder = {
                    id: nodes.length + 1,
                    pId: 0,
                    isParent: true,
                    name: newfoldername
                }
                newfolder._source = {
                    id: newfolder.id,
                    tId: newfolder.tId,
                    pTId: newfolder.parentTId,
                    filename: newfolder.name,
                    isFolder: true,
                    entend: false,
                    subdirectory: []
                }
                parentNode = zTree.addNodes(null, newfolder);
            }
            if (parentNode) {
                newfolder = parentNode[0];
                _this.editName(newfolder, (inputval) => {
                    var fileobj = _this.exeConfigureAddFolder(inputval, newfolder)
                    let result = configure.addFolder(fileobj.parentFolder, fileobj.newfolder._source);
                    result.then(null, () => {
                        if (configure.error) {
                            configure.errorCallBack ? configure.errorCallBack() : console.log("errorCallBack is undefined")
                        }
                        _this.removeFilefromParent(fileobj.newfolder)
                        zTree.removeNode(fileobj.newfolder);
                        console.log("用户addFolder执行失败")
                    })
                });
            }
        }
        function rename(oldname) {
            hideRMenu();
            const configure = _this.props.configure;

            var node = zTree.getSelectedNodes()[0];
            //const oldsource = { ...node._source };
            var oldsource = $.extend({}, node._source); //jquery深拷贝
            oldname = node.name;

            _this.editName(node, (inputval) => {
                _this.exeConfigureRename(inputval, oldsource, node);
                let result = configure.rename(oldsource, node._source);
                result.then(null, () => {
                    if (configure.error) {
                        configure.errorCallBack ? configure.errorCallBack() : console.log("errorCallBack is undefined")
                    }
                    node.name = oldname;
                    _this.exeConfigureRename(node.name, oldsource, node, configure);
                    console.log("用户rename执行失败")
                })
            })
        }
        function remove(node) {
            hideRMenu();
            const configure = _this.props.configure;
            node = zTree.getSelectedNodes()[0];
            let result = configure.remove(node._source);
            result.then(
                () => {
                    _this.removeFilefromParent(node)
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
    }
    exeConfigureAddFile(inputval, newfile) {
        newfile.name = inputval;
        //newfile._source.filename = inputval;
        var parentFolder = null;
        var parentNode = newfile.getParentNode();
        if (parentNode) {
            parentNode._source.subdirectory.push(newfile._source);
            this.repairUpdirectory(parentNode)
            parentFolder = parentNode._source;
        }
        this.ztreeObj.updateNode(newfile);
        return { newfile, parentFolder }
        // configure.addFile && configure.addFile(parentFolder, newfile._source)

    }
    exeConfigureAddFolder(inputval, newfolder) {
        newfolder.name = inputval;
        var parentFolder = null;
        var parentNode = newfolder.getParentNode();
        if (parentNode) {
            parentNode._source.subdirectory.push(newfolder._source);
            this.repairUpdirectory(parentNode);
            parentFolder = parentNode._source;
        }
        this.ztreeObj.updateNode(newfolder);
        return { newfolder, parentFolder }
        //configure.addFolder && configure.addFolder(parentFolder, newfolder._source)

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
                //return false;
            }
        })
        inputObj.bind('blur', function (event) {
            var inputval = inputObj.val();
            if (!check) {
                inputval = node.name;
            }
            cb(inputval);
            //return inputval;

        }).bind('keydown', function (event) {
            var inputval = inputObj.val();
            if (event.keyCode === 13 || event.keyCode === 27) {
                if (!check) {
                    inputval = node.name;
                }
                cb(inputval);
                //return inputval;
            }
        }).bind('click', function (event) {
            return false;
        }).bind('dblclick', function (event) {
            return false;
        });
    }
    componentWillUnmount() {
        this.ztreeObj && this.ztreeObj.destroy();
    }

    render() {
        const id = this.props.id ? this.props.id : "treeDemo";
        return (
            <div id='tree'>
                <div id={id} className="ztree" ref={this.ztree}></div>
                <div id="rMenu">
                    <ul className="menu">
                        <li id="m_addfile" className='item'>新建文件</li>
                        <li id="m_addfolder" className='item'>新建文件夹</li>
                        <li id="m_rename" className='item'>重命名</li>
                        <li id="m_del" className='item'>删除</li>
                    </ul>
                </div>
            </div>
        )
    }
}