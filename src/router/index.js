/*
 * @Author: wangfs wangfs@jurassic.com.cn
 * @Date: 2023-10-20 20:09:41
 * @LastEditors: wangfs wangfs@jurassic.com.cn
 * @LastEditTime: 2023-10-23 09:03:36
 * @FilePath: \openlayer-demo2\src\router\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/*
 * @Author: wangfs wangfs@jurassic.com.cn
 * @Date: 2023-10-20 20:09:41
 * @LastEditors: wangfs wangfs@jurassic.com.cn
 * @LastEditTime: 2023-10-23 08:47:51
 * @FilePath: \openlayer-demo2\src\router\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/map1' },
    { path: '/map1', component: import('@/components/MyMap.vue') },
    { path: '/map2', component: import('@/components/tmap/tiMap.vue') }
  ]
})

export default router