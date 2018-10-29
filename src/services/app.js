/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * service of app
 *
 * @author zhangpc
 * @date 2018-05-24
 */
import request from '../utils/request'
import { AUTH_DATA } from '../utils/constants'
import { paasApiUrl } from '../utils/config'

export function auth(payload) {
  const { username, token, jwt } = payload
  let headers
  if (username && token) {
    headers = {
      username,
      Authorization: `token ${token}`,
    }
  } else if (jwt) {
    headers = {
      Authorization: `Bearer ${jwt}`,
    }
  }
  return request({
    url: `${paasApiUrl}/auth`,
    options: {
      headers,
    },
  })
}

export function getUserById(userId) {
  return request({
    url: `${paasApiUrl}/users/${userId}`,
  })
}

export function getAuthData() {
  return JSON.parse(localStorage.getItem(AUTH_DATA))
}

export function setAuthData(data) {
  localStorage.setItem(AUTH_DATA, JSON.stringify(data))
}

export function removeAuthData() {
  localStorage.removeItem(AUTH_DATA)
}
