<template>
  <div id="map">
    <button class="switch_rain" @click="closeRain">关闭局部雨滴</button>
    <button class="switch_webgl" @click="closeRain">webgl渲染的雨滴</button>
    <button class="toBeijing" @click="toBeijing">北京（旋转）</button>
    <button class="toBeijing_f" @click="flexbeijing">北京（弹性）</button>
    <button class="m_length" @click="changMMode('length')">测距离</button>
    <button class="m_area" @click="changMMode('area')">测面积</button>
    <button class="edit_button" @click="enableEdit">{{ activeEdit?'取消编辑':'编辑测量的图形' }}</button>
    <span class="tips">alt+移动可查看底部图层</span>
    <div id="mouse_position"></div>
  </div>
  <div id="tiny_map_container"></div>
  <div id="scale_container"></div>
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
import Polygon from 'ol/geom/Polygon.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import Text from 'ol/style/Text.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import Control from 'ol/control/Control.js';
import { Circle, Fill, Stroke, Style } from 'ol/style.js';
import Icon from 'ol/style/Icon.js';
import rainUrl from '@/assets/rain.png'
import MousePosition from 'ol/control/MousePosition.js';
import OverviewMap from 'ol/control/OverviewMap.js';
import * as olProj from 'ol/proj';
import * as olEasing from 'ol/easing';
import Draw from 'ol/interaction/Draw.js';
import { unByKey } from 'ol/Observable.js';
import Overlay from 'ol/Overlay.js';
import { getLength, getArea } from 'ol/sphere';
import ScaleLine from 'ol/control/ScaleLine.js';
import Select from 'ol/interaction/Select.js'
import Modifier from './modify'
import { onMounted, ref } from 'vue'
let map, tinyMap, extent, sliderControl, fullScreenControl, markLayer, markerSource, rainLayer, rainSource, orScope, tinyMapScopeLayer
let dragging = false
let mousePosition = []
let startX, startY
let circleInfo = []
const orZoom = 5
const orCenter = [114.30, 30.50]
const imageMap = new TileLayer({
  source: new XYZ({
    url: 'https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'
  }),
  visible: false,
})
const regularMap = new TileLayer({
  source: new XYZ({
    url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
  }),
  visible: true,
  id: 'regularMap'
})
const tinyMapExent = new Feature({
  geometry: new Polygon([[]])
})
tinyMapExent.setStyle(new Style({
  fill: new Fill({
    color: "rgba(0, 0, 0, 0)"
  }),
  stroke: new Stroke({
    color: 'rgba(0, 0, 0, 0)', // 设置边框颜色和透明度
    width: 2
  })
}))
let modifier
const drawSource = new VectorSource()
const drawLayer = new VectorLayer({
  source: drawSource
})
// 初始化地图
const initMap = () => {
  const mousInfoControl = new MousePosition({
    coordinateFormat: (e) => {
      return `经度：${e[0].toFixed(2)},纬度：${e[0].toFixed(2)}`
    },
    target: document.getElementById('mouse_position'),
    className: 'info_style'
  })
  const selector= new Select()
  const scaleControl = new ScaleLine({
    target: document.getElementById('scale_container'),
    unit: 'metric'
  })
  const overViewControl = new OverviewMap({
    collapsed: true,
    className: 'tiny_map',
    label: '折叠',
    collapsible: true,
    collapseLabel: '展开',
    target: document.getElementById('tiny_map_container'),
    layers: [new TileLayer({
      source: new XYZ({
        url: 'https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'
      })
    })]
  })
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
    visible: false
  })
  tinyMapScopeLayer = new VectorLayer({
    source: new VectorSource({
      features: [tinyMapExent]
    }),
    visible: true,
    id: 'tt_layer',
    zIndex: 999999
  })
  map = new Map({
    target: 'map',
    layers: [
      regularMap,
      imageMap,
      rainLayer,
      tinyMapScopeLayer,
      markLayer,
      drawLayer
    ],
    view: new View({
      center: orCenter,
      zoom: orZoom,
      projection: 'EPSG:4326'
    }),
    controls: [mousInfoControl, overViewControl, scaleControl]
  })
  modifier = new Modifier(map, drawSource)
  map.addInteraction(selector)
  window.sel = selector
  window.mp = map
  const container = document.getElementById('map')
  container.addEventListener('mousemove', (e) => {
    if (e.altKey) {
      mousePosition = map.getEventPixel(e)
      imageMap.setVisible(true)
      map.render()
    } else {
      imageMap.setVisible(false)
      map.render()
    }
  })
  container.addEventListener('keyup', (e) => {
    imageMap.setVisible(false)
    map.render()
  })
  imageMap.on('prerender', (event) => {
    const ctx = event.context
    ctx.save() // 保存
    ctx.beginPath()
    if (mousePosition) {
      ctx.arc(mousePosition[0], mousePosition[1], 100, 0, 2 * Math.PI)
      ctx.lineWidth = (5 * 10) / 10
      ctx.strokeStyle = 'rgba(0,0,0,0.5)'
      ctx.stroke()
    }
    // 使用裁剪 只加载 圆内数据
    ctx.clip()
  })
  imageMap.on('postrender', (event) => {
    const ctx = event.context
    ctx.restore()
  })
  orScope = getMapBoundary(map, 12, orCenter)
}
const activeEdit = ref(false)
const enableEdit = () => {
  activeEdit.value = !activeEdit.value
  modifier.setActive(activeEdit.value)
}
// 获取指定级别的底图编辑的坐标值
const getMapBoundary = (map, zoom, center) => {
  //获取再zoomlevel等于12时候的分辨率（即每个像素点的长度）
  const resolution = map.getView().getResolutionForZoom(zoom)
  //获取当前视图的像素大小
  const width = map.getSize()[0] * resolution;
  const height = map.getSize()[1] * resolution;
  //计算出中心点为武汉时候的四个角的坐标
  const minX = center[0] - width / 2;
  const minY = center[1] - height / 2;
  const maxX = center[0] + width / 2;
  const maxY = center[1] + height / 2;
  // 构建范围对象
  return [minX, minY, maxX, maxY];
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
  map && map.addControl(fullScreenControl)
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
      offsetY: -15
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
let mode=null
const changMMode = (type) => {
  mode = type
}
// 点击地图
const initClickEvent = () => {
  let listener, line, length, measureTooltipElement, tooltipCoord, measureTooltip
  let draw = new Draw({
    type: 'LineString',
    source: drawSource
  })
  const createMeasureTooltip = () => {
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
    measureTooltip = new Overlay({
      element: measureTooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center',
      stopEvent: false,
      insertFirst: false,
    });
    map.addOverlay(measureTooltip);
  }
  const measure = (e) => {
    line = e.feature.getGeometry()
    listener = line.on('change', (event) => {
      window.ee = event
      tooltipCoord = event.target.getLastCoordinate()
      if (mode === 'length') {
        length = getLength(line, { projection: 'EPSG:4326' })
      } else {
        length = getArea(line, { projection: 'EPSG:4326' })
      }
      const unit = mode === 'length' ? 'km' : 'km<sup>2</sup>'
      const tansfer = mode === 'length' ? 1000 : 1000000
      measureTooltipElement.innerHTML = (length / tansfer).toFixed(2) + unit
      measureTooltip.setPosition(tooltipCoord);
    })
  }
  draw.on('drawstart', (e) => {
    createMeasureTooltip()
    measure(e)
  })
  draw.on('drawend', (e) => {
    unByKey(listener)
    createMeasureTooltip();
    draw.setActive(false)
    mode = null
  })
  draw.setActive(false)
  map.addInteraction(draw)
  let draw2 = new Draw({
    type: 'Polygon',
    source: drawSource
  })
  draw2.on('drawstart', (e) => {
    createMeasureTooltip()
    measure(e)
  })
  draw2.on('drawend', (e) => {
    unByKey(listener)
    createMeasureTooltip();
    draw2.setActive(false)
    mode = null
  })
  draw2.setActive(false)
  map.addInteraction(draw2)
  map.on('click', () => {
    if (mode) {
      let cd = mode === 'length' ? draw : draw2
      cd.setActive(true)
    }
  })
}
const initClipEvent = () => {
  const rootDom = document.getElementById('map')
  rootDom.addEventListener('mousedown', (e) => {
    if (e.altKey) {
      dragging = true
      startX = e.offsetX
      startY = e.offsetY
    }
  })
  rootDom.addEventListener('mouseup', (e) => {
    dragging = false
  })
  rootDom.addEventListener('mousemove', (event) => {
    if (dragging) {
      const ctx = regularMap.getRenderer().context;
      // ctx.restore()
      const newX = event.offsetX
      const newY = event.offsetY
      const dis = Math.sqrt((newX - startX) * (newX - startX) + (newY - startY) * (newY - startY))
      ctx.beginPath(); // 开始绘制路径
      ctx.arc(startX, startY, dis, 0, 2 * Math.PI); // 绘制圆形
      ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'; // 设置填充颜色
      ctx.fill(); // 填充圆形
      // ctx.clip()
    }
  })
}
// 切换底图
const initSwitchButton = () => {
  const button = document.createElement('button')
  button.innerHTML = '切换底图'
  button.classList.add('switch_button')
  const switchButton = new Control({
    element: button
  })
  button.addEventListener('click', (e) => {
    let layers = map.getAllLayers()
    layers.forEach(l => {
      if (l instanceof TileLayer) {
        const v = l.getVisible()
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
const cord = []
// 初始划下雨
const initRain = () => {
  const count = 500
  for (let i = 0; i < count; i++) {
    let x = (Math.random() * (orScope[2] - orScope[0])) + orScope[0]
    let y = (Math.random() * (orScope[3] - orScope[1])) + orScope[1]
    cord.push([x, y])
    let p = initRainSymbol([x, y])
    dis.push(y - orScope[1])
    points.push(p)
  }
  rainSource.addFeatures(points)
  const fea = rainSource.getFeatures()
  window.ge = fea[0]
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
  const v = rainLayer.getVisible()
  rainLayer.setVisible(!v)
}
// 去北京
const toBeijing = () => {
  const view = map.getView()
  const currentCor = view.getCenter()
  const beijing = olProj.fromLonLat([116.28, 39.54], 'EPSG:4326');
  // console.log(currentCor, beijing)
  view.animate(
    {
      center: [(beijing[0]+currentCor[0])/2, (beijing[1] + currentCor[1]) / 2],
      rotation: Math.PI,
      easing: olEasing.easeIn
    },
    {
      center: beijing,
      rotation: Math.PI * 2,
      easing: olEasing.easeOut
    }
  )
}
const flexbeijing = () => {
  const view = map.getView()
  const currentCor = view.getCenter()
  const beijing = olProj.fromLonLat([116.28, 39.54], 'EPSG:4326');
  view.animate({
    center: beijing,
    easing: (t) => {
      var s = 7.5625, p = 2.75, l;
      if (t < (1 / p)) {
        l = s * t * t;
      } else {
        if (t < (2 / p)) {
          t -= (1.5 / p);
          l = s * t * t + 0.75;
        } else {
          if (t < (2.5 / p)) {
            t -= (2.25 / p);
            l = s * t * t + 0.9375;
          } else {
            t -= (2.625 / p);
            l = s * t * t + 0.984375;
          }
        }
      }
      return l
    },
    duration:2000
  })
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

#map {
  width: 100vw;
  height: 100vh;
  position: relative;
}

.ol-zoom-extent>button {
  /* background-color: red; */
  height: fit-content;
}

.ol-zoomslider {
  top: 9.5em;
  background-color: rgba(0, 0, 0, 0.5);
}

.ol-full-screen {
  right: 2.5em;
}

.switch_button {
  position: absolute;
  right: 5.5em;
  top: 0.5em
}

.rain_mask {
  background-color: rgba(0, 0, 0, 0.5);
}

.switch_rain {
  position: absolute;
  right: 11.5em;
  top: 0.5em;
  z-index: 2;
}

.switch_webgl {
  position: absolute;
  right: 20.5em;
  top: 0.5em;
  z-index: 2;
}
.toBeijing{
  position: absolute;
  right: 30.5em;
  top: 0.5em;
  z-index: 2;
}
.toBeijing_f{
  position: absolute;
  right: 40.5em;
  top: 0.5em;
  z-index: 2;
}
.m_length{
  position: absolute;
  right: 50.5em;
  top: 0.5em;
  z-index: 2;
}
.m_area{
  position: absolute;
  right: 60.5em;
  top: 0.5em;
  z-index: 2;
}
.edit_button{
  position: absolute;
  right: 70.5em;
  top: 0.5em;
  z-index: 2;
}
.tips{
  position: absolute;
  right: 80.5em;
  top: 0.5em;
  z-index: 2;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 5px;
}
#tiny_map_container {
  position: absolute;
  left: 0em;
  bottom: 0em;
  width: 500px;
  height: 300px;
  z-index: 2;
}
#scale_container{
  position: absolute;
  left: 50vw;
  bottom: 0vh;
  /* width: 500px;
  height: 300px; */
  z-index: 3;
  transform: translate(-50%);
  color:#fff;
  background-color: rgba(0, 0, 0, 0.7);
}
#mouse_position {
  position: absolute;
  right: 0px;
  bottom: 0px;
  z-index: 2;
}

.info_style {
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
}

.tiny_map {
  width: 100%;
  height: 100%;
  position: relative;
}

.tiny_map>button {
  position: absolute;
  padding: 0px 10px;
  left: 0px;
  bottom: 0px;
  width: fit-content;
}

.ol-overviewmap-map {
  width: 100%;
  height: 100%;
}
</style>