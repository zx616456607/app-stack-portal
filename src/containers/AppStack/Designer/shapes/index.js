/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 *  App stack shapes
 *
 * @author zhangpc
 * @date 2018-11-16
 */

import {
  AppC as AppIcon,
  ServiceC as ServiceIcon,
  ConfigmapC as ConfigmapIcon,
  ClusterMeshPort as ClusterMeshPortIcon,
} from '@tenx-ui/icon'
import { Icon } from 'antd'

export const RESOURCE_LIST = [
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
    id: 'LBgroup',
    icon: <ClusterMeshPortIcon />,
    title: '集群网络出口',
    enabled: true,
  },
  {
    id: 'Deployment',
    icon: <Icon type="appstore" />,
    title: 'Deployment',
  },
  {
    id: 'Service',
    icon: <Icon type="appstore" />,
    title: 'Service',
  },
  {
    id: 'service-2',
    icon: <Icon type="appstore" />,
    title: '服务配置·加密配置',
  },
  {
    id: 'service-3',
    icon: <Icon type="appstore" />,
    title: '存储·独享型',
  },
  {
    id: 'service-4',
    icon: <Icon type="appstore" />,
    title: '存储·共享型',
  },
  {
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
  },
]

export { default as Application } from './Application'
export { default as DeploymentService } from './DeploymentService'
export { default as Deployment } from './Deployment'
export { default as Service } from './Service'
export { default as ConfigMap } from './ConfigMap'
export { default as LBgroup } from './LBgroup'
