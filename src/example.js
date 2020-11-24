import Ztree from 'file-ztree'
function App() {
    const filetree = [
        {
            filename: "pNode0 1",
            isFolder: true,
            extend: true,
            subdirectory: [
                {
                    filename: "pNode1 1",
                    isFolder: true,
                    extend: false,
                    subdirectory: [
                        {
                            filename: "sNode11 1.js",
                            isFolder: false,
                        },
                        {
                            filename: "sNode11 2.html",
                            isFolder: false,
                        },
                        {
                            filename: "sNode11 3.css",
                            isFolder: false,
                        }
                    ]
                }
            ]
        },
        {
            filename: "pNode0 2",
            isFolder: true,
            extend: false,
            subdirectory: []
        },
        {
            filename: "sNode0 3.js",
            isFolder: false,
        }
    ]


    const configure = {
        error: false,
        errorCallBack: () => {
            console.log("error");
        },
        addFile: (parentFolder, newFile) => {
            console.log("APP configure file _source", newFile)
            console.log("APP configure parentNode是：", parentFolder)

            return new Promise((resolve, reject) => {

                let num = Math.round(Math.random() * 10);
                if (num % 2 === 0) {
                    console.log(num);
                    resolve();
                } else {
                    console.log(num);
                    reject();
                }
            })
        },
        addFolder: (parentFolder, newFolder) => {
            console.log("APP configure folder _source", newFolder)
            console.log("APP configure parentNode是：", parentFolder)

            return new Promise((resolve, reject) => {
                let num = Math.round(Math.random() * 10);
                if (num % 2 === 0) {
                    console.log(num);
                    resolve();
                } else {
                    console.log(num);
                    reject();
                }
            })
        },
        rename: (beforeFile, afterFile) => {
            console.log("APP configure rename _source:", afterFile)
            console.log("APP configure rename oldsource", beforeFile);

            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject()
                }, 1000)
                // let num = Math.round(Math.random() * 10);
                // if (num % 2 === 0) {
                //   console.log(num);
                //   resolve();
                // } else {
                //   console.log(num);
                //   reject();
                // }
            })
        },
        remove: (fileNode) => {
            console.log("APP remove _source", fileNode);

            return new Promise((resolve, reject) => {
                let num = Math.round(Math.random() * 10);
                if (num % 2 === 0) {
                    console.log(num);
                    resolve();
                } else {
                    console.log(num);
                    reject();
                }
            })
        },
        clickFile: (fileNode) => {
            console.log("APP clickFile _source", fileNode);

            return new Promise((resolve, reject) => {
                let num = Math.round(Math.random() * 10);
                if (num % 2 === 0) {
                    console.log(num);
                    resolve();
                } else {
                    console.log(num);
                    reject();
                }
            })
        }
    };

    return (
        <div className="App">
            <Ztree
                id="treeDemo"
                configure={configure}
                filetree={filetree}
            />
        </div>
    );
}

export default App;
