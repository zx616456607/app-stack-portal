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

import { getDefaultReigistry, INPUT_SERVICE_PROTOCOL } from '../_utils'

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
    type: 'number',
    label: '原生资源',
    description: '容器端口',
    default: 80,
  },
  port_protocol: {
    ...INPUT_SERVICE_PROTOCOL,
    description: '端口协议',
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
    description: '挂载目录',
    default: '/usr/share/nginx/html',
  },
  vct1_name: {
    label: '原生资源',
    description: 'pvc名称',
    default: 'www',
  },
  storage_size: {
    label: '原生资源',
    description: '存储大小',
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
