<!--
 * @Author: wangfs wangfs@jurassic.com.cn
 * @Date: 2023-10-07 11:38:24
 * @LastEditors: wangfs wangfs@jurassic.com.cn
 * @LastEditTime: 2023-10-20 20:39:56
 * @FilePath: \openlayer-demo2\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="list_demo" >
    <button @click="changeFload">{{ fold ? '>>>' : '<<<' }}</button>
    <template v-if="fold">
     <router-link to="/map1">去基础交互</router-link>
    </template>
  </div>
  <router-view></router-view>
  <!-- <my-map></my-map> -->
</template>

<script setup>
import { onMounted, ref } from 'vue'
const fold = ref(false)
const changeFload = () => {
  fold.value = !fold.value
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
  position: relative;
}
.list_demo{
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  z-index: 999;
}
</style>
