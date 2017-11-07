const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const env = process.env.NODE_ENV

const plugins = [
  new CleanWebpackPlugin(['dist']),
  new HtmlWebpackPlugin({
    template: './src/index.html',
    inject: 'body'
  }),
  new webpack.NamedModulesPlugin(),
  new webpack.HotModuleReplacementPlugin()
]

module.exports = {
  entry: {
    bundle: ['./src/js/index.js']
  },
  devServer: {
    contentBase: './dist',
    hot: false,
    open: true
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use:
          env === 'production'
            ? ExtractTextPlugin.extract({
              fallback: 'style-loader',
              use: ['css-loader']
            })
            : ['style-loader', 'css-loader']
      }
    ]
  },
  stats: 'minimal',
  devtool: env === 'production' ? 'source-map' : 'cheap-eval-source-map',
  plugins:
    env === 'production'
      ? [
        ...plugins,
        new ExtractTextPlugin({
          filename: '[name].css'
        })
      ]
      : plugins,
  resolve: {
    extensions: ['*', '.js']
  }
}
