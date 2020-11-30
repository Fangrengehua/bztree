const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');
module.exports = {
    mode:'development',
    entry: './src/ztree.js',
    output: {
        filename: 'ztree.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'file-tree',
        libraryTarget: 'umd'
    },
    externals: { 
        react: {
            root: "React",
            commonjs2: "react",
            commonjs: "react",
            amd: "react"
        },
        "react-dom": {
            root: "ReactDOM",
            commonjs2: "react-dom",
            commonjs: "react-dom",
            amd: "react-dom"
        },
        jquery: {
            root: "$",
            commonjs2: "jquery",
            commonjs: "jquery",
            amd: "jquery"
        }
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(png|jpg|gif)$/,
                loader:'url-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'imgs/',
                    limit: 8192
                }
            },
            {
                test: /\.svg$/i,
                use: {
                    loader: 'url-loader',
                    options: {
                        generator: (content) => svgToMiniDataURI(content.toString()),
                    },
                }
            },
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, 'src')
                ],
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                }
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: './src/css',
                    to: './css'
                }
            ],
        })
    ]
};