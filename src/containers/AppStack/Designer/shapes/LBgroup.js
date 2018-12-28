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
  _link_rules: {
    required: true,
    types: [ 'devs.DeploymentService', 'devs.Service' ],
  },
  _app_stack_template: {
    apiVersion: 'v1',
    kind: 'LBgroup',
    method: 'patch',
    metadata: {
      body: [
        {
          patchPath: [ 'metadata', 'annotations' ],
          overwrite: false,
          data: {
            'system/lbgroup': {
              get_inmap: 'lbgroup',
            },
            /* 'system/schemaPortname': {
              get_input: 'schemaPort',
            }, */
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
    /* schemaPort: {
      label: '扩展资源',
      description: '需要暴露的端口和端口协议，如80/TCP或80/TCP,81/TCP',
      default: '80/TCP',
    }, */
  },
}
const LBgroup = joint.shapes.devs.Model.define('devs.LBgroup', options)

LBgroup.options = options

export default LBgroup
