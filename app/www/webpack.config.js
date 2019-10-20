const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const rootdir = path.resolve(__dirname, '../../')

module.exports = {
  context: rootdir,
  entry: {
    main: path.join(__dirname, 'index.js')
  },
  output: {
    path: path.join(rootdir, 'www/static/js/'),
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
    vue: 'Vue',
    jquery: 'jQuery'
  },
  plugins: [
    new VueLoaderPlugin()
  ]
};
