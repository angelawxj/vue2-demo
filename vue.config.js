const path = require('path');

module.exports = {
  configureWebpack: {
    output: {
      libraryExport: 'default',
    },
  },
  css: {
    extract: false, // CSS 内联，确保样式生效
  },
  chainWebpack: (config) => {
    // 修复库模式下的公共 chunk 问题
    if (process.env.NODE_ENV === 'production') {
      config.optimization.delete('splitChunks');
    }
  },
};
