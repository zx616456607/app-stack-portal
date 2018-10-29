/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * request of utils
 *
 * @author zhangpc
 * @date 2018-05-24
 */
import fetch from 'dva/fetch'
import { getType } from './helper'
import { CONTENT_TYPE_JSON, CONTENT_TYPE_URLENCODED } from './constants'
import { aiApiUrl, aiApi } from './config'
import { getAuthData } from '../services/app'
import queryString from 'query-string'

function getFullUrl(url, options) {
  if (/^https?:\/\//.test(url)) {
    return url
  }
  // use mockData
  if (options.mock) {
    return `${aiApi.prefix}${url}`
  }
  return `${aiApiUrl}${url}`
}

function addAuthHeaders(options = {}) {
  const authData = getAuthData()
  // 本地存储不存在认证信息时跳过添加认证
  if (!authData || !authData.jwtToken) {
    return options
  }
  // `options.headers` 中已经存在认证信息时跳过添加认证
  options.headers = options.headers || {}
  if (options.headers.Authorization || options.headers.authorization) {
    return options
  }
  const { jwtToken, project, onbehalfuser } = authData
  const authHeaders = {
    Authorization: `Bearer ${jwtToken.token}`,
  }
  if (project) {
    authHeaders.project = project
  } else if (onbehalfuser) {
    authHeaders.onbehalfuser = onbehalfuser
  }
  const headers = Object.assign({}, authHeaders, options.headers)
  return Object.assign({}, options, { headers })
}

function handleResponse(response) {
  // handle for non-JSON response
  return response.text().then(text => {
    let json
    try {
      json = JSON.parse(text)
    } catch (error) {
      json = { body: text }
    }

    if (!response.ok || response.status >= 300) {
      const error = new Error(response.statusText)
      error.status = response.status
      error.response = json
      return Promise.reject(error)
    }

    return json
  })
}

/**
 * Requests a URL, returning a promise.
 *
 * @export
 * @param {object} { url, options, ... } request
 *                   url - The URL we want to request
 *                   options - The options we want to paas to "fetch" or others
 *
 * @return {object} An object containing either "data" or "err"
 */
export default function request({ url, options = {} }) {
  // url => full url
  url = getFullUrl(url, options)

  // add auth headers
  options = addAuthHeaders(options)
  // same-origin default
  if (!options.credentials) {
    options.credentials = 'same-origin'
  }

  // the request body can be of the type String, Blob, or FormData.
  // other data structures need to be encoded before hand as one of these types.
  // https://github.github.io/fetch/#request-body
  const REQUEST_BODY_METHODS = [ 'POST', 'PUT', 'PATCH' ]
  const bodyType = getType(options.body)
  if (REQUEST_BODY_METHODS.indexOf(options.method) > -1
    && (bodyType === 'object' || bodyType === 'array')) {
    if (!options.headers) options.headers = {}
    if (options.headers['Content-Type'] === undefined) {
      options.headers['Content-Type'] = CONTENT_TYPE_JSON
    }
    switch (options.headers['Content-Type']) {
      case CONTENT_TYPE_JSON:
        options.body = JSON.stringify(options.body)
        break
      case CONTENT_TYPE_URLENCODED:
        options.body = queryString.stringify(options.body)
        break
      default:
        break
    }
  }
  return fetch(url, options).then(handleResponse)
}
