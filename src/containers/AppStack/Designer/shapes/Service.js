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
  _app_stack_template: {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      labels: {
        'system/appName': {
          get_input: 'app_name',
        },
        'system/svcName': {
          get_input: 'service_name',
        },
      },
      name: {
        get_input: 'service_name',
      },
    },
    spec: {
      ports: [
        {
          name: 'port_name_1',
          port: {
            get_input: 'service_port',
          },
          protocol: {
            get_input: 'service_protocol',
          },
          targetPort: {
            get_input: 'service_targetPort',
          },
        },
      ],
      selector: {
        name: {
          get_input: 'deployment_name',
        },
      },
    },
  },
  _app_stack_input: {
    input: {
      app_name: {
        default: '扩展资源',
        label: '',
        description: '应用名称',
      },
      service_port: {
        label: '原生资源',
        description: '服务端口',
        default: '',
      },
      service_protocol: {
        label: '原生资源',
        description: '服务协议',
        default: '',
      },
      service_targetPort: {
        label: '原生资源',
        description: '目标端口',
        default: '',
      },
      deployment_name: {
        label: '原生资源',
        description: '目标deployment',
        default: '',
      },
    },
  },
}
const Service = joint.shapes.devs.Model.define('devs.Service', options)

Service.options = options

export default Service
