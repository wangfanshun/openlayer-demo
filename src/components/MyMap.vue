<template>
  <div id="map">
  </div>
  <button class="switch_rain" @click="closeRain">关闭局部雨滴</button>
    <button class="switch_webgl" @click="closeRain">webgl渲染的雨滴</button>
</template>

<script setup>
import geojsonData from './data.json'
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import ZoomToExtent from 'ol/control/ZoomToExtent.js'
import ZoomSlider from 'ol/control/ZoomSlider.js';
import FullScreen from 'ol/control/FullScreen.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import Text from 'ol/style/Text.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import Control from 'ol/control/Control.js';
import { Circle, Fill, Stroke, Style } from 'ol/style.js';
import Icon from 'ol/style/Icon.js';
import rainUrl from '@/assets/rain.png'
import { onMounted } from 'vue'
let map, extent, sliderControl, fullScreenControl, markLayer, markerSource, rainLayer, rainSource, orScope
const orZoom = 12
const orCenter = [114.30, 30.50]
const blackMap= new TileLayer({
  source: new XYZ({
    url: 'https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'
  }),
  visible:false
})
const regularMap= new TileLayer({
  source: new XYZ({
    url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
  }),
  visible: true,
})
// 初始化地图
const initMap = () => {
  map = new Map({
    target: 'map',
    layers: [
      blackMap,
      regularMap
    ],
    view: new View({
      center: orCenter,
      zoom: orZoom,
      projection: 'EPSG:4326'
    })
  })
  //获取再zoomlevel等于12时候的分辨率（即每个像素点的长度）
  const resolution = map.getView().getResolutionForZoom(orZoom)
  //获取当前视图的像素大小
  const width = map.getSize()[0] * resolution;
  const height = map.getSize()[1] * resolution;
  //计算出中心点为武汉时候的四个角的坐标
  const minX = orCenter[0] - width / 2;
  const minY = orCenter[1] - height / 2;
  const maxX = orCenter[0] + width / 2;
  const maxY = orCenter[1] + height / 2;
  // 构建范围对象
  orScope = [minX, minY, maxX, maxY];
  markerSource = new VectorSource()
  rainSource = new VectorSource()
  markLayer = new VectorLayer({
    source: markerSource,
    minZoom: 11,
    maxZoom: 13,
    id: 'markLayer'
  })
  rainLayer = new VectorLayer({
    source: rainSource,
    opacity: 0.5,
    className: 'rain_mask',
    visible:false
  })
  map.addLayer(rainLayer)
  map.addLayer(markLayer)
}
// 初始化extent控件
const initExtent = () => {
  extent = new ZoomToExtent({
    label: '回武汉',
    extent: orScope
  })
  map && map.addControl(extent)
}
// 初始化全屏空间
const initFullScreen = () => {
  fullScreenControl = new FullScreen()
  map&&map.addControl(fullScreenControl)
}
// 初始化滑块
const initSliderControl = () => {
  sliderControl = new ZoomSlider()
  map && map.addControl(sliderControl)
}
// 初始化圆点
const initCircle = (cor) => {
  const point = new Feature({
    geometry: new Point(cor)
  })
  const style = new Style({
    image: new Circle({
      radius: 10,
      fill: new Fill({
        color: "#ff2d51"
      }),
      stroke: new Stroke({
        color: "#333",
        width: 2
      })
    }),
    text: new Text({
      text: '通过坐标设置的点',
      offsetY:-15
    })
  })
  point.setStyle(style)
  markerSource.addFeature(point)
}

const loadGeoJson = (data) => {
  const geoJsonReader = new GeoJSON()
  const features = geoJsonReader.readFeatures(data)
  if (!markLayer) {
    markLayer = new VectorLayer({
      source: markerSource,
      minZoom: 11,
      maxZoom: 13,
      style: new Style({
        fill: new Fill({
          color: "#ff2d51"
        })
      }),
      id: 'markLayer'
    })
    window.ly = markLayer
  }
  features.every(f => {
     f.setStyle(new Style({
      image: new Circle({
        radius: 10,
        fill: new Fill({
          color: "#ff2d51"
        }),
        stroke: new Stroke({
          color: "#333",
          width: 2
        })
      }),
      text: new Text({
        text: '通过geoJson设置的点',
        offsetY: -15
      })
    })) 
  })
  markerSource.addFeatures(features)
}
// 点击地图
const initClickEvent = () => {
  if (!map) return
  map.on('click', event => {
    const {coordinate } = event
    initCircle(coordinate)
    map.getView().animate({
      center: coordinate
    })
  })
}
// 切换底图
const initSwitchButton = () => {
  const button = document.createElement('button')
  button.innerHTML='切换底图'
  button.classList.add('switch_button')
  const switchButton=new Control({
    element: button
  })
  button.addEventListener('click', (e) => {
    const layers = map.getAllLayers()
    layers.forEach(l => {
      if (l instanceof TileLayer) {
        const v=l.getVisible()
        l.setVisible(!v)
      }
    })
  })
  map && map.addControl(switchButton)
}

const initRainSymbol = (cor) => {
  const point = new Feature({
    geometry: new Point(cor)
  })
  const style = new Style({
    image: new Icon({
      src: rainUrl,
      width: 5,
      height: 5
    }),
  })
  point.setStyle(style)
  return point
}
let dis = []
const points = []
const cord=[]
// 初始划下雨~
const initRain = () => {
  const count = 500
  for (let i = 0; i < count; i++){
    let x = (Math.random() * (orScope[2] - orScope[0])) + orScope[0]
    let y = (Math.random() * (orScope[3] - orScope[1])) + orScope[1]
    cord.push([x,y])
    let p = initRainSymbol([x, y])
    dis.push(y - orScope[1])
    points.push(p)
  }
  rainSource.addFeatures(points)
  const fea = rainSource.getFeatures()
  window.ge=fea[0]
}


const time = new Array(500).fill(0)
// 雨滴下落
const rainFall = () => {
  const fea = rainSource.getFeatures()
  fea.forEach((f, i) => {
    if (time[i] > dis[i]) {
      time[i] = 0
      f.getGeometry().setCoordinates(cord[i])
    } else {
      time[i] += 0.002
      f.getGeometry().translate(0, -0.002)
    }
  })
  requestAnimationFrame(rainFall)
}
// 关闭雨图层
const closeRain = () => {
  console.log(1234)
  const v = rainLayer.getVisible()
  rainLayer.setVisible(!v)
}
onMounted(() => {
  initMap()
  initExtent()
  initSliderControl()
  initFullScreen()
  initClickEvent()
  loadGeoJson(geojsonData)
  initSwitchButton()
  initRain()
  rainFall()
})
</script>

<style>
@import "ol/ol.css";
#map{
  width: 100vw;
  height: 100vh;
  position: relative;
}
.ol-zoom-extent>button{
  /* background-color: red; */
  height: fit-content;
}
.ol-zoomslider{
  top:9.5em;
  background-color: rgba(0, 0, 0, 0.5);
}
.ol-full-screen{
  right: 2.5em;
}
.switch_button{
  position: absolute;
  right: 5.5em;
  top:0.5em
}
.rain_mask{
  background-color: rgba(0, 0, 0, 0.5);
}
.switch_rain{
  position: absolute;
  right: 11.5em;
  top:1.5em
}
.switch_webgl{
  position: absolute;
  right: 20.5em;
  top:1.5em
}
</style>