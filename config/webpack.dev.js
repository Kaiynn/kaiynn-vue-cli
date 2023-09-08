const path = require('path');
const { DefinePlugin } = require('webpack')
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } =  require('vue-loader')

const getStyleLoader = (pre) => {
    let ceshi = [
        'vue-style-loader', 
        'css-loader',
        {
            // 处理css兼容
            // 配合package.json中的browserList来制定兼容性
            loader: 'postcss-loader',
            options: {
                postcssOptions: {
                    plugins: ['postcss-preset-env']
                }
            }
        },
        pre
    ].filter(Boolean)
    return ceshi
}

module.exports = {
    entry: './src/main.js',
    output: {
        path: undefined,
        filename: 'static/js/[name].js',
        chunkFilename: 'static/js/[name].chunk.js',
        assetModuleFilename: 'static/media/[hash:10][ext][query]',
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: getStyleLoader()
            },
            {
                test: /\.less$/,
                use: getStyleLoader('less-loader')
            },
            {
                test: /\.s[ac]ss$/,
                use: getStyleLoader('sass-loader')
            },
            {
                test: /\.(jpe?g|png|gif|webp|svg)$/,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 10*1024
                    }
                }
            },
            {
                test: /\.(woff2?|ttf)/,
                type: 'asset/resource'
            },
            {
                test: /\.js$/,
                include: path.resolve(__dirname, '../src'),
                use: [
                    // 多进程 考虑到启动进程的开销较大，小项目不开启
                    // {
                    //     loader: 'thread-loader',
                    //     options: {
                    //         works: threads
                    //     }
                    // },
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true,
                            cacheCompression: false,
                        }
                    }
                ]
            },
            {
                test: /.vue$/,
                loader: 'vue-loader',
                options: {
                    cacheDirectory: true,
                }
            }
        ]
    },
    plugins: [
        new ESLintPlugin({
            context: path.resolve(__dirname, '../src'),
            exclude: 'node_modules',
            cache: true,
            cacheLocation: path.resolve(__dirname, "../node_modules/.cache/.eslintcache"),
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../public/index.html')
        }),
        new VueLoaderPlugin(),
        // cross-env 定义的环境变量给打包工具使用的
        // DefinePlugin定义环境变量给源代码使用
        new DefinePlugin({
            __VUE_OPTIONS_API__: true,
            __VUE_PROD_DEVTOOLS__: false
        })
    ],
    mode: 'development',
    devtool: 'cheap-module-source-map',
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
        runtimeChunk: {
            name: (entryPoint) => `runtime-${entryPoint.name}.js`
        }
    },
    resolve: {
        // 自动补全扩展名
        extensions: ['.vue', '.js', '.json'],
        // 路径别名
        alias: {
            '@': path.resolve(__dirname, '../src')
        }
    },
    devServer: {
        host: 'localhost',
        port: 3000,
        open: true,
        hot: true,
        // 解决前端路由404问题
        historyApiFallback: true
    }
}