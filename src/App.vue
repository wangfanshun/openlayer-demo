<!--
 * @Author: wangfs wangfs@jurassic.com.cn
 * @Date: 2023-10-07 11:38:24
 * @LastEditors: wangfs wangfs@jurassic.com.cn
 * @LastEditTime: 2023-10-09 10:59:44
 * @FilePath: \openlayer-demo2\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <my-map></my-map>
</template>

<script>
import MyMap from './components/MyMap.vue'

export default {
  name: 'App',
  components: {
    MyMap
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* margin-top: 60px; */
}
body{
  margin: 0px;
}
</style>
