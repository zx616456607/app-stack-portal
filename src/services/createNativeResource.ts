/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * createNativeCluster.js page
 *
 * @author zhangtao
 * @date Tuesday October 30th 2018
 */
import request from '../utils/request'
import { paasApiUrl } from '../utils/config'
// import { encodeImageFullname } from '../utils/helper'
// import queryString from 'query-string'

// 符合yaml格式的string
type yamlString = string
interface GetClusters {
  cluster: string;
  yaml: yamlString
}
// 创建k8s原生资源
export const createNativeResource = ({ cluster, yaml }: GetClusters) => request({
  url: `${paasApiUrl}/clusters/${cluster}/native`,
  options: {
    method: 'POST',
    body: yaml,
  },
})
// 更新 k8s 原生资源
export const updateNativeResource = ({ cluster, yaml }: GetClusters) => request({
  url: `${paasApiUrl}/clusters/${cluster}/native`,
  options: {
    method: 'PUT',
    body: yaml,
  },
})

// k8s PodSecurityPolicy 创建
export const createPSP = ({ cluster, yaml }: GetClusters) => request({
  url: `${paasApiUrl}/clusters/${cluster}/podsecuritypolicy`,
  options: {
    method: 'POST',
    body: yaml,
  },
})

// 更新 k8s 原生资源
export const updatePSP = ({ cluster, yaml }: GetClusters) => request({
  url: `${paasApiUrl}/clusters/${cluster}/podsecuritypolicy`,
  options: {
    method: 'PUT',
    body: yaml,
  },
})
