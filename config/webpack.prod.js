const path = require('path');
const { DefinePlugin } = require('webpack')
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const { VueLoaderPlugin } =  require('vue-loader')

const getStyleLoader = (pre) => {
    return [
        MiniCssExtractPlugin.loader,
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
        path: path.resolve(__dirname, '../dist'),
        filename: 'static/js/[name].[contenthash:10].js',
        chunkFilename: 'static/js/[name].[contenthash:10].chunk.js',
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
        new MiniCssExtractPlugin({
            filename: 'static/css/[name].[contenthash:10].css',
            chunkFilename: 'static/css/[name].[contenthash:10].chunk.css',
        }),
        new CopyPlugin({
            patterns: [
                { 
                    from: path.resolve(__dirname, '../public'), to: path.resolve(__dirname, '../dist'),
                    globOptions: {
                        ignore: ["**/index.html"],
                    },
                },
            ],
        }),
        // 预加载，针对懒加载优化 存在兼容性问题 @vue/preload-webpack-plugin
        // new PreloadWebpackPlugin({
        //     rel: 'preload',
        //     as: 'script'
        // }),
        new VueLoaderPlugin(),
        new DefinePlugin({
            __VUE_OPTIONS_API__: true,
            __VUE_PROD_DEVTOOLS__: false
        })
    ],
    mode: 'production',
    devtool: 'source-map',
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
        runtimeChunk: {
            name: (entryPoint) => `runtime-${entryPoint.name}.js`
        },
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
    // 关闭性能分析提升打包速度
    performance: false
}