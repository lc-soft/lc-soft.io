var path = require('path');
var webpack = require('webpack');

var wwwConfig = {
  context: path.join(__dirname, 'app'),
  entry: {
    index: './www_index.js',
    common: './common.js'
  },
  output: {
    path: './www/static/js/',
    filename: '[name].js'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ],
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      }, {
        // edit this for additional asset file types
        test: /\.(png|jpg|gif)$/,
        loader: 'file?name=[name].[ext]?[hash]'
      }
    ]
  },
  // example: if you wish to apply custom babel options
  // instead of using vue-loader's default:
  babel: {
    presets: ['es2015', 'stage-0'],
    plugins: ['transform-runtime']
  }
};

var lcfinderConfig = {
  context: path.join(__dirname, 'app'),
  entry: {
    index: './lcfinder_index.js'
  },
  output: {
    path: './lcfinder/static/js/',
    filename: '[name].js'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]
}

module.exports = [
  wwwConfig, lcfinderConfig
];
