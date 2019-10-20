function mergeConfig(config) {
  return {
    ...config,
    mode: process.env.NODE_ENV || 'development',
    devtool: 'none'
  }
}

module.exports = [
  mergeConfig(require('./app/lcfinder/webpack.config')),
  mergeConfig(require('./app/www/webpack.config')),
  mergeConfig(require('./app/blog/webpack.config'))
];
