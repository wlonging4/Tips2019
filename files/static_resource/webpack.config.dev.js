const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
const cleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const pageConfig = require('./page.config.js');
const ip = require("ip");
let webpackConfig = {
    entry: {
        'common':['babel-polyfill', "./dev/app/common/js/common.js"],
        'refresh':[ "./dev/app/common/js/refresh.js"],
        'iosSelect':[ "./dev/app/common/js/iosSelect.js"],
    },
    output: {
        path: path.resolve(__dirname, './h5static/app'),
        filename:"js/[name].js",
        chunkFilename:"chunk/[name].chunk.js",
        publicPath: ''
    },
    devServer: {
        contentBase: path.resolve(__dirname, './dev'),
        compress: true,
        host:ip.address(),
        port:9998,
        open:true,
        publicPath:'/',
        historyApiFallback:true,
        proxy: {
            "/webapi": {
                target: "http://10.143.143.103",
                // target: "http://10.143.143.191",
                // target: "http://10.10.56.108:80",
                // pathRewrite: {"^/webapi" : ""}
            }
        }
    },
    resolve: {
        extensions: ['.js', '.css', '.less'],
        modules: [
            "node_modules"
        ],
        alias:{
            "COMMON":path.resolve("dev/app/common")
        }
    },
    module: {
        rules: [
            {
                test: /\.js?$/,
                include: path.resolve(__dirname, 'dev'),
                exclude: path.resolve(__dirname, 'node_modules'),
                use: [{
                    loader: 'babel-loader'
                }]
            },
            {
                test: /\.less$/,
                oneOf: [{
                    resourceQuery: /link/,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            name: 'css/[name].css',
                            // outputPath: 'css',
                            // publicPath:"../"
                        }
                    }, {
                        loader: "extract-loader",
                        options: {
                            publicPath: "../",
                        }
                    },{
                        loader: "css-loader"
                    },{
                        loader: 'postcss-loader',
                        options: {
                            plugins: [
                                require('autoprefixer')({
                                    browsers: [ "iOS >= 4","Firefox >= 20","Android > 2.3"]
                                })
                            ]
                        }
                    },{
                        loader: "less-loader"
                    }]
                },{
                    use: ExtractTextPlugin.extract({
                        fallback: "style-loader",
                        use: ["css-loader",{
                            loader: 'postcss-loader',
                            options: {
                                plugins: [
                                    require('autoprefixer')({
                                        browsers: [ "iOS >= 4","Firefox >= 20","Android > 2.3"]
                                    })
                                ]
                            }
                        }, "less-loader"],
                        publicPath:'../'
                    })
                }]
            },
            {
                test: /\.css$/,
                oneOf: [{
                    resourceQuery: /link/,
                    use: [{
                            loader: 'file-loader',
                            options: {
                                name: 'css/[name].css',
                                // outputPath: 'css',
                                // publicPath:"../"
                            }
                        }, {
                        loader: "extract-loader",
                        options: {
                            publicPath: "../",
                        }
                    },{
                        loader: "css-loader"
                    },{
                        loader: 'postcss-loader',
                        options: {
                            plugins: [
                                require('autoprefixer')({
                                    browsers: [ "iOS >= 4","Firefox >= 20","Android > 2.3"]
                                })
                            ]
                        }
                    }]
                },{
                    use: ExtractTextPlugin.extract({
                        fallback: "style-loader",
                        use: ["css-loader",{
                            loader: 'postcss-loader',
                            options: {
                                plugins: [
                                    require('autoprefixer')({
                                        browsers: [ "iOS >= 4","Firefox >= 20","Android > 2.3"]
                                    })
                                ]
                            }
                        }],
                        publicPath:'../'
                    })
                }]

            },
            {
                test: /\.(png|jpe?g|gif|ico)$/,
                use:[{
                    loader: 'file-loader?',
                    options: {
                        outputPath:'',
                        name: 'images/[name].[hash:8].[ext]',
                        publicPath:""
                    }
                }
                ]
            },
            {
                test: /\.(svg|woff|woff2|ttf|eot)$/,
                use:[{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath:"fonts/",
                        publicPath:"../fonts"
                    }
                }
                ]
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin({
            filename: 'css/[name].css',
            allChunks: true
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: "common",
            filename: "js/commons.js"
        }),
        // new cleanWebpackPlugin(['h5static/app']),

    ]

};
if(pageConfig && Array.isArray(pageConfig)){
    pageConfig.map(page => {
        if(page.jsEntry && page.jsEntry.length > 0){
            webpackConfig.entry[page.name] = page.jsEntry.map((item) => {
                return path.join(__dirname, `/dev/${item}`);
            });
            page.chunks.push(page.name);
        }
        webpackConfig.plugins.push(new htmlWebpackPlugin({
            filename: path.join(`${page.name}.html`),
            template: path.join(__dirname, `/dev/${page.html}`),
            inject: true,
            chunks:page.chunks,
            chunksSortMode: 'manual'
        }))
    })
}
module.exports = webpackConfig;