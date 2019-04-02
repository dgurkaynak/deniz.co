const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');


module.exports = {
  entry: './src/index.ts',
  devtool: 'source-map',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      inject: 'body',
      inlineSource: '.(js|css)$'
    }),
    new HtmlWebpackInlineSourcePlugin()
  ]
};
