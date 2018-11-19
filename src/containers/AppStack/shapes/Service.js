/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 *  Service shape
 *
 * @author zhangpc
 * @date 2018-11-16
 */

import * as joint from 'jointjs'

const options = {
  size: {
    width: 88,
    height: 88,
  },
  outPorts: [ 'out' ],
  attrs: {
    '.label': {
      text: 'Service',
    },
    '.body': {
      rx: 6,
      ry: 6,
      strokeWidth: 1,
    },
  },
}
const Service = joint.shapes.devs.Model.define('devs.Service', options)

Service.options = options

export default Service
