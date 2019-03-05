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
  job_name: {
    label: '原生资源',
    description: 'job名称',
    default: '',
  },
  image_addr: {
    label: '原生资源',
    description: '镜像地址',
    default: getDefaultReigistry() + 'system_containers/perl:latest',
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
}

export default inputs
