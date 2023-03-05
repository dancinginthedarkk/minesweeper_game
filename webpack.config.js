const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    entry: './src/script.js',
    output: {
        path: path.resolve(__dirname, 'dist/'),
        filename: 'main.js',
        publicPath: '/',
    },
    module: {
        rules: [
            { test: /\.html$/i, use: 'html-loader'},
            { test: /\.css$/, use: ['style-loader', 'css-loader'] },
            { test: /\.(png|svg|jpg|jpeg|gif)$/, type: 'asset/resource', }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        })
    ]
};
