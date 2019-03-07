/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 */

/**
 * inputs of CronJob
 *
 * @author zhangpc
 * @date 2019-03-05
 */

import { getDefaultReigistry } from '../_utils'

const inputs = {
  cronJob_name: {
    label: '原生资源',
    description: 'CronJob 名称',
    default: '',
  },
  schedule: {
    label: '原生资源',
    description: '时间表',
    default: '*/1 * * * *',
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
  // @Todo: multi inputs for a single filed not support yet
  /* command: {
    label: '原生资源',
    description: '启动命令',
    default: [
      'perl',
      '-Mbignum=bpi',
      '-wle',
      'print bpi(100)',
    ],
  }, */
}

export default inputs
