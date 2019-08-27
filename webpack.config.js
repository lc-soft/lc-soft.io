const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const wwwConfig = {
  mode: 'development',
  context: path.join(__dirname, 'app'),
  entry: {
    index: './www_index.js'
  },
  output: {
    path: path.join(__dirname, 'www/static/js/'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader' // creates style nodes from JS strings
          }, {
            loader: 'css-loader' // translates CSS into CommonJS
          }, {
            loader: 'sass-loader' // compiles Sass to CSS
          }
        ]
      },
      {
        test: /\.vue$/,
        use: 'vue-loader'
      }
    ]
  },
  externals: {
    vue: 'Vue'
  },
  plugins: [
    new VueLoaderPlugin()
  ]
};

const lcfinderConfig = {
  mode: 'production',
  context: path.join(__dirname, 'app'),
  entry: {
    index: './lcfinder_index.js'
  },
  output: {
    path: path.join(__dirname, 'lcfinder/static/js/'),
    filename: '[name].js'
  }
}

module.exports = [
  wwwConfig, lcfinderConfig
];
