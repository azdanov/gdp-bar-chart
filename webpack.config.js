const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const ENV = process.env.NODE_ENV

let plugins = [
  new CleanWebpackPlugin(['dist'], { verbose: ENV !== 'production' }),
  new HtmlWebpackPlugin({
    template: './src/index.html',
    inject: 'body',
    hash: true
  })
]

if (ENV === 'production') {
  plugins = [
    ...plugins,
    new ExtractTextPlugin({
      filename: '[name].[hash].css'
    })
  ]
} else {
  // Might be needed for HMR - html-webpack-harddisk-plugin
  plugins = [
    ...plugins,
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ]
}

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
    filename: '[name].[hash].js',
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
          ENV === 'production'
            ? ExtractTextPlugin.extract({
              fallback: 'style-loader',
              use: ['css-loader']
            })
            : ['style-loader', 'css-loader']
      }
    ]
  },
  devtool: ENV === 'production' ? 'source-map' : 'cheap-eval-source-map',
  plugins: plugins,
  resolve: {
    extensions: ['*', '.js']
  }
}
