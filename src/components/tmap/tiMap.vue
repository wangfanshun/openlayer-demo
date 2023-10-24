<!--
 * @Author: wangfs wangfs@jurassic.com.cn
 * @Date: 2023-10-23 08:48:26
 * @LastEditors: wangfs wangfs@jurassic.com.cn
 * @LastEditTime: 2023-10-24 16:36:57
 * @FilePath: \openlayer-demo2\src\components\tmap\tiMap.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div id="map">
    <button id="click_btn" @click="clickEvent">1112</button>
  </div>
</template>

<script setup>
import tiandituMap from './tmap.js'
import { onMounted, getCurrentInstance } from 'vue'
const { proxy: ctx } = getCurrentInstance()

let map = null
const clickEvent = () => {
  const bd = map.getBoundary()
  const zoomLevel = map.map.getView().getZoom()
  ctx.$axios({
    method: 'get',
    url: 'https://zhfw.tianditu.gov.cn/zhfw/adminsearch',
    params: {
      postStr: JSON.stringify({ "keyWord": "幼儿园", "level": parseInt(zoomLevel) + '', "mapBound": bd.join(','), "count": "500", "start": "0", "queryTerminal": "10000", "caseType": "2", "queryType": "2", "type": "query" })
    }
  })
}
onMounted(() => {
  map = new tiandituMap()
  map.activeSelect()
})
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
</style>