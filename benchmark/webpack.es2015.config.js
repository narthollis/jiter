'use strict';

var path = require('path');
var HtmlWebpackPlugin = require('webpack-html-plugin');
var HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        main: ['./browser.js', './main.ts']
    },
    output: {
        path: 'dist/es2015',
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader'
                    }
                ],
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        modules: [
            '../node_modules'
        ]
    },
    externals: {
        benchmark: 'window.Benchmark'
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: '../node_modules/benchmark/benchmark.js', to: 'vendor/' }
        ]),
        new HtmlWebpackIncludeAssetsPlugin({
            assets: 'vendor/benchmark.js',
            append: true
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html'
        }),
    ]
};
