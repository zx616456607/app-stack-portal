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

const getNativeLogs = ({ cluster, name, body }) => request({
  url: `${paasApiUrl}${CLUSTERS}/${cluster}/logs/instances/${name}/logs`,
  options: {
    method: 'POST',
    body,
  },
})

// 获取 Pod的事件
const getPodEvent = ({ cluster, name }) => request({
  url: `${paasApiUrl}${CLUSTERS}/${cluster}/events/services/${name}/pods/events`,
})
const getServiceMonitor = ({ cluster, name, query, namespace }) => {
  query.source = METRICS_DEFAULT_SOURCE
  return request({
    url: `${paasApiUrl}${CLUSTERS}/${cluster}/metric/services/${name}/metrics?${queryString.stringify(query)}`,
    options: {
      headers: {
        project: namespace,
      },
    },
  })
}

export {
  getNativeDetail,
  getPodsList,
  getNativeLogs,
  getPodEvent,
  getServiceMonitor,
}
