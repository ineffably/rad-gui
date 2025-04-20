const webpack = require('webpack');
const path = require('path');
const outDir = 'lib';

module.exports = (env = {}, argv) => {
  const { mode = 'development' } = argv;
  
  let templatePath = 'index.html';
  if (env.template) {
    templatePath = env.template;
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
          use: ['style-loader', 'css-loader'],
        }
      ],
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    plugins: [
      // new HtmlWebpackPlugin({
      //   template: path.join(__dirname, templatePath),
      //   inject: true,
      //   scriptLoading: 'blocking'
      // }),
    ]
  }

  if (mode === 'development') {
    config.devtool = 'inline-source-map';
  }

  return config;
}