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
      text: '应用',
    },
    '.body': {
      rx: 6,
      ry: 6,
      strokeWidth: 1,
    },
  },
  _link_rules: {
    required: false,
    types: [],
  },
  _app_stack_template: {
    apiVersion: 'v1',
    kind: 'Application',
    metadata: {
      name: {
        get_input: 'app_name',
      },
      labels: {},
    },
  },
  _app_stack_input: {
    app_name: {
      label: '扩展资源',
      description: '应用名称',
      default: '',
    },
  },
}
const Application = joint.shapes.devs.Model.define('devs.Application', options)

Application.options = options

export default Application
