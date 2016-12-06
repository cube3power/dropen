'use strict';

var webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: './lib/bundle.js',
    libraryTarget: "umd"
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.js', '.json']
  },
  module: {
    loaders: [
      { test: /\.js$/,   exclude: /node_modules/, loader: 'babel-loader' },
      { test: /\.json$/, loader: 'json-loader' }
    ]
  },
  plugins: [
    // new webpack.optimize.UglifyJsPlugin()
  ]
};
