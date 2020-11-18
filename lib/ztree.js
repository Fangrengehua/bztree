'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

require('./jquery.ztree.all');

require('../src/css/tree-style.css');

require('../src/css/icon.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ReactZtree = function (_PureComponent) {
    _inherits(ReactZtree, _PureComponent);

    function ReactZtree(props) {
        _classCallCheck(this, ReactZtree);

        var _this2 = _possibleConstructorReturn(this, (ReactZtree.__proto__ || Object.getPrototypeOf(ReactZtree)).call(this, props));

        _this2.ztree = _react2.default.createRef();
        return _this2;
    }

    _createClass(ReactZtree, [{
        key: 'componentDidMount',
        value: function componentDidMount(props) {
            var _this = this;
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
                    onRightClick: onRightClick
                }
            };
            var zTree = this.ztreeObj = _jquery2.default.fn.zTree.init((0, _jquery2.default)(this.ztree.current), setting, this.props.zNodes);
            function onClick(e, treeId, treeNode) {
                zTree.expandNode(treeNode);
                var openedPath = treeNode.path;
                var configure = _this.props.configure;
                configure.clickFile && configure.clickFile(openedPath, treeNode);
                // if (_this.props.clickFile) {
                //     _this.props.clickFile(openedPath, treeNode)
                // }
            }
            function onRightClick(event, treeId, treeNode) {
                if (!treeNode && event.target.tagName.toLowerCase() !== "button" && (0, _jquery2.default)(event.target).parents("a").length === 0) {
                    zTree.cancelSelectedNode();
                    showRMenu("root", event.clientX, event.clientY);
                    console.log(treeId);
                } else if (treeNode && !treeNode.noR) {
                    zTree.selectNode(treeNode);
                    showRMenu("node", event.clientX, event.clientY);
                }
                //console.log("onRightClick:"+treeNode.name)
            }
            function showRMenu(type, x, y) {
                //type决定menu菜单内容，x,y决定menu显示位置
                (0, _jquery2.default)("#rMenu ul").show();
                if (type === "root") {
                    (0, _jquery2.default)("#m_del").unbind('click', remove).css('color', '#cfcfcf').removeClass('item');
                    (0, _jquery2.default)("#m_rename").unbind('click', rename).css('color', '#cfcfcf').removeClass('item');
                } else {
                    (0, _jquery2.default)("#m_del").unbind('click').bind('click', remove).removeAttr("style").addClass('item');
                    (0, _jquery2.default)("#m_rename").unbind('click').bind('click', rename).removeAttr("style").addClass('item');
                }
                y += document.body.scrollTop;
                x += document.body.scrollLeft;
                (0, _jquery2.default)('#rMenu').css({ "top": y + "px", "left": x + "px", "visibility": "visible" });

                (0, _jquery2.default)("body").bind("mousedown", onBodyMouseDown);
            }
            function onBodyMouseDown(event, node) {
                if (!(event.target.id === "rMenu" || (0, _jquery2.default)(event.target).parents("#rMenu").length > 0)) {
                    (0, _jquery2.default)('#rMenu').css({ "visibility": "hidden" });
                }
            }
            function hideRMenu() {
                if ((0, _jquery2.default)('#rMenu')) (0, _jquery2.default)('#rMenu').css({ "visibility": "hidden" });
                (0, _jquery2.default)("body").unbind("mousedown", onBodyMouseDown);
            }
            (0, _jquery2.default)("#m_addfile").unbind('click').bind('click', addFile);
            (0, _jquery2.default)("#m_addfolder").unbind('click').bind('click', addFolder);
            (0, _jquery2.default)("#m_rename").unbind('click').bind('click', rename);
            (0, _jquery2.default)("#m_del").unbind('click').bind('click', remove);

            function addFile(parentNode, newfilename) {
                hideRMenu();
                var configure = _this.props.configure;
                newfilename = "new file";
                //var count = 0;
                var newparentNode;
                parentNode = zTree.getSelectedNodes()[0];
                var newId;
                if (parentNode) {
                    if (parentNode.check_Child_State < 0) {
                        //空文件夹中新建
                        newId = parentNode.id * 10 + 1;
                    } else {
                        newId = parentNode.id * 10 + parentNode.children.length + 1;
                    }
                    var newfile = {
                        id: newId,
                        pId: parentNode.id,
                        isParent: false,
                        name: newfilename
                    };
                    newparentNode = zTree.addNodes(parentNode, newfile);
                } else {
                    var parentNodes = zTree.getNodes(); //可以获取所有的父节点
                    newfile = {
                        id: parentNodes.length + 1,
                        pId: 0,
                        isParent: false,
                        name: newfilename
                    };
                    newparentNode = zTree.addNodes(null, newfile);
                }

                if (newparentNode) {
                    var oldpath = newparentNode[0].path;
                    var inputObj = _this.editName(newparentNode[0]);

                    inputObj.bind('blur', function (event) {
                        newfilename = newparentNode[0].name = (0, _jquery2.default)(this).val();
                        _this.exeConfigureAddFile(parentNode, newparentNode[0], oldpath, newfilename, configure);
                    }).bind('keydown', function (event) {
                        if (event.keyCode === 13 || event.keyCode === 27) {
                            newfilename = newparentNode[0].name = (0, _jquery2.default)(this).val();
                            _this.exeConfigureAddFile(parentNode, newparentNode[0], oldpath, newfilename, configure);
                        }
                    }).bind('click', function (event) {
                        return false;
                    }).bind('dblclick', function (event) {
                        return false;
                    });
                }
            }
            function addFolder(node, newfoldername) {
                hideRMenu();
                var configure = _this.props.configure;
                var newfolder;
                newfoldername = "new folder";
                node = zTree.getSelectedNodes()[0];
                var newId;
                if (node) {
                    //选中节点下新建
                    if (node.check_Child_State < 0) {
                        //空文件夹中新建
                        newId = node.id * 10 + 1;
                    } else {
                        newId = node.id * 10 + node.children.length + 1;
                    }
                    newfolder = {
                        id: newId,
                        pId: node.id,
                        isParent: true,
                        name: newfoldername
                    };
                    var newparentnode = zTree.addNodes(node, newfolder);
                } else {
                    //根目录下新建
                    var nodes = zTree.getNodes(); //可以获取所有的父节点
                    newfolder = {
                        id: nodes.length + 1,
                        pId: 0,
                        isParent: true,
                        name: newfoldername
                    };
                    newparentnode = zTree.addNodes(null, newfolder);
                }
                if (newparentnode) {
                    var inputObj = _this.editName(newparentnode[0]);

                    inputObj.bind('blur', function (event) {
                        newfoldername = newparentnode[0].name = (0, _jquery2.default)(this).val();
                        if (newfoldername.length === 0) {
                            alert("名字不能为空！");
                            return false;
                        }
                        newparentnode[0].path = _this.setFilePath(newparentnode[0], []);
                        configure.addFolder && configure.addFolder(node, newparentnode[0], newfoldername);
                        (0, _jquery2.default)(this).hide();
                        (0, _jquery2.default)(this).parent().html(newfoldername);
                        console.log("ztree AddFolder1", newparentnode);
                    }).bind('keydown', function (event) {
                        if (event.keyCode === 13 || event.keyCode === 27) {
                            newfoldername = newparentnode[0].name = (0, _jquery2.default)(this).val();
                            if (newfoldername.length === 0) {
                                alert("名字不能为空！");
                                return false;
                            }
                            newparentnode[0].path = _this.setFilePath(newparentnode[0], []);
                            configure.addFolder && configure.addFolder(node, newparentnode[0], newfoldername);
                            (0, _jquery2.default)(this).hide();
                            (0, _jquery2.default)(this).parent().html(newfoldername);
                            console.log("ztree AddFolder2", newparentnode[0]);
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
                var configure = _this.props.configure;

                var node = zTree.getSelectedNodes()[0];
                var oldpath = node.path;
                oldname = node.name;

                var inputObj = _this.editName(node);
                inputObj.bind('blur', function (event) {
                    newname = node.name = (0, _jquery2.default)(this).val();
                    _this.exeConfigureRename(node, oldpath, oldname, newname, configure);
                }).bind('keydown', function (event) {
                    if (event.keyCode === 13 || event.keyCode === 27) {
                        newname = node.name = (0, _jquery2.default)(this).val();
                        _this.exeConfigureRename(node, oldpath, oldname, newname, configure);
                    }
                }).bind('click', function (event) {
                    return false;
                }).bind('dblclick', function (event) {
                    return false;
                });
            }

            function remove(node) {
                hideRMenu();
                var configure = _this.props.configure;
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
                configure.remove && configure.remove(node);

                console.log("function remove(node)", node);
            }
        }
    }, {
        key: 'setFilePath',
        value: function setFilePath(n, filepath) {
            var pId = n.parentTId;
            if (pId === null) {
                filepath.unshift('/' + n.name);
                return filepath.join('');
            } else {
                filepath.unshift('/' + n.name);
                n = n.getParentNode();;
                return this.setFilePath(n, filepath);
            }
        }
    }, {
        key: 'exeConfigureAddFile',
        value: function exeConfigureAddFile(parentNode, newfile, oldpath, newfilename, configure) {
            if (newfilename.length === 0) {
                alert("名字不能为空！");
                return false;
            }
            this.ztreeObj.updateNode(newfile);
            // this.props.reset(oldpath, newfile);
            configure.addFile && configure.addFile(oldpath, parentNode, newfile, newfilename);
            // this.props.addTab(newfile);
        }
    }, {
        key: 'exeConfigureAddFolder',
        value: function exeConfigureAddFolder(newparentnode, newfoldername, configure) {

            if (newfoldername.length === 0) {
                alert("名字不能为空！");
                return false;
            }

            newparentnode[0].path = this.setFilePath(newparentnode[0], []);
            configure.addFolder && configure.addFolder(newparentnode, newparentnode[0], newfoldername);
        }
    }, {
        key: 'exeConfigureRename',
        value: function exeConfigureRename(node, oldpath, oldname, newname, configure) {
            if (newname.length === 0) {
                alert("名字不能为空！");
                return false;
            }
            this.ztreeObj.updateNode(node);
            // this.props.reset(oldpath, node);
            configure.rename && configure.rename(oldpath, node, oldname, newname);
        }
    }, {
        key: 'editName',
        value: function editName(node) {
            this.ztreeObj.cancelSelectedNode();

            (0, _jquery2.default)("#" + node.tId + "_span").html("<input type=text class='rename' id='" + node.tId + "input' treeNodeinput/>");
            var inputObj = (0, _jquery2.default)("#" + node.tId + "input");
            inputObj.click(function () {
                return false;
            });
            inputObj.attr("value", node.name);
            inputObj.focus();
            inputObj.select();
            return inputObj;
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.ztreeObj && this.ztreeObj.destroy();
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { id: 'tree' },
                _react2.default.createElement('div', { id: 'treeDemo', className: 'ztree', ref: this.ztree }),
                _react2.default.createElement(
                    'div',
                    { id: 'rMenu' },
                    _react2.default.createElement(
                        'ul',
                        { className: 'menu' },
                        _react2.default.createElement(
                            'li',
                            { id: 'm_addfile', className: 'item' },
                            'Create File'
                        ),
                        _react2.default.createElement(
                            'li',
                            { id: 'm_addfolder', className: 'item' },
                            'Create Folder'
                        ),
                        _react2.default.createElement(
                            'li',
                            { id: 'm_rename', className: 'item' },
                            'Rename'
                        ),
                        _react2.default.createElement(
                            'li',
                            { id: 'm_del', className: 'item' },
                            'Delete'
                        )
                    )
                )
            );
        }
    }]);

    return ReactZtree;
}(_react.PureComponent);

exports.default = ReactZtree;