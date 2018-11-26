/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 *  Application shape
 *
 * @author zhangpc
 * @date 2018-11-16
 */

import * as joint from 'jointjs'

const options = {
  size: {
    width: 300,
    height: 300,
  },
  outPorts: [ 'out' ],
  attrs: {
    '.label': {
      text: 'Application',
    },
    '.body': {
      rx: 6,
      ry: 6,
      strokeWidth: 1,
    },
  },
}
const Application = joint.shapes.devs.Model.define('devs.Application', options)

Application.options = options

export default Application