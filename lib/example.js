"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bztree = require("bztree");

var _bztree2 = _interopRequireDefault(_bztree);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function App() {

    var filetree = [{
        filename: "pNode0 1",
        isFolder: true,
        filePath: "",
        extend: true,
        subdirectory: [{
            filename: "pNode1 1",
            isFolder: true,
            filePath: "",
            extend: false,
            subdirectory: [{
                filename: "sNode11 1.js",
                isFolder: false,
                filePath: ""
                // extend: false,
                //subdirectory: []
            }, {
                filename: "sNode11 2.html",
                isFolder: false,
                filePath: ""
                // extend: false,
                //subdirectory: []
            }, {
                filename: "sNode11 3.css",
                isFolder: false,
                filePath: ""
                // extend: false,
                //subdirectory: []
            }]
        }]
    }, {
        filename: "pNode0 2",
        isFolder: true,
        filePath: "",
        extend: false,
        subdirectory: []
    }, {
        filename: "sNode0 3.js",
        isFolder: false,
        filePath: ""
        // extend:false,
        //subdirectory:[]
    }];

    var configure = {
        addFile: function addFile(parentFolder, newFile) {
            console.log("APP configure file _source", newFile);
            console.log("APP configure parentNode是：", parentFolder);
            // console.log("APP configure 新增file的name是：" + newfilename)
        },
        addFolder: function addFolder(parentFolder, newFolder) {
            console.log("APP configure folder _source", newFolder);
            console.log("APP configure parentNode是：", parentFolder);
            // console.log("APP configure 新增folder的name是：" + newfoldername)
        },
        rename: function rename(beforeFile, afterFile) {
            //修改文件路径node.path
            console.log("APP configure rename _source:", afterFile);
            console.log("APP configure rename oldsource", beforeFile);
            // console.log("APP configure old name:" + oldname)
        },
        remove: function remove(fileNode) {
            console.log("APP remove _source", fileNode);
        },
        clickFile: function clickFile(fileNode) {
            console.log("APP clickFile _source", fileNode);
        }
    };

    return React.createElement(
        "div",
        { className: "App" },
        React.createElement(_bztree2.default, {
            configure: configure,
            filetree: filetree
        })
    );
}

exports.default = App;