/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 */

/**
 * inputs of StatefulSet
 *
 * @author zhangpc
 * @date 2019-03-05
 */

import { getDefaultReigistry } from '../_utils'

const inputs = {
  statefulSet_name: {
    label: '原生资源',
    description: 'statefulSet名称',
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
    default: getDefaultReigistry() + 'system_containers/nginx:1.15.9',
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
    type: 'number',
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
  'volume-1-_mountPath': {
    label: '原生资源',
    desription: '挂载目录',
    default: '/usr/share/nginx/html',
  },
  service_name: {
    label: '原生资源',
    description: 'service名称',
  },
  service_port: {
    label: '原生资源',
    description: '服务端口',
    default: 80,
    type: 'number',
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
    type: 'number',
  },
  vct1_name: {
    label: '原生资源',
    desription: 'pvc名称',
    default: 'www',
  },
  storage_size: {
    label: '原生资源',
    desription: '存储大小',
    default: '1Gi',
  },
  storageClass: {
    type: 'select',
    label: '原生资源',
    description: '存储类型',
    backend: true,
    configType: 'ceph',
    default: '',
    needCluster: true,
  },
}

export default inputs
