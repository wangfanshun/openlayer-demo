<template>
  <div id="map"></div>
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
import { onMounted } from 'vue'
let map, extent, sliderControl, fullScreenControl, markLayer
const markerSource = new VectorSource()
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
  window.map=map
}
// 初始化extent控件
const initExtent = () => {
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
  const extentScope = [minX, minY, maxX, maxY];
  extent = new ZoomToExtent({
    label: '回武汉',
    extent: extentScope
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
const initCircle = () => {
  const point = new Feature({
    geometry: new Point(orCenter)
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
      id:'markLayer'
    })
    window.ly=markLayer
  }
  markerSource.addFeatures([point])
  map.addLayer(markLayer)
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
  window.map=map
}
const initClickEvent = () => {
  if (!map) return
  map.on('click', event => {
    const {coordinate, pixel } = event
    console.log(coordinate, pixel)
  })
}
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
onMounted(() => {
  initMap()
  initExtent()
  initSliderControl()
  initFullScreen()
  initCircle()
  initClickEvent()
  loadGeoJson(geojsonData)
  initSwitchButton()
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
</style>