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
        extend: true,
        subdirectory: [{
            filename: "pNode1 1",
            isFolder: true,
            extend: false,
            subdirectory: [{
                filename: "sNode11 1.js",
                isFolder: false
            }, {
                filename: "sNode11 2.html",
                isFolder: false
            }, {
                filename: "sNode11 3.css",
                isFolder: false
            }]
        }]
    }, {
        filename: "pNode0 2",
        isFolder: true,
        extend: false,
        subdirectory: []
    }, {
        filename: "sNode0 3.js",
        isFolder: false
    }];

    var configure = {
        error: false,
        errorCallBack: function errorCallBack() {
            console.log("error");
        },
        addFile: function addFile(parentFolder, newFile) {
            console.log("APP configure file _source", newFile);
            console.log("APP configure parentNode是：", parentFolder);

            return new Promise(function (resolve, reject) {

                var num = Math.round(Math.random() * 10);
                if (num % 2 === 0) {
                    console.log(num);
                    resolve();
                } else {
                    console.log(num);
                    reject();
                }
            });
        },
        addFolder: function addFolder(parentFolder, newFolder) {
            console.log("APP configure folder _source", newFolder);
            console.log("APP configure parentNode是：", parentFolder);

            return new Promise(function (resolve, reject) {
                var num = Math.round(Math.random() * 10);
                if (num % 2 === 0) {
                    console.log(num);
                    resolve();
                } else {
                    console.log(num);
                    reject();
                }
            });
        },
        rename: function rename(beforeFile, afterFile) {
            console.log("APP configure rename _source:", afterFile);
            console.log("APP configure rename oldsource", beforeFile);

            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    reject();
                }, 1000);
                // let num = Math.round(Math.random() * 10);
                // if (num % 2 === 0) {
                //   console.log(num);
                //   resolve();
                // } else {
                //   console.log(num);
                //   reject();
                // }
            });
        },
        remove: function remove(fileNode) {
            console.log("APP remove _source", fileNode);

            return new Promise(function (resolve, reject) {
                var num = Math.round(Math.random() * 10);
                if (num % 2 === 0) {
                    console.log(num);
                    resolve();
                } else {
                    console.log(num);
                    reject();
                }
            });
        },
        clickFile: function clickFile(fileNode) {
            console.log("APP clickFile _source", fileNode);

            return new Promise(function (resolve, reject) {
                var num = Math.round(Math.random() * 10);
                if (num % 2 === 0) {
                    console.log(num);
                    resolve();
                } else {
                    console.log(num);
                    reject();
                }
            });
        }
    };

    return React.createElement(
        "div",
        { className: "App" },
        React.createElement(_bztree2.default, {
            id: "treeDemo",
            configure: configure,
            filetree: filetree
        })
    );
} //import Ztree from './ztree/test/ztree1'
exports.default = App;