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
        function onClick(e, treeId, treeNode) {
            zTree.expandNode(treeNode);
            const configure = _this.props.configure;
            configure.clickFile && configure.clickFile(treeNode._source)
            console.log("onClick", treeNode)
        }
        function onRightClick(event, treeId, treeNode) {
            if (!treeNode && event.target.tagName.toLowerCase() !== "button" && $(event.target).parents("a").length === 0) {
                zTree.cancelSelectedNode();
                showRMenu("root", event.clientX, event.clientY);
                console.log(treeId)
            } else if (treeNode && !treeNode.noR) {
                zTree.selectNode(treeNode);
                showRMenu("node", event.clientX, event.clientY);
            }
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

        function addFile(parentNode, newfilename) {
            hideRMenu();
            const configure = _this.props.configure;
            newfilename = "new file";
            parentNode = zTree.getSelectedNodes()[0];
            var newId;
            //var last = parentNode.children.length-1
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
                const oldpath = newfile.path;
                var inputObj = _this.editName(newfile)

                inputObj.bind('blur', function (event) {
                    newfilename = newfile.name = $(this).val();
                    newfile._source.filename = newfilename;
                    _this.exeConfigureAddFile(parentNode, newfile, oldpath, configure)
                }).bind('keydown', function (event) {
                    if (event.keyCode === 13 || event.keyCode === 27) {
                        newfilename = newfile.name = $(this).val();
                        newfile._source.filename = newfilename;
                        _this.exeConfigureAddFile(parentNode, newfile, oldpath, configure)
                    }
                }).bind('click', function (event) {
                    return false;
                }).bind('dblclick', function (event) {
                    return false;
                });
            }
        }
        function addFolder(parentNode) {
            hideRMenu();
            const configure = _this.props.configure;
            var newfolder;
            var newfoldername = "new folder"
            parentNode = zTree.getSelectedNodes()[0];
            var newId;
            if (parentNode) {  //选中节点下新建
                if (parentNode.check_Child_State < 0) {//空文件夹中新建
                    newId = parentNode.id * 10 + 1;
                } else {
                    newId = parentNode.id * 10 + parentNode.children.length + 1;
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
                var inputObj = _this.editName(newfolder)

                inputObj.bind('blur', function (event) {
                    newfolder.name = $(this).val();
                    if (newfolder.name.length === 0) {
                        newfolder.name = newfoldername
                    }
                    newfolder.path = _this.setFilePath(newfolder, []);
                    newfolder._source.filePath = newfolder.path;
                    newfolder._source.filename = newfolder.name;
                    var parentFolder = null;
                    parentNode = newfolder.getParentNode();
                    if (parentNode) {
                        parentNode._source.subdirectory.push(newfolder._source);
                        _this.repairUpdirectory(parentNode);
                        parentFolder = parentNode._source;
                    }
                    configure.addFolder && configure.addFolder(parentFolder, newfolder._source)
                    $(this).hide()
                    $(this).parent().html(newfolder.name)
                }).bind('keydown', function (event) {
                    if (event.keyCode === 13 || event.keyCode === 27) {
                        newfolder.name = $(this).val();
                        if (newfolder.name.length === 0) {
                            newfolder.name = newfoldername;
                        }
                        newfolder.path = _this.setFilePath(newfolder, [])
                        newfolder._source.filePath = newfolder.path;
                        newfolder._source.filename = newfolder.name;
                        var parentFolder = null;
                        parentNode = newfolder.getParentNode();
                        if (parentNode) {
                            parentNode._source.subdirectory.push(newfolder._source);
                            _this.repairUpdirectory(parentNode);
                            parentFolder = parentNode._source;
                        }
                        configure.addFolder && configure.addFolder(parentFolder, newfolder._source)
                        $(this).hide()
                        $(this).parent().html(newfolder.name)
                    }
                }).bind('click', function (event) {
                    return false;
                }).bind('dblclick', function (event) {
                    return false;
                });
            }
        }
        function rename(event, oldname, newname) {
            hideRMenu();
            const configure = _this.props.configure;

            var node = zTree.getSelectedNodes()[0];
            //const oldsource = { ...node._source };
            var oldsource = $.extend({}, node._source); //jquery深拷贝
            const oldpath = node.path;
            oldname = node.name;

            var inputObj = _this.editName(node);
            inputObj.bind('blur', function (event) {
                newname = node.name = $(this).val();
                _this.exeConfigureRename(oldsource, node, oldpath, oldname, configure)

            }).bind('keydown', function (event) {
                if (event.keyCode === 13 || event.keyCode === 27) {
                    newname = node.name = $(this).val();
                    _this.exeConfigureRename(oldsource, node, oldpath, oldname, configure)
                }
            }).bind('click', function (event) {
                return false;
            }).bind('dblclick', function (event) {
                return false;
            });

        }

        function remove(node) {
            hideRMenu();
            const configure = _this.props.configure;
            node = zTree.getSelectedNodes()[0];
            var parentNode = node.getParentNode();
            var fileNode = node._source;
            if (parentNode) {
                let parentSubdirectory = parentNode._source.subdirectory;
                for (let i = 0; i < parentSubdirectory.length; i++) {
                    if (parentSubdirectory[i].id == fileNode.id) {
                        parentSubdirectory.splice(i, 1);
                        break;
                    }
                }
                _this.repairUpdirectory(parentNode);
            }
            zTree.removeNode(node);
            configure.remove && configure.remove(node._source)
        }
    }
    setFilePath(n, filepath) {
        var pId = n.parentTId;
        if (pId === null) {
            filepath.unshift('/' + n.name)
            return filepath.join('');
        } else {
            filepath.unshift('/' + n.name);
            n = n.getParentNode();;
            return this.setFilePath(n, filepath)
        }
    }
    exeConfigureAddFile(parentNode, newfile, oldpath, configure) {
        if (newfile.name.length === 0) {
            newfile.name = "new file";
        }
        this.ztreeObj.updateNode(newfile);
        var parentFolder = null;
        parentNode = newfile.getParentNode();
        if (parentNode) {
            parentNode._source.subdirectory.push(newfile._source);
            this.repairUpdirectory(parentNode)
            parentFolder = parentNode._source;
        }
        configure.addFile && configure.addFile(parentFolder, newfile._source)
        // configure.addFile && configure.addFile(oldpath, parentNode, newfile, newfilename)
    }
    repairUpdirectory(parentNode) { //新建/删除文件时更新上级目录的子目录
        //向上更改
        var upparentNode = parentNode.getParentNode();
        if (upparentNode) {
            upparentNode._source.subdirectory = parentNode._source;
            return this.repairUpdirectory(upparentNode)
        }

    }
    repairSubdirectory(treeNode) {
        //向下更改 存在子文件的文件夹    
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
    exeConfigureRename(oldsource, node, oldpath, oldname, configure) {
        if (node.name.length === 0) {
            node.name = oldname;
        }
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
        configure.rename && configure.rename(oldsource, node._source)

    }
    editName(node) {
        this.ztreeObj.cancelSelectedNode()

        $("#" + node.tId + "_span").html("<input type=text class='rename' id='" + node.tId + "input' treeNodeinput/>");
        var inputObj = $("#" + node.tId + "input");
        inputObj.click(function () { return false; });
        inputObj.attr("value", node.name);
        inputObj.focus();
        inputObj.select();
        return inputObj;
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
                        <li id="m_addfile" className='item'>Create File</li>
                        <li id="m_addfolder" className='item'>Create Folder</li>
                        <li id="m_rename" className='item'>Rename</li>
                        <li id="m_del" className='item'>Delete</li>
                    </ul>
                </div>
            </div>
        )
    }
}