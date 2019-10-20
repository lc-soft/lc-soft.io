const path = require('path')

const rootdir = path.resolve(__dirname, '../../')

module.exports = {
  context: rootdir,
  entry: {
    main: path.join(__dirname, 'index.js')
  },
  output: {
    path: path.join(rootdir, 'blog/static/js/'),
    filename: '[name].js'
  },
  externals: {
    jquery: 'jQuery'
  }
}
