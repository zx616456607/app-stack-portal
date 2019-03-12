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
import { getOptions } from './_base'

let options = {
  _deploy_2_yaml: true,
  _deploy_single: false,
  _link_rules: {
    required: false,
    types: [
      'devs.CronJob', 'devs.Deployment', 'devs.Job', 'devs.StatefulSet',
      'devs.DeploymentService',
    ],
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
options = getOptions({ text: '普通配置', type: 'ConfigMap' }, options)

const ConfigMap = joint.shapes.devs.Model.define('devs.ConfigMap', options)

ConfigMap.options = options

export default ConfigMap

