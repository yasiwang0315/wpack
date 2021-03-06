const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin"); // 必须加{}
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const Happypack = require("happypack");

module.exports = {
    mode: "development", // 两种模式：production和development，默认production
    // 单入口
    // entry: './src/index.js',
    // 多入口
    entry: {
        index: './src/index.js',
        other: './src/other.js'
    },
    // 对应多出口
    output: {
        // 单出口设置
        // filename: 'bundle-[hash:8].js',  // bundle-[hash].js 给文件名增加hash值,[hash:8]显示前8位
        // path: path.resolve(__dirname, 'dist'),
        // 多出口设置, [name]代表多入口变量名home,other，逐一打包
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        // publicPath: 'http://localhost',
        // publicPath: '/',
    },
    // 1）源码映射，单独生成一个sourcemap文件，出错时会直接提示报错行
    // devtool: 'source-map', // 大而全的设置
    // 2）源码映射，不会产生单独的文件，单会直接显示错误的行列
    // devtool: 'eval-source-map',
    // 3) 不会产生列，但是会生成一个单独的映射文件
    // devtool: 'cheap-module-source-map', // 产生后可以保留起来
    // 4) 不会产生文件，集成再打包后的文件中，也不会产生列
    devtool: 'cheap-module-source-map', // 产生后可以保留起来
    // 开启监控，实时打包设置
    watch: true,
    watchOptions:{ // 设置监控选项
        poll: 1000, // 每秒查询1000次
        aggregateTimeout: 500, // 防抖，ctrl+s后多久开始打包
        ignored: /node_modules/, // 忽略不需要监控的文件夹
    },
    resolve:{ // 解析第三方包
        modules:[path.resolve('node_modules')],
        extensions:['.js','.css','.json','.vue'], // 限定扩展名，按序依次解析
        mainFields:['style','main'], // 入口文件的名字 index.js
        alias:{ // 别名
            bootstrap:'bootstrap/dist/css/bootstrap.css'
        }
    },
    devServer: {
        hot:true,
        contentBase:"./dist", // 本地服务器路径
        inline:true, // 实时刷新开启
        // port: 3000, // 端口设置，本地默认8081
        progress: true, // 打包进度条开启
        // compress: true, // 启动压缩
        // open: true, // 自动打开浏览器
        // 配置代理
        // 1）方法一：与server.js配合
        // proxy:{
        //     '/api': {
        //         target: 'http://localhost:3000',
        //         pathRewrite: {'^/api':''}
        //     }
        // },
        // 2) 方法二：只模拟前端数据，不需要server.js
        // before(app){ // 提供方法，钩子
        //     app.get('/user',(req,res)=>{
        //         res.json({name:'Hanoso2020'})
        //     })
        // }
    },
    optimization: { // 优化项
        minimizer: [
            // 压缩js文件，使用css抽离压缩插件时，必须同时配置此项
            new TerserJSPlugin({}),
            // 压缩抽离后的css文件，此优化仅在production模式有效，development模式下不压缩
            new OptimizeCSSAssetsPlugin({})
        ],
        // splitChunks:{ // 分割代码块
        //     cacheGroups:{ // 缓存组
        //         common:{ // 抽离 公共的模块
        //             chunks:'initial',
        //             minSize:0, // 最小大小
        //             minChunks:2, // 最小出现次数
        //         },
        //         vendor:{ // 抽离 第三方模块
        //             priority:1, // 权重高，优先抽离第三方模块，再抽离其他
        //             test:/node_modules/, // 要抽离出的文件
        //             chunks: 'initial',
        //             minSize:0,
        //             minChunks:2
        //         }
        //     }
        // }
    },
    module: {
        noParse:/jquery/, // 排出不需要解析的包（没有其他依赖项的包）；
        rules: [
            // 从上到下、从右至左，顺序执行
            // 方法一：简单设置
            // { test: /\.css$/, use: ['style-loader', 'css-loader'] },
            // 方法二：丰富配置
            // { test: /\.(css|less)$/, use: [
            //     {
            //         loader: "style-loader",
            //         options: {} // 此处进行其他可选配置
            //     },
            //         'css-loader', // 解析@import路径
            //         'less-loader' // 把less解析为css
            //     ]
            // },
            // 方法三： 使用抽离
            // { test: /\.css$/, use: [
            //         MiniCssExtractPlugin.loader,
            //         'css-loader', // 解析@import路径
            //     ]
            // },
            // 优化：多线程打包css文件
            { test: /\.css$/, use: 'Happypack/loader?id=css' },
            { test: /\.less$/, use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader', // 解析@import路径
                    'less-loader' // 把less解析为css
                ]
            },
            { test: /\.(jpg|png|jpeg)$/, use: {
                loader: 'file-loader',
                options:{
                    esModule: false,
                    outputPath: '/img/',
                    // publicPath: 'htpp://localhost' // 为图片路径增加域名
                }
            } },
            { test: /\.html$/, use: {
                loader: 'html-loader',
                options: {
                    attrs: [':src', ':data-src'],
                    minimize:true
                }
            } },
            // { test: /\.html$/, use: 'html-withimg-loader' },
            // js语法转化
            {test: /\.js$/, 
                // exclude和include配置一个即可
                exclude:/node_modules/,  // 排除文件夹，不去该路径下查找
                // include:path.resolve('src'), // 指定文件夹，去该路径下查找
            // use: {
            //     loader: 'babel-loader',
            //     options: {
            //       presets: ['@babel/preset-env'],
            //       plugins: [
            //           // '@babel/plugin-proposal-object-rest-spread',
            //           ["@babel/plugin-proposal-decorators", { "legacy": true }],
            //           ["@babel/plugin-proposal-class-properties", { "loose" : true }]
            //         ]
            //     }
            // },
            // 使用happypack对js进行打包
            use: 'Happypack/loader?id=js'
            }
        ]
    },
    plugins: [
        new webpack.NamedModulesPlugin(), // 打印更新的模块路径
        new webpack.HotModuleReplacementPlugin(), // 热更新插件
        new Happypack({ // 多线程方式打包css文件
            id: 'css',
            use:['style-loader','css-loader']
        }),
        new Happypack({ // 多线程方式打包js文件
            id: 'js',
            use:[{
                loader: 'babel-loader',
                options:{
                    presets: [
                        '@babel/preset-env',
                        '@babel/preset-react'
                    ],
                }
            }]
        }),
        new webpack.IgnorePlugin(/\.\/locale/, /moment/), // 忽略moment插件中的locale模块
        new webpack.DefinePlugin({
            DEV:JSON.stringify('dev'), // 名称自定义
            // FLAG:'true',
            EXPRESSION:JSON.stringify('1+1')  // 不加JSON.stringify，会打印出1+1.加上则打印2，此处仅作演示
        }),
        new HtmlWebpackPlugin({
            template: "./index.html",
            filename: "index.html",
            chunks: ['index'], // 多页面打包设置，对应入口js
            minify: {
                removeAttributeQuotes: true, // 去除引号
                removeComments: true, // 去除注意
                removeEmptyAttributes: true,// 去除空属性
                collapseWhitespace: true // 去除空格
            },
            // 会在js文件名后增加hash值，例如bundle.js?08f9c052058b07e47a97。如output中已设置，此处可省略
            // hash: true
        }),
        // 多页面打包，多个new
        new HtmlWebpackPlugin({
            template: "./other.html",
            filename: "other.html",
            chunks: ['other', 'index'], // 多页面打包设置，对应入口js, 先引入home再other
            minify: {
                removeAttributeQuotes: true, // 去除引号
                removeComments: true, // 去除注意
                removeEmptyAttributes: true,// 去除空属性
                collapseWhitespace: true // 去除空格
            },
            // 会在js文件名后增加hash值，例如bundle.js?08f9c052058b07e47a97。如output中已设置，此处可省略
            // hash: true
        }),
        new MiniCssExtractPlugin({
            filename: "css/main.css", // css抽离为main.css文件中
        }),
        new CleanWebpackPlugin(), // 先删除dist目录再打包
        new CopyWebpackPlugin([
            {from:'doc', to:'./'}
        ]),
        new webpack.BannerPlugin("Make 2019 by Hanoso"), // 声明版权信息
    ]
};