/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 *  Deployment shape
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
  _app_stack_template: {
    apiVersion: 'extensions/v1beta1',
    kind: 'Deployment',
    metadata: {
      annotation: {
        'sidecar.istio.io/inject': 'false',
      },
      name: {
        get_input: 'deployment_name',
      },
      labels: {
        'system/appName': {
          get_input: 'app_name',
        },
        'system/svcName': {
          get_input: 'deployment_name',
        },
        'system/appstack': {
          get_input: 'appstack',
        },
      },
    },
    spec: {
      strategy: {
        rollingUpdate: {
          maxSurge: '10%',
          maxUnavailable: 0,
        },
        type: 'RollingUpdate',
      },
      replicas: {
        get_input: 'replicas',
      },
      selector: {
        matchLabels: {
          name: {
            get_input: 'deployment_name',
          },
        },
      },
      template: {
        metadata: {
          annotations: {
            'sidecar.istio.io/inject': 'false',
          },
          labels: {
            app: {
              get_input: 'deployment_name',
            },
            name: {
              get_input: 'deployment_name',
            },
            'tenxcloud.com/appName': {
              get_input: 'app_name',
            },
            'tenxcloud.com/svcName': {
              get_input: 'deployment_name',
            },
          },
        },
        spec: {
          containers: [
            {
              image: {
                get_input: 'image_addr',
              },
              imagePullPolicy: {
                get_input: 'iamge_pullPolicy',
              },
              name: {
                get_input: 'container_name',
              },
              ports: [
                {
                  containerPort: {
                    get_input: 'container_port',
                  },
                  protocol: {
                    get_input: 'port_protocol',
                  },
                },
              ],
              resources: {
                limits: {
                  cpu: {
                    get_input: 'limits_cpu',
                  },
                  memory: {
                    get_input: 'limits_memory',
                  },
                },
                requests: {
                  cpu: {
                    get_input: 'requests_cpu',
                  },
                  memory: {
                    get_input: 'requests_memory',
                  },
                },
              },
            },
          ],
        },
      },
    },
  },
  _app_stack_input: {
    input: {
      deployment_name: {
        label: '原生资源',
        description: '服务名称',
        default: '',
      },
      app_name: {
        label: '扩展资源',
        description: '应用名称',
        default: '',
      },
      appstack: {
        label: '扩展资源',
        description: '堆栈名称',
        default: '',
      },
      replicas: {
        label: '原生资源',
        description: '实例数量',
        default: 1,
      },
      image_addr: {
        label: '原生资源',
        description: '镜像地址',
        default: '',
      },
      iamge_pullPolicy: {
        label: '原生资源',
        description: '镜像获取策略',
        default: 'Always',
      },
      container_name: {
        label: '原生资源',
        description: '容器名称',
        default: 'container-1',
      },
      container_port: {
        label: '原生资源',
        description: '容器端口',
        default: 80,
      },
      port_protocol: {
        label: '原生资源',
        description: '端口协议',
        default: 80,
      },
    },
  },
}
const Deployment = joint.shapes.devs.Model.define('devs.Deployment', options)

Deployment.options = options

export default Deployment
