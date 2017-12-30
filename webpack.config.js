'use strict';

var webpack = require('webpack');

module.exports = {
  entry: './js/index.js',
  output: {
    path: __dirname,
    filename: './public/js/bundle.js'
  },
  context: __dirname,
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015']
        }
      }
    ]
  }
};
