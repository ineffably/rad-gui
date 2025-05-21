const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleStatsWebpackPlugin } = require('bundle-stats-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const outDir = 'lib';

module.exports = (env = {}, argv) => {
  const { mode = 'development' } = argv;
  
  let templatePath = 'index.html';
  if (env.template) {
    templatePath = env.template;
  }

  const plugins = [
    new MiniCssExtractPlugin({
      filename: 'rad-gui.css'
    }),
    new webpack.DefinePlugin({
      CSS_CONTENT: JSON.stringify(require('fs').readFileSync(path.join(__dirname, 'src/rad-gui.css'), 'utf8'))
    })
  ];

  if (mode === 'development') {
    plugins.push(new BundleStatsWebpackPlugin());
    plugins.push(new HtmlWebpackPlugin({
      template: path.join(__dirname, templatePath)
    }));
  }

  const config = {
    mode,
    entry: './src/index.ts',
    output: {
      path: path.join(__dirname, outDir),
      filename: `index.js`,
      library: { name: 'rad-gui', type: 'umd' }
    },
    devServer: {
      port: 8888,
      static: {
        directory: path.join(__dirname, './'),
        publicPath: '/'
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?|.ts?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: [
            mode === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader'
          ],
        }
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
      alias: {
        'rad-gui/lib/rad-gui.css': path.resolve(__dirname, 'src/rad-gui.css')
      }
    },
    plugins 
  }

  if (mode === 'development') {
    config.devtool = 'inline-source-map';
  }

  return config;
}