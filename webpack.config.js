const merge = require('webpack-merge')

function mergeConfig(config) {
  return merge(config, {
    mode: process.env.NODE_ENV || 'development',
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-proposal-object-rest-spread']
            }
          }
        }
      ]
    }
  })
}

module.exports = [
  mergeConfig(require('./app/lcfinder/webpack.config')),
  mergeConfig(require('./app/www/webpack.config')),
  mergeConfig(require('./app/blog/webpack.config'))
];
