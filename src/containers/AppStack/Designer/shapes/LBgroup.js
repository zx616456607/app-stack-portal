/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 *  LBgroup shape
 *
 * @author zhangpc
 * @date 2018-12-26
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
      text: '集群网络出口',
    },
    '.body': {
      rx: 6,
      ry: 6,
      strokeWidth: 1,
    },
  },
  _deploy_2_yaml: false,
  _link_rules: {
    required: true,
    message: '集群网络出口至少与一个服务连线',
    types: [ 'devs.DeploymentService', 'devs.Service' ],
  },
  _app_stack_template: {
    apiVersion: 'v1',
    kind: 'LBgroup',
    method: 'patch',
    metadata: {
      body: [
        {
          patchPath: [ 1, 'metadata', 'annotations' ],
          overwrite: false,
          data: {
            'system/lbgroup': {
              get_inmap: 'lbgroup',
            },
          },
        },
      ],
    },
  },
  _app_stack_input: {
    lbgroup: {
      type: 'select',
      label: '扩展资源',
      description: '集群网络出口',
      backend: true,
      configType: 'lbgroup',
      default: '',
      needCluster: true,
    },
  },
}
const LBgroup = joint.shapes.devs.Model.define('devs.LBgroup', options)

LBgroup.options = options

export default LBgroup
