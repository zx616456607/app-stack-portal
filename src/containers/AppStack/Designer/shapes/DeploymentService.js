/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 *  DeploymentService shape
 *
 * @author zhangpc
 * @date 2018-11-16
 */

import * as joint from 'jointjs'
import { getOptions } from './_base'

let options = {
  inPorts: [ 'in' ],
  outPorts: null,
  _deploy_2_yaml: true,
  _link_rules: {
    required: false,
    types: [ 'devs.LBgroup', 'devs.ConfigMap' ],
  },
  _app_stack_template: [
    {
      apiVersion: 'extensions/v1beta1',
      kind: 'Deployment',
      metadata: {
        annotations: {
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
                get_input: 'app_name',
              },
              name: {
                get_input: 'deployment_name',
              },
              'system/appName': {
                get_input: 'app_name',
              },
              'system/svcName': {
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
                  get_input: 'image_pullPolicy',
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
    {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        annotations: {
          'system/schemaPortname': {
            get_by_build_in_function: 'getSchemaPortname',
          },
        },
        labels: {
          'system/appName': {
            get_input: 'app_name',
          },
          'system/svcName': {
            get_attribute: [ 'metadata', 'name' ],
          },
        },
        name: {
          get_input: 'deployment_name',
        },
      },
      spec: {
        ports: [
          {
            name: 'port-name-1',
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
  ],
  _app_stack_input: {
    deployment_name: {
      label: '原生资源',
      description: '服务名称',
      default: '',
    },
    replicas: {
      type: 'number',
      label: '原生资源',
      description: '实例数量',
      default: 1,
    },
    image_addr: {
      label: '原生资源',
      description: '镜像地址',
      default: '192.168.1.52/public/hello-world',
    },
    image_pullPolicy: {
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
      default: 'TCP',
    },
    limits_cpu: {
      label: '原生资源',
      description: 'cpu 最大限制',
      default: '1',
    },
    requests_cpu: {
      label: '原生资源',
      description: 'cpu 最小限制',
      default: '200m',
    },
    limits_memory: {
      label: '原生资源',
      description: '内存最大限制',
      default: '512Mi',
    },
    requests_memory: {
      label: '原生资源',
      description: '内存最小限制',
      default: '512Mi',
    },
    service_port: {
      label: '原生资源',
      description: '服务端口',
      default: 80,
    },
    service_protocol: {
      label: '原生资源',
      description: '服务协议',
      default: 'TCP',
    },
    service_targetPort: {
      label: '原生资源',
      description: '目标端口',
      default: 80,
    },
  },
}
options = getOptions({ text: '服务', type: 'DeploymentService' }, options)
const DeploymentService = joint.shapes.devs.Model.define('devs.DeploymentService', options)

DeploymentService.options = options

export default DeploymentService
