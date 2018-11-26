/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * service of appStack
 *
 * @author zhangpc
 * @date 2018-11-16
 */

import request from '../utils/request'
import { paasApiUrl } from '../utils/config'
import { CLUSTERS } from './constants'
import queryString from 'querystring'

export const deployAppstack = ({ cluster, name, body }) => request({
  url: `${paasApiUrl}${CLUSTERS}/${cluster}/appstacks/${name}`,
  options: {
    method: 'POST',
    body,
  },
})
export const templateListRequest = ({ query }) => request({
  url: `${paasApiUrl}/appstacks/templates?${queryString.stringify(query)}`,
  options: {
    method: 'GET',
  },
})
export const appStacksListRequest = ({clusterID, query }) => request({
  url: `${paasApiUrl}/${clusterID}/appstacks?${queryString.stringify(query)}`,
  options: {
    method: 'GET',
  },
})
