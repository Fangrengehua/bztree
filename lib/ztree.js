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
        key: 'convert',
        value: function convert(filetree, zNodes, pId) {
            var _this3 = this;

            filetree.forEach(function (filenode, index) {
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
                });
                if (filenode.isFolder) {
                    _this3.convert(filenode.subdirectory, zNodes, filenode.id);
                }
            });
            return zNodes;
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this = this;
            var zNodes = [];
            var filetree = this.props.filetree;

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
                    onRightClick: onRightClick
                }
            };

            var zTree = this.ztreeObj = _jquery2.default.fn.zTree.init((0, _jquery2.default)(this.ztree.current), setting, zNodes);
            function onClick(e, treeId, treeNode) {
                zTree.expandNode(treeNode);
                var configure = _this.props.configure;
                configure.clickFile && configure.clickFile(treeNode._source);
                console.log("onClick", treeNode);
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
                //var newparentNode;
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
                    newfile._source = {
                        id: newfile.id,
                        filename: newfile.name,
                        isFolder: false
                    };
                    parentNode = zTree.addNodes(parentNode, newfile);
                } else {
                    var parentNodes = zTree.getNodes(); //可以获取所有的父节点
                    newfile = {
                        id: parentNodes.length + 1,
                        pId: 0,
                        isParent: false,
                        name: newfilename
                    };
                    newfile._source = {
                        id: newfile.id,
                        filename: newfile.name,
                        isFolder: false
                    };
                    parentNode = zTree.addNodes(null, newfile);
                }

                if (parentNode) {
                    newfile = parentNode[0];
                    var oldpath = newfile.path;
                    var inputObj = _this.editName(newfile);

                    inputObj.bind('blur', function (event) {
                        newfilename = newfile.name = (0, _jquery2.default)(this).val();
                        newfile._source.filename = newfilename;
                        _this.exeConfigureAddFile((0, _jquery2.default)(this), parentNode, newfile, oldpath, configure);
                    }).bind('keydown', function (event) {
                        if (event.keyCode === 13 || event.keyCode === 27) {
                            newfilename = newfile.name = (0, _jquery2.default)(this).val();
                            newfile._source.filename = newfilename;
                            _this.exeConfigureAddFile((0, _jquery2.default)(this), parentNode, newfile, oldpath, configure);
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
                var configure = _this.props.configure;
                var newfolder;
                var newfoldername = "new folder";
                parentNode = zTree.getSelectedNodes()[0];
                var newId;
                if (parentNode) {
                    //选中节点下新建
                    if (parentNode.check_Child_State < 0) {
                        //空文件夹中新建
                        newId = parentNode.id * 10 + 1;
                    } else {
                        newId = parentNode.id * 10 + parentNode.children.length + 1;
                    }
                    newfolder = {
                        id: newId,
                        pId: parentNode.id,
                        isParent: true,
                        name: newfoldername
                    };
                    newfolder._source = {
                        id: newfolder.id,
                        filename: newfolder.name,
                        isFolder: true,
                        entend: false,
                        subdirectory: []
                    };
                    parentNode = zTree.addNodes(parentNode, newfolder);
                } else {
                    //根目录下新建
                    var nodes = zTree.getNodes(); //可以获取所有的父节点
                    newfolder = {
                        id: nodes.length + 1,
                        pId: 0,
                        isParent: true,
                        name: newfoldername
                    };
                    newfolder._source = {
                        id: newfolder.id,
                        filename: newfolder.name,
                        isFolder: true,
                        entend: false,
                        subdirectory: []
                    };
                    parentNode = zTree.addNodes(null, newfolder);
                }
                if (parentNode) {
                    newfolder = parentNode[0];
                    var inputObj = _this.editName(newfolder);

                    inputObj.bind('blur', function (event) {
                        newfoldername = newfolder.name = (0, _jquery2.default)(this).val();
                        if (newfoldername.length === 0) {
                            alert("名字不能为空！");

                            (0, _jquery2.default)(this).focus();
                            return false;
                        }
                        newfolder.path = _this.setFilePath(newfolder, []);
                        newfolder._source.filePath = newfolder.path;
                        newfolder._source.filename = newfolder.name;
                        var parentFolder = null;
                        parentNode = newfolder.getParentNode();
                        if (parentNode) {
                            parentNode._source.subdirectory.push(newfolder._source);
                            parentFolder = parentNode._source;
                        }
                        configure.addFolder && configure.addFolder(parentFolder, newfolder._source);
                        (0, _jquery2.default)(this).hide();
                        (0, _jquery2.default)(this).parent().html(newfoldername);
                    }).bind('keydown', function (event) {
                        if (event.keyCode === 13 || event.keyCode === 27) {
                            newfoldername = newfolder.name = (0, _jquery2.default)(this).val();
                            if (newfoldername.length === 0) {
                                alert("名字不能为空！");
                                (0, _jquery2.default)(this).focus();
                                return false;
                            }
                            newfolder.path = _this.setFilePath(newfolder, []);
                            newfolder._source.filePath = newfolder.path;
                            newfolder._source.filename = newfolder.name;
                            var parentFolder = null;
                            parentNode = newfolder.getParentNode();
                            if (parentNode) {
                                parentNode._source.subdirectory.push(newfolder._source);
                                parentFolder = parentNode._source;
                            }
                            configure.addFolder && configure.addFolder(parentFolder, newfolder._source);
                            (0, _jquery2.default)(this).hide();
                            (0, _jquery2.default)(this).parent().html(newfoldername);
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
                //const oldsource = { ...node._source };
                var oldsource = _jquery2.default.extend({}, node._source);
                var oldpath = node.path;
                oldname = node.name;

                var inputObj = _this.editName(node);
                inputObj.bind('blur', function (event) {
                    newname = node.name = (0, _jquery2.default)(this).val();
                    _this.exeConfigureRename((0, _jquery2.default)(this), oldsource, node, oldpath, oldname, configure);
                }).bind('keydown', function (event) {
                    if (event.keyCode === 13 || event.keyCode === 27) {
                        newname = node.name = (0, _jquery2.default)(this).val();
                        _this.exeConfigureRename((0, _jquery2.default)(this), oldsource, node, oldpath, oldname, configure);
                    }
                }).bind('click', function (event) {
                    console.log("click");
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
                configure.remove && configure.remove(node._source);
                // configure.remove && configure.remove(node)

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
        value: function exeConfigureAddFile(input, parentNode, newfile, oldpath, configure) {
            if (newfile.name.length === 0) {
                alert("名字不能为空！");
                input.focus();
                return false;
            }
            this.ztreeObj.updateNode(newfile);
            var parentFolder = null;
            parentNode = newfile.getParentNode();
            if (parentNode) {
                parentNode._source.subdirectory.push(newfile._source);
                parentFolder = parentNode._source;
            }
            configure.addFile && configure.addFile(parentFolder, newfile._source);
            // configure.addFile && configure.addFile(oldpath, parentNode, newfile, newfilename)
        }
    }, {
        key: 'exeConfigureRename',
        value: function exeConfigureRename(input, oldsource, node, oldpath, oldname, configure) {
            if (node.name.length === 0) {
                alert("名字不能为空！");
                input.focus();
                return false;
            }
            this.ztreeObj.updateNode(node);
            // node._source.filename = node.name;
            // node._source.filePath = node.path;
            configure.rename && configure.rename(oldsource, node._source);
            // configure.rename && configure.rename(oldpath, node, oldname, newname)
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