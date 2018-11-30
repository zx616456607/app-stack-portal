/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 *  ConfigMap shape
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
      text: 'ConfigMap',
    },
    '.body': {
      rx: 6,
      ry: 6,
      strokeWidth: 1,
    },
  },
  _app_stack_template: {
    apiVersion: 'v1',
    data: {
      example: 'example',
    },
    kind: 'ConfigMap',
    metadata: {
      name: {
        get_input: 'configMap_name',
      },
      labels: {},
    },
  },
  _app_stack_input: {
    configMap_name: {
      label: '原生资源',
      description: '服务配置名称',
      default: '',
    },
  },
}
const ConfigMap = joint.shapes.devs.Model.define('devs.ConfigMap', options)

ConfigMap.options = options

export default ConfigMap

