/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * service of paas
 *
 * @author songsz
 * @date 2018-04-13
 */
import request from '../utils/request'
import { CLUSTERS } from './constants'
import { METRICS_DEFAULT_SOURCE } from '../utils/constants'
import { paasApiUrl } from '../utils/config'
import queryString from 'query-string'

const getNativeDetail = ({ cluster, type, name }) => request({
  url: `${paasApiUrl}${CLUSTERS}/${cluster}/native/${type}/${name}`,
})

const getPodsList = ({ cluster, type, name }) => request({
  url: `${paasApiUrl}${CLUSTERS}/${cluster}/native/${type}/${name}/instances`,
})

const getNativeLogs = ({ cluster, body, instances }) => request({
  url: `${paasApiUrl}${CLUSTERS}/${cluster}/logs/instances/${instances}/logs`,
  options: {
    method: 'POST',
    body,
  },
})

// 获取 Service的事件
const getServiceEvent = ({ cluster, name }) => request({
  url: `${paasApiUrl}${CLUSTERS}/${cluster}/events/services/${name}/pods/events`,
})

const getPodEvent = ({ cluster, name }) => request({
  url: `${paasApiUrl}${CLUSTERS}/${cluster}/events/instances/${name}/events`,
})

const getServiceMonitor = ({ cluster, name, query, project, type }) => {
  query.source = METRICS_DEFAULT_SOURCE
  let monitorType = 'services'
  switch (type) {
    case 'Deployment':
    case 'StatefulSet':
      monitorType = 'services'
      break
    case 'Job':
    case 'Pod':
      monitorType = 'instances'
      break
    default:
      break
  }
  return request({
    url: `${paasApiUrl}${CLUSTERS}/${cluster}/metric/${monitorType}/${name}/metrics?${queryString.stringify(query)}`,
    options: {
      headers: {
        project,
      },
    },
  })
}

const getProcessList = ({ cluster, name, query }) => request({
  url: `${paasApiUrl}${CLUSTERS}/${cluster}/instances/${name}/process?${queryString.stringify(query)}`,
})

const getPodDetail = ({ cluster, instance }) => request({
  url: `${paasApiUrl}${CLUSTERS}/${cluster}/instances/${instance}/detail`,
})

const redistributionPod = ({ cluster, body, force }) => request({
  url: `${paasApiUrl}${CLUSTERS}/${cluster}/instances/batch-delete${force ? '?force=true' : ''}`,
  options: {
    method: 'POST',
    body,
  },
})
// 删除k8s原生资源列表
const deleteNativeResourceList = ({ cluster, type, name }) =>
  request({
    url: `${paasApiUrl}/clusters/${cluster}/native/${type}/${name}`,
    options: {
      method: 'DELETE',
    },
  })
export {
  getNativeDetail,
  getPodsList,
  getNativeLogs,
  getServiceEvent,
  getServiceMonitor,
  getProcessList,
  getPodDetail,
  redistributionPod,
  getPodEvent,
  deleteNativeResourceList,
}
