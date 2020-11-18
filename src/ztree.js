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
    componentDidMount(props) {
        const _this = this
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
        var zTree = this.ztreeObj = $.fn.zTree.init($(this.ztree.current), setting, this.props.zNodes);
        function onClick(e, treeId, treeNode) {
            zTree.expandNode(treeNode);
            var openedPath = treeNode.path;
            const configure = _this.props.configure;
            configure.clickFile && configure.clickFile(openedPath, treeNode)
            // if (_this.props.clickFile) {
            //     _this.props.clickFile(openedPath, treeNode)
            // }
        }
        function onRightClick(event, treeId, treeNode) {
            if (!treeNode && event.target.tagName.toLowerCase() !== "button" && $(event.target).parents("a").length === 0 ) {
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
       
        function addFile (parentNode, newfilename) {
            hideRMenu();
            const configure = _this.props.configure;
            newfilename = "new file";
            //var count = 0;
            var newparentNode;
            parentNode = zTree.getSelectedNodes()[0];
            var newId;
            if (parentNode) {
                if (parentNode.check_Child_State < 0) { //空文件夹中新建
                    newId = parentNode.id * 10 + 1;
                } else {
                    newId = parentNode.id * 10 + parentNode.children.length + 1;
                }
                var newfile = {
                    id: newId,
                    pId: parentNode.id,
                    isParent: false,
                    name: newfilename
                }
                newparentNode = zTree.addNodes(parentNode, newfile);
            } else {
                var parentNodes = zTree.getNodes(); //可以获取所有的父节点
                newfile = {
                    id: parentNodes.length + 1,
                    pId: 0,
                    isParent: false,
                    name: newfilename
                }
                newparentNode = zTree.addNodes(null, newfile)
            }
            
            if (newparentNode) {
                const oldpath = newparentNode[0].path;
                var inputObj = _this.editName(newparentNode[0])
                
                inputObj.bind('blur', function (event) {
                    newfilename = newparentNode[0].name = $(this).val();
                    _this.exeConfigureAddFile(parentNode, newparentNode[0], oldpath, newfilename, configure)
                }).bind('keydown', function (event) {
                    if (event.keyCode === 13 || event.keyCode === 27) {
                        newfilename = newparentNode[0].name = $(this).val();
                        _this.exeConfigureAddFile(parentNode, newparentNode[0], oldpath, newfilename, configure)
                    }
                }).bind('click', function (event) {
                    return false;
                }).bind('dblclick', function (event) {
                    return false;
                });
            }
        }
        function addFolder(node, newfoldername){
            hideRMenu();
            const configure = _this.props.configure;
            var newfolder;
            newfoldername = "new folder"
            node = zTree.getSelectedNodes()[0];
            var newId;
            if (node) {  //选中节点下新建
                if (node.check_Child_State < 0) {//空文件夹中新建
                    newId = node.id * 10 + 1;
                } else {
                    newId = node.id * 10 + node.children.length + 1;
                }
                newfolder = {
                    id: newId,
                    pId: node.id,
                    isParent: true,
                    name: newfoldername
                }
                var newparentnode = zTree.addNodes(node, newfolder);
            } else { //根目录下新建
                var nodes = zTree.getNodes(); //可以获取所有的父节点
                newfolder = {
                    id: nodes.length + 1,
                    pId: 0,
                    isParent: true,
                    name: newfoldername
                }
                newparentnode = zTree.addNodes(null, newfolder);
            }
            if (newparentnode) {
                var inputObj = _this.editName(newparentnode[0])

                inputObj.bind('blur', function (event) {
                    newfoldername = newparentnode[0].name = $(this).val();
                    if (newfoldername.length === 0) {
                            alert("名字不能为空！");
                            return false;
                    }
                    newparentnode[0].path = _this.setFilePath(newparentnode[0], [])
                    configure.addFolder && configure.addFolder(node, newparentnode[0], newfoldername)
                    $(this).hide()
                    $(this).parent().html(newfoldername)
                    console.log("ztree AddFolder1", newparentnode)
                }).bind('keydown', function (event) {
                    if (event.keyCode === 13 || event.keyCode === 27) {
                        newfoldername = newparentnode[0].name = $(this).val();
                        if (newfoldername.length === 0) {
                            alert("名字不能为空！");
                            return false;
                        }
                        newparentnode[0].path = _this.setFilePath(newparentnode[0], [])
                        configure.addFolder && configure.addFolder(node, newparentnode[0], newfoldername)
                        $(this).hide()
                        $(this).parent().html(newfoldername)
                        console.log("ztree AddFolder2", newparentnode[0])
                       
                    }
                }).bind('click', function (event) {
                    return false;
                }).bind('dblclick', function (event) {
                    return false;
                });
            }
        }
        function rename(event,oldname, newname) {
            hideRMenu();
            const configure = _this.props.configure;
            
            var node = zTree.getSelectedNodes()[0];
            const oldpath = node.path;
            oldname = node.name;

            var inputObj = _this.editName(node);
            inputObj.bind('blur', function (event) {
                newname = node.name = $(this).val();
                _this.exeConfigureRename(node, oldpath, oldname, newname, configure)

        }).bind('keydown', function (event) {
            if (event.keyCode === 13 || event.keyCode === 27) {
                newname = node.name = $(this).val();
                _this.exeConfigureRename(node, oldpath, oldname, newname, configure)
            }
        }).bind('click', function (event) {
            return false;
        }).bind('dblclick', function (event) {
            return false;
        });
                   
        }

        function remove(node){
            hideRMenu();
            const configure = _this.props.configure;
            node = zTree.getSelectedNodes()[0];
            zTree.removeNode(node);
            // var removefolder = (node) => {
            //     let children = node.children;
            //     children.forEach((element) => {
            //         if (element.isParent){
            //             return removefolder(element)
            //         } else {
            //             _this.props.remove(element);
            //         }
            //     });
            // }
            // if (node.isParent) {
            //     removefolder(node);
            // } else {
            //     _this.props.remove(node);
            // }
            configure.remove && configure.remove(node)
            
            console.log("function remove(node)",node)
        }
    }
    setFilePath(n, filepath)  {
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
    exeConfigureAddFile (parentNode, newfile, oldpath, newfilename, configure) {
        if (newfilename.length === 0) {
            alert("名字不能为空！");
            return false;
        }
        this.ztreeObj.updateNode(newfile);
        // this.props.reset(oldpath, newfile);
        configure.addFile && configure.addFile(oldpath,parentNode, newfile, newfilename)
        // this.props.addTab(newfile);
    }
    exeConfigureAddFolder (newparentnode, newfoldername, configure) {
        
        if (newfoldername.length === 0) {
            alert("名字不能为空！");
            return false;
        }

        newparentnode[0].path = this.setFilePath(newparentnode[0], [])
        configure.addFolder && configure.addFolder(newparentnode, newparentnode[0], newfoldername)
    }
    exeConfigureRename (node,oldpath,oldname,newname,configure) {
        if (newname.length === 0) {
            alert("名字不能为空！");
            return false;
        }
        this.ztreeObj.updateNode(node);
        // this.props.reset(oldpath, node);
        configure.rename && configure.rename(oldpath,node, oldname, newname)   

    }
    editName (node) {
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
        return (
            <div id='tree'>
                <div id='treeDemo' className="ztree" ref={this.ztree}></div>
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