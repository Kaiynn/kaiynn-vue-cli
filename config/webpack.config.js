const path = require('path');
const { DefinePlugin } = require('webpack')
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const { VueLoaderPlugin } =  require('vue-loader')

const isProduction = process.env.NODE_ENV === 'production';

const getStyleLoader = (pre) => {
    return [
        isProduction ? MiniCssExtractPlugin.loader : 'vue-style-loader',
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
}

module.exports = {
    entry: './src/main.js',
    output: {
        path: isProduction ? path.resolve(__dirname, '../dist') : undefined,
        filename: isProduction ? 'static/js/[name].[contenthash:10].js' : 'static/js/[name].js',
        chunkFilename: isProduction ? 'static/js/[name].[contenthash:10].chunk.js' : 'static/js/[name].chunk.js',
        assetModuleFilename: 'static/media/[hash:10][ext][query]',
        clean: true,
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
                test: /\.(woff2?|ttf)$/,
                type: 'asset/resource'
            },
            {
                test: /\.js?$/,
                include: path.resolve(__dirname, '../src'),
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true,
                    cacheCompression: false,
                }
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
        isProduction && new MiniCssExtractPlugin({
            filename: 'static/css/[name].[contenthash:10].css',
            chunkFilename: 'static/css/[name].[contenthash:10].chunk.css',
        }),
        isProduction && new CopyPlugin({
            patterns: [
                { 
                    from: path.resolve(__dirname, '../public'), to: path.resolve(__dirname, '../dist'),
                    globOptions: {
                        ignore: ["**/index.html"],
                    },
                },
            ],
        }),
        new VueLoaderPlugin(),
        new DefinePlugin({
            __VUE_OPTIONS_API__: true,
            __VUE_PROD_DEVTOOLS__: false
        })
    ].filter(Boolean),
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                // vue vue-router
                vue: {
                    test: /[\\/]node_modules[\\/]vue(.*)[\\/]/,
                    name: 'chunk-vue',
                    priority: 30
                },
                // antd ui库
                // antd: {
                //     test: /[\\/]node_modules[\\/]antd[\\/]/,
                //     name: 'chunk-antd',
                //     priority: 20
                // },
                // 其他三方
                libs: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'chunk-libs',
                    priority: 10
                },
            }
        },
        runtimeChunk: {
            name: (entryPoint) => `runtime-${entryPoint.name}.js`
        },
        minimize: isProduction,
        minimizer: [
            new CssMinimizerWebpackPlugin(), 
            new TerserWebpackPlugin()
        ]
    },
    resolve: {
        extensions: ['.vue', '.js', '.json'],
        alias: {
            '@': path.resolve(__dirname, '../src')
        }
    },
    performance: false,
    devServer: {
        host: 'localhost',
        port: 3000,
        open: true,
        hot: true,
        // 解决前端路由404问题
        historyApiFallback: true
    }
}