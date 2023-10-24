/*
 * @Author: wangfs wangfs@jurassic.com.cn
 * @Date: 2023-10-23 08:52:26
 * @LastEditors: wangfs wangfs@jurassic.com.cn
 * @LastEditTime: 2023-10-24 21:06:18
 * @FilePath: \openlayer-demo2\src\components\tmap\tmap.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
import Draw from 'ol/interaction/Draw.js';
import { unByKey } from 'ol/Observable.js';
import Overlay from 'ol/Overlay.js';
import { getLength } from 'ol/sphere';
import Cluster from 'ol/source/Cluster.js';
import axios from 'axios'
export default class dyMap {
  constructor() {
    this.map = null
    this.layers = {}
    this.initMap()
    this.activeEduLayer()
  }
  initMap() {
    const regularMap = new TileLayer({
      source: new XYZ({
        url: 'http://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=e6ab03f50196d1ceae9e98e8761dcaab'
        // url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
      }),
      visible: true,
      id: 'regularMap'
    })
    const cityLayer = new TileLayer({
      source: new XYZ({
        url: 'http://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=e6ab03f50196d1ceae9e98e8761dcaab'
      }),
      visible: true,
      id: 'regularMap'
    })
    this.layers.baseLayer = regularMap
    this.map = new Map({
      target: 'map',
      layers: [
        regularMap,
        cityLayer
      ],
      view: new View({
        center: [114.30, 30.50],
        zoom: 2,
        projection: 'EPSG:4326',
        constrainResolution: true
      })
    })
    window.mp = this.map
  }
  activeSelect() {
    window.by = this.layers.baseLayer
  }
  getBoundary() {
    const view = this.map.getView()
    const center = view.getCenter()
    const resolution = this.map.getView().getResolutionForZoom(view.getZoom())
    const width = this.map.getSize()[0] * resolution;
    const height = this.map.getSize()[1] * resolution;
    //计算出中心点为武汉时候的四个角的坐标
    const minX = center[0] - width / 2;
    const minY = center[1] - height / 2;
    const maxX = center[0] + width / 2;
    const maxY = center[1] + height / 2;
    // 构建范围对象
    return [minX, minY, maxX, maxY];
  }
  activeEduLayer() {
    if (!this.layers.eduLayer) {
      this.layers.eduLayer = new VectorLayer({
        source: new Cluster({
          distance: parseInt(40, 10),
          source: new VectorSource({
            features: [new Feature()]
          })
        })
      })
      this.map.addLayer(this.layers.eduLayer)
    }
    const view = this.map.getView()
    this.map.on('moveend', (e) => {
      const zoom = view.getZoom()
      const bd = this.getBoundary()
      const features = this.layers.eduLayer.getSource().getFeatures()
      console.log(features, 'feeee')
      axios({
        method: 'get',
        url: 'https://zhfw.tianditu.gov.cn/zhfw/adminsearch',
        params: {
          postStr: JSON.stringify({ "keyWord": "幼儿园", "level": parseInt(zoom) + '', "mapBound": bd.join(','), "count": "500", "start": "0", "queryTerminal": "10000", "caseType": "2", "queryType": "2", "type": "query" })
        }
      }).then(res => {
        if (res.data) {
          const points = res.data.pois || []
          // points.forEach
          features.length = 0
          points.forEach(p => {
            const coordinates = p.lonlat.split(',')
            features.push(new Feature(new Point(coordinates)))
          })
          console.log(features, 'dddd')
          this.map.render()
        }
      })
    })
  }
}