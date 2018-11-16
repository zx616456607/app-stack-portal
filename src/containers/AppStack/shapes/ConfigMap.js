import * as joint from 'jointjs'

const options = {
  size: {
    width: 88,
    height: 88,
  },
  outPorts: [ 'out' ],
  attrs: {
    '.label': {
      text: 'ConfigMap',
    },
    '.body': {
      rx: 6,
      ry: 6,
      strokeWidth: 1,
    },
  },
}
const ConfigMap = joint.shapes.devs.Model.define('devs.ConfigMap', options)

ConfigMap.options = options

export default ConfigMap

