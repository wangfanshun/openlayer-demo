/*
 * @Author: wangfs wangfs@jurassic.com.cn
 * @Date: 2023-10-07 11:38:24
 * @LastEditors: wangfs wangfs@jurassic.com.cn
 * @LastEditTime: 2023-10-26 20:59:03
 * @FilePath: \openlayer-demo2\vue.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { ProvidePlugin } = require('webpack');

module.exports = {
  configureWebpack: {
    resolve: {
      fallback: {
        buffer: require.resolve('buffer/'),
      },
    },
    plugins: [
      new ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
  },
}