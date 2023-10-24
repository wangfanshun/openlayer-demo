/*
 * @Author: wangfs wangfs@jurassic.com.cn
 * @Date: 2023-10-07 11:38:24
 * @LastEditors: wangfs wangfs@jurassic.com.cn
 * @LastEditTime: 2023-10-23 08:45:37
 * @FilePath: \openlayer-demo2\src\main.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import axios from 'axios'
const app = createApp(App).use(router)
app.config.globalProperties.$axios = axios
app.mount('#app')