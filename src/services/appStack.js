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

export const createAppstack = ({ name, body }) => request({
  url: `${paasApiUrl}/appstacks/templates/${name}`,
  options: {
    method: 'POST',
    body,
  },
})
export const updateAppstack = ({ name, body }) => request({
  url: `${paasApiUrl}/appstacks/templates/${name}`,
  options: {
    method: 'PUT',
    body,
  },
})
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
export const templateDetailRequest = name => request({
  url: `${paasApiUrl}/appstacks/templates/${name}`,
  options: {
    method: 'GET',
  },
})
export const appStacksListRequest = ({ cluster, query }) => request({
  url: `${paasApiUrl}/clusters/${cluster}/appstacks?${queryString.stringify(query)}`,
  options: {
    method: 'GET',
  },
})
export const appStacksDetailRequest = ({ cluster, name }) => request({
  url: `${paasApiUrl}/clusters/${cluster}/appstacks/${name}`,
  options: {
    method: 'GET',
  },
})
export const appStacksStartRequest = ({ cluster, name }) => request({
  url: `${paasApiUrl}/clusters/${cluster}/appstacks/${name}/actions/start`,
  options: {
    method: 'PUT',
  },
})
export const appStacksStopRequest = ({ cluster, name }) => request({
  url: `${paasApiUrl}/clusters/${cluster}/appstacks/${name}/actions/stop`,
  options: {
    method: 'PUT',
  },
})
export const appStacksDeleteRequest = ({ cluster, name }) => request({
  url: `${paasApiUrl}/clusters/${cluster}/appstacks/${name}`,
  options: {
    method: 'DELETE',
  },
})
