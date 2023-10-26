<!--
 * @Author: wangfs wangfs@jurassic.com.cn
 * @Date: 2023-10-23 08:48:26
 * @LastEditors: wangfs wangfs@jurassic.com.cn
 * @LastEditTime: 2023-10-26 20:50:14
 * @FilePath: \openlayer-demo2\src\components\tmap\tiMap.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div id="map">
    <button id="click_btn" @click="getSchool">{{ showSchool?'隐藏学校数据（聚合）':'显示学校数据（聚合）'}}</button>
      <button class="pd_btn" @click="getPBd">海上丝绸之路</button>
      <input type="file" class="file_btn" @change="changeFile"/>
  </div>
</template>

<script setup>
import tiandituMap from './tmap.js'
import { onMounted, getCurrentInstance, ref } from 'vue'
const { proxy: ctx } = getCurrentInstance()

let map = null
onMounted(() => {
  map = new tiandituMap()
  map.activeSelect()
})
// 聚合图（学校）
const showSchool = ref(false)
const getSchool = () => {
  showSchool.value = !showSchool.value
  if (showSchool.value) {
    map.activeEduLayer() 
  } else {
    map.disConnectEduLayer()
  }
}
// 省数据（ploygon）
const showPBd = ref(false)
const getPBd = () => {
  map.getProvinceBorder()
}
const changeFile = async (e) => {
  console.log(e.target.files[0])
  const buffer = await fileToBuffer(e.target.files[0]);
  map.paserShp(buffer)
}
const fileToBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsArrayBuffer(file);
  });
}

</script>

<style>
@import "ol/ol.css";

#map {
  position: relative;
  width: 100vw;
  height: 100vh;
  position: relative;
}

#click_btn {
  position: absolute;
  right: 0em;
  top: 0em;
  z-index: 2;
}
.pd_btn{
  position: absolute;
  right: 15em;
  top: 0em;
  z-index: 2;
}
.file_btn{
  position: absolute;
  right: 25em;
  top: 0em;
  z-index: 2;
}
</style>