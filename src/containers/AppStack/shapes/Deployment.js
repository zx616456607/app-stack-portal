import * as joint from 'jointjs'

const options = {
  size: {
    width: 88,
    height: 88,
  },
  inPorts: [ 'in' ],
  attrs: {
    '.label': {
      text: 'Deployment',
    },
    '.body': {
      rx: 6,
      ry: 6,
      strokeWidth: 1,
    },
  },
}
const Deployment = joint.shapes.devs.Model.define('devs.Deployment', options)

Deployment.options = options

export default Deployment
