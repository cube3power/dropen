'use strict';

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
      { test: /\.js$/,   exclude: /node_modules/, loader: 'babel' },
      { test: /\.json$/, loader: 'json'  }
    ]
  }
};
