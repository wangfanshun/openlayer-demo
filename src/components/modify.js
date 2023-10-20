import { Modify } from 'ol/interaction.js'
export default class Modifier {
  constructor(map, source) {
    this.map = map
    this.source = source
    this.modify = null
    this.initModify()
  }
  initModify() {
    this.modify = new Modify({ source: this.source })
    this.modify.setActive(false)
    this.map.addInteraction(this.modify)
  }
  setActive(flag) {
    this.modify.setActive(flag)
  }
}