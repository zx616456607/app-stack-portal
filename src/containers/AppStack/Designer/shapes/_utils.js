/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 */

/**
 *  utils of shape
 *
 * @author zhangpc
 * @date 2019-02-27
 */

import {
  AppC as AppIcon,
  ServiceC as ServiceIcon,
  ConfigmapC as ConfigmapIcon,
  ClusterMeshPortC as ClusterMeshPortIcon,
  SercretC as SecretIcon,
  CronJobC as CronJobIcon,
  DeploymentC as DeploymentIcon,
  JobC as JobIcon,
  K8sServiceC as K8sServiceIcon,
  StatefulSetC as StatefulSetIcon,
  StorageGlusterFsC as StorageGlusterFsIcon,
  StorageNfsC as StorageNfsIcon,
  StoragePrivateC as StoragePrivateIcon,
} from '@tenx-ui/icon'
import * as joint from 'jointjs'
import { linkOptions } from './_base'

/**
 * short cell id
 *
 * @param {string} id full id of cell
 *
 * @return {string} shorted Id
 */
export const idShort = id => id.split('-')[0]

/**
 * 简化 graph 结构，以显示在 yaml dock 中
 * 减小暴露给用户结构的复杂度
 *
 * @param {object} graph `this.graph.toJSON()` 返回的结构
 * @return {object} minifiedGraph
 */
export const minifyGraph = (graph = { cells: [] }) => {
  graph.cells = graph.cells.map(cell => {
    if (cell.type === 'link') {
      const { id, type, source, target, z, vertices = [], attrs } = cell
      return { id, type, source, target, z, vertices, attrs }
    }
    const { id, type, position, size, z, attrs } = cell
    const formatCell = { id, type, position, size, z, attrs }
    if (cell.embeds) {
      formatCell.embeds = cell.embeds
    }
    if (cell.parent) {
      formatCell.parent = cell.parent
    }
    return formatCell
  })
  return graph
}

/**
 * 将通过 `minifyGraph` 函数简化后的结构恢复成 `this.graph.fromJSON()` 需要的结构
 *
 * @param {object} minifiedGraph `minifyGraph` 函数简化后的结构
 * @param {object} [nodes={}] nodes
 * @param {object} [inputs={}] inputs
 *
 * @return {object} `this.graph.fromJSON()` 需要的结构
 */
export const fullGraph = (minifiedGraph = { cells: [] }, nodes = {}, inputs = {}) => {
  minifiedGraph.cells = minifiedGraph.cells.map(cell => {
    const { id, type } = cell
    if (type === linkOptions.type) {
      return Object.assign({}, linkOptions, cell)
    }
    const _shortedId = idShort(id)
    if (nodes[_shortedId]) {
      cell._app_stack_template = nodes[_shortedId]
    }
    if (inputs[_shortedId]) {
      cell._app_stack_input = inputs[_shortedId]
    }
    const ResourceShape = joint.shapes.devs[type.split('.')[1]] || {}
    return Object.assign({}, ResourceShape.options, cell)
  })
  return minifiedGraph
}

export const RESOURCE_LIST = [
  {
    id: 'AppManage',
    title: '应用管理',
    type: 'sub',
    children: [
      {
        id: 'Application',
        icon: <AppIcon />,
        title: '应用',
        enabled: true,
      },
      {
        id: 'DeploymentService',
        icon: <ServiceIcon />,
        title: '服务',
        enabled: true,
      },
      {
        id: 'ConfigMap',
        icon: <ConfigmapIcon />,
        title: '服务配置·普通配置',
        enabled: true,
      },
      {
        id: 'Secret',
        icon: <SecretIcon />,
        title: '服务配置·加密配置',
        enabled: true,
      },
      {
        id: 'LBgroup',
        icon: <ClusterMeshPortIcon />,
        title: '集群网络出口',
        enabled: true,
      },
    ],
  },
  {
    id: 'Workloads',
    title: '工作负载',
    type: 'sub',
    children: [
      {
        id: 'Deployment',
        icon: <DeploymentIcon />,
        title: 'Deployment',
        enabled: true,
      },
      {
        id: 'Service',
        icon: <K8sServiceIcon />,
        title: 'Service',
        enabled: true,
      },
      {
        id: 'StatefulSet',
        icon: <StatefulSetIcon />,
        title: 'StatefulSet',
        enabled: true,
      },
      {
        id: 'CronJob',
        icon: <CronJobIcon />,
        title: 'CronJob',
        enabled: true,
      },
      {
        id: 'Job',
        icon: <JobIcon />,
        title: 'Job',
        enabled: true,
      },
    ],
  },
  {
    id: 'StorageManage',
    title: '存储管理',
    type: 'sub',
    children: [
      {
        id: 'StoragePrivate',
        icon: <StoragePrivateIcon />,
        title: '存储·独享型',
        enabled: true,
      },
      {
        id: 'StorageNFS',
        icon: <StorageNfsIcon />,
        title: '存储·共享型(NFS)',
        enabled: true,
      },
      {
        id: 'StorageGlusterFS',
        icon: <StorageGlusterFsIcon />,
        title: '存储·共享型(GlusterFS)',
        enabled: true,
      },
    ],
  },
  /* {
    id: 'service-5',
    icon: <Icon type="appstore" />,
    title: '存储·本地存储',
  },
  {
    id: 'service-6',
    icon: <Icon type="appstore" />,
    title: '服务发现',
  },
  {
    id: 'service-7',
    icon: <Icon type="appstore" />,
    title: '应用负载均衡·集群内',
  },
  {
    id: 'service-8',
    icon: <Icon type="appstore" />,
    title: '应用负载均衡·集群外',
  },
  {
    id: 'service-10',
    icon: <Icon type="appstore" />,
    title: '自定义资源',
  },
  {
    id: 'service-11',
    icon: <Icon type="appstore" />,
    title: '安全组',
  }, */
]
