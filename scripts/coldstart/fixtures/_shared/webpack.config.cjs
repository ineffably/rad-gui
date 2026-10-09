// The webpack setup a stranger would write for an app that imports CSS.
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  entry: process.env.COLDSTART_ENTRY || './index.js',
  output: { path: path.resolve(__dirname, 'dist-webpack'), filename: 'main.js', clean: true },
  module: {
    rules: [{ test: /\.css$/i, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
  },
  plugins: [new MiniCssExtractPlugin({ filename: 'main.css' })]
};
