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

        _this2.state = {
            menuvisibility: 'hidden',
            menuX: 0,
            menuY: 0,
            itemclassName: 'item',
            isOut: false
        };
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
                filenode.isFolder = filenode.isFolder ? filenode.isFolder : false;
                filenode.extend = filenode.extend ? filenode.extend : false;
                if (filenode.isFolder) {
                    filenode.subdirectory = filenode.subdirectory ? filenode.subdirectory : [];
                }
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
            var filetree = this.props.filetree;

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
                    onClick: this.onClick.bind(this),
                    onRightClick: this.onRightClick.bind(this)
                }
            };
            var zNodes = [];
            zNodes = this.convert(filetree, zNodes);
            //初始化文件树
            this.ztreeObj = _jquery2.default.fn.zTree.init((0, _jquery2.default)(this.ztree.current), setting, zNodes);
            this.filecount = 1;
            this.foldercount = 1;
        }
    }, {
        key: 'onClick',
        value: function onClick(e, treeId, treeNode) {
            var zTree = this.ztreeObj;
            zTree.expandNode(treeNode);
            var configure = this.props.configure;
            var result = configure.clickFile(treeNode._source);
            result.then(null, function () {
                console.log("用户click执行失败");
            });
        }
    }, {
        key: 'onRightClick',
        value: function onRightClick(event, treeId, treeNode) {
            var zTree = this.ztreeObj;
            if (!treeNode && event.target.tagName.toLowerCase() !== "button" && (0, _jquery2.default)(event.target).parents("a").length === 0) {
                zTree.cancelSelectedNode();
                this.showRMenu("root", event.clientX, event.clientY);
            } else if (treeNode && !treeNode.noR) {
                zTree.selectNode(treeNode);
                this.showRMenu("node", event.clientX, event.clientY);
            }
        }
    }, {
        key: 'showRMenu',
        value: function showRMenu(type, x, y) {
            var _this4 = this;

            //type决定menu菜单内容，x,y决定menu显示位置
            y += document.body.scrollTop;
            x += document.body.scrollLeft;
            if (type === "root") {
                this.setState({ menuvisibility: 'visible', menuX: x, menuY: y, itemclassName: 'falseitem', isOut: true });
            } else {
                this.setState({ menuvisibility: 'visible', menuX: x, menuY: y, itemclassName: 'item', isOut: false });
            }

            (0, _jquery2.default)("body").bind("mousedown", function (event) {
                _this4.onBodyMouseDown(event);
            });
        }
    }, {
        key: 'onBodyMouseDown',
        value: function onBodyMouseDown(event, node) {
            if (!(event.target.id === "rMenu" || (0, _jquery2.default)(event.target).parents("#rMenu").length > 0)) {
                this.setState({ menuvisibility: 'hidden' });
            }
        }
    }, {
        key: 'hideRMenu',
        value: function hideRMenu() {
            var _this5 = this;

            if (this.setState({ menuvisibility: 'hidden' })) ;
            (0, _jquery2.default)("body").unbind("mousedown", function (event) {
                _this5.onBodyMouseDown(event);
            });
        }
    }, {
        key: 'create',
        value: function create(isFolder) {
            var _this6 = this;

            this.hideRMenu();
            var configure = this.props.configure;
            var zTree = this.ztreeObj;
            var newfilename = isFolder ? "new folder" + this.foldercount++ : "new file" + this.filecount++;
            var newId, pId;
            var parentNode = zTree.getSelectedNodes()[0];
            //生成pId和id
            if (parentNode) {
                if (parentNode.check_Child_State < 0) {
                    //空文件夹中新建
                    newId = parentNode.id * 10 + 1;
                } else {
                    var parentLastChildId = parentNode.children[parentNode.children.length - 1].id;
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
            };
            newfile._source = {
                id: newfile.id,
                tId: newfile.tId,
                pTId: newfile.parentTId,
                filename: newfile.name,
                isFolder: isFolder
            };
            if (isFolder) {
                newfile._source.entend = false;
                newfile._source.subdirectory = [];
            }
            parentNode = zTree.addNodes(parentNode, newfile);

            if (parentNode) {
                //生成成功重命名
                newfile = parentNode[0];
                this.editName(newfile, function (inputval) {
                    var fileobj = _this6.exeConfigureAdd(inputval, newfile);
                    var result = isFolder ? configure.addFolder(fileobj.parentFolder, fileobj.newfile._source) : configure.addFile(fileobj.parentFolder, fileobj.newfile._source);

                    result.then(null, function () {
                        //错误处理
                        if (configure.error) {
                            configure.errorCallBack ? configure.errorCallBack() : console.log("errorCallBack is undefined");
                        }
                        _this6.removeFilefromParent(fileobj.newfile);
                        zTree.removeNode(fileobj.newfile);
                        console.log("用户create执行失败");
                    });
                });
            }
        }
    }, {
        key: 'rename',
        value: function rename() {
            var _this7 = this;

            this.hideRMenu();
            var configure = this.props.configure;
            var zTree = this.ztreeObj;
            var node = zTree.getSelectedNodes()[0];
            //const oldsource = { ...node._source };
            var oldsource = _jquery2.default.extend({}, node._source); //jquery深拷贝
            var oldname = node.name;

            this.editName(node, function (inputval) {
                _this7.exeConfigureRename(inputval, oldsource, node);
                var result = configure.rename(oldsource, node._source);
                result.then(null, function () {
                    if (configure.error) {
                        configure.errorCallBack ? configure.errorCallBack() : console.log("errorCallBack is undefined");
                    }
                    node.name = oldname;
                    _this7.exeConfigureRename(node.name, oldsource, node);
                    console.log("用户rename执行失败");
                });
            });
        }
    }, {
        key: 'remove',
        value: function remove() {
            var _this8 = this;

            this.hideRMenu();
            var configure = this.props.configure;
            var zTree = this.ztreeObj;
            var node = zTree.getSelectedNodes()[0];
            var result = configure.remove(node._source);
            result.then(function () {
                _this8.removeFilefromParent(node);
                zTree.removeNode(node);
                console.log("用户remove执行成功");
            }, function () {
                if (configure.error) {
                    configure.errorCallBack ? configure.errorCallBack() : console.log("errorCallBack is undefined");
                }
                console.log("用户remove执行失败");
            });
        }
    }, {
        key: 'exeConfigureAdd',
        value: function exeConfigureAdd(inputval, newfile) {
            newfile.name = inputval;
            var parentFolder = null;
            var parentNode = newfile.getParentNode();
            if (parentNode) {
                parentNode._source.subdirectory.push(newfile._source);
                this.repairUpdirectory(parentNode);
                parentFolder = parentNode._source;
            }
            this.ztreeObj.updateNode(newfile);
            return { newfile: newfile, parentFolder: parentFolder };
        }
    }, {
        key: 'exeConfigureRename',
        value: function exeConfigureRename(inputval, oldsource, node) {
            node.name = inputval;
            var parentNode = node.getParentNode();
            var fileNode = node._source;
            if (parentNode) {
                var parentSubdirectory = parentNode._source.subdirectory;
                for (var i = 0; i < parentSubdirectory.length; i++) {
                    if (parentSubdirectory[i].id === oldsource.id) {
                        parentSubdirectory[i] = fileNode;
                        break;
                    }
                }
                this.repairUpdirectory(parentNode);
            }

            this.ztreeObj.updateNode(node);
            this.repairSubdirectory(node);
            //configure.rename && configure.rename(oldsource, node._source)
        }
    }, {
        key: 'repairUpdirectory',
        value: function repairUpdirectory(parentNode) {
            //更新上级目录的子目录
            //向上更改
            var upparentNode = parentNode.getParentNode();
            if (upparentNode) {
                upparentNode._source.subdirectory = parentNode._source;
                return this.repairUpdirectory(upparentNode);
            }
        }
    }, {
        key: 'repairSubdirectory',
        value: function repairSubdirectory(treeNode) {
            var _this9 = this;

            //向下更改 存在子文件的文件夹    
            if (treeNode.isParent && treeNode.check_Child_State === 0) {
                var children = treeNode.children;
                children.forEach(function (child) {
                    child.path = treeNode.path + '/' + child.name;
                    console.log(child.path);
                    child._source.filePath = child.path;
                    return _this9.repairSubdirectory(child);
                });
            }
        }
    }, {
        key: 'removeFilefromParent',
        value: function removeFilefromParent(node) {
            var parentNode = node.getParentNode();
            var fileNode = node._source;
            if (parentNode) {
                var parentSubdirectory = parentNode._source.subdirectory;
                for (var i = 0; i < parentSubdirectory.length; i++) {
                    if (parentSubdirectory[i].tId == fileNode.tId) {
                        parentSubdirectory.splice(i, 1);
                        break;
                    }
                }
                this.repairUpdirectory(parentNode);
            }
        }
    }, {
        key: 'checkName',
        value: function checkName(inputval, treeNode) {
            //重命名检查
            var reason = null;
            var parentNode = treeNode.getParentNode(); //父树节点
            if (inputval.length === 0) {
                //文件名为空
                reason = "文件名不能为空";
                return reason;
            } else {
                //文件名不为空
                if (parentNode && parentNode.check_Child_State === 0) {
                    //父节点存在且存在子节点
                    var children = parentNode.children; // 
                    children.forEach(function (item) {
                        if (item.tId !== treeNode.tId && item.name === inputval) {
                            reason = "文件名重复";
                            return reason;
                        }
                    });
                } else {
                    var nodes = this.ztreeObj.getNodes(); //根目录
                    nodes.forEach(function (item) {
                        if (item.tId !== treeNode.tId && item.name === inputval) {
                            reason = "文件名重复";
                            return reason;
                        }
                    });
                }
                return reason;
            }
        }
    }, {
        key: 'editName',
        value: function editName(node, cb) {
            var _this = this;
            var check; //输入检查标记，true:文件名不重复不为空，false：文件名为空或重复
            this.ztreeObj.cancelSelectedNode();
            (0, _jquery2.default)("#" + node.tId + "_span").html("<input type=text class='rename' id='renameInput' treeNodeinput/>");
            var inputObj = (0, _jquery2.default)("#renameInput");
            inputObj.click(function () {
                return false;
            });
            inputObj.attr("value", node.name);
            inputObj.focus();
            inputObj.select();
            inputObj.bind('input propertychange', function () {
                (0, _jquery2.default)("#input-warning").remove();
                var reason = _this.checkName((0, _jquery2.default)(this).val(), node); //null:文件名不重复不为空 string:"文件名不能为空"/"文件名重复"
                if (reason === null) {
                    check = true;
                } else {
                    var x = (0, _jquery2.default)('#' + node.tId + "_span").offset().left;
                    var y = (0, _jquery2.default)('#' + node.tId + "_span").offset().top;

                    (0, _jquery2.default)("<div id='input-warning'>" + reason + "</div>").css({
                        top: y + 18 + 'px',
                        left: x + "px"
                    }).appendTo('#' + node.tId + "_span"); //追加到body内
                    inputObj.focus();
                    check = false;
                }
            });
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
    }, {
        key: 'render',
        value: function render() {
            var _this10 = this;

            var id = this.props.id ? this.props.id : "filetree";
            var rMenustyle = {
                visibility: this.state.menuvisibility,
                top: this.state.menuY,
                left: this.state.menuX
            };
            return _react2.default.createElement(
                'div',
                { id: 'tree' },
                _react2.default.createElement('div', { id: id, className: 'ztree', ref: this.ztree }),
                _react2.default.createElement(
                    'div',
                    { id: 'rMenu', style: rMenustyle },
                    _react2.default.createElement(
                        'ul',
                        { className: 'menu' },
                        _react2.default.createElement(
                            'li',
                            { onClick: function onClick() {
                                    _this10.create(false);
                                }, className: 'item' },
                            '\u65B0\u5EFA\u6587\u4EF6'
                        ),
                        _react2.default.createElement(
                            'li',
                            { onClick: function onClick() {
                                    _this10.create(true);
                                }, className: 'item' },
                            '\u65B0\u5EFA\u6587\u4EF6\u5939'
                        ),
                        _react2.default.createElement(
                            'li',
                            { onClick: this.state.isOut ? null : function () {
                                    _this10.rename();
                                }, className: this.state.itemclassName },
                            '\u91CD\u547D\u540D'
                        ),
                        _react2.default.createElement(
                            'li',
                            { onClick: this.state.isOut ? null : function () {
                                    _this10.remove();
                                }, className: this.state.itemclassName },
                            '\u5220\u9664'
                        )
                    )
                )
            );
        }
    }]);

    return ReactZtree;
}(_react.PureComponent);

exports.default = ReactZtree;