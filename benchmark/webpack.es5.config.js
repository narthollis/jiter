'use strict';

var path = require('path');
var HtmlWebpackPlugin = require('webpack-html-plugin');
var HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

const babelOptions = {
    "presets": [
        [
            "es2015",
            {
                "modules": false
            }
        ]
    ]
}

module.exports = {
    entry: {
        main: ['./browser.js','./main.ts'],
        vendor: [
            'babel-polyfill'
        ]
    },
    output: {
        path: path.resolve(__dirname, './dist/es5'),
        filename: '[name].js',
        chunkFilename: '[chunkhash].js'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: babelOptions
                    },
                    {
                        loader: 'ts-loader'
                    }
                ],
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
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
