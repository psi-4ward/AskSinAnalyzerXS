const path = require('path');

module.exports = {
  outputDir: path.resolve(__dirname, '../htdocs'),

  filenameHashing: true,

  pluginOptions: {
    quasar: {
      treeShake: true,
      importStrategy: 'kebab'
    }
  },

  transpileDependencies: [
    /[\\\/]node_modules[\\\/]quasar[\\\/]/
  ],

  devServer: {
    proxy: {
      '/ws': {
        target:'http://localhost:3000',
        ws: true
      }
    }
  },

  chainWebpack: config => {
    config.resolve.alias
      .set('@components', path.join(__dirname, 'src/components'));
  }
};
