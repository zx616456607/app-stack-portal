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
import { CLUSTERS, PROJECTS_MEMBERS, IMAGE_CONFIG, CI_IMAGES } from './constants'
import { paasApiUrl, devopsApiUrl, userPortalApiUrl } from '../utils/config'
import { encodeImageFullname } from '../utils/helper'
import queryString from 'query-string'

const getClusters = () => request({
  url: `${paasApiUrl}${CLUSTERS}`,
})

const getProjectMembers = payload => request({
  url: `${paasApiUrl}${PROJECTS_MEMBERS}?${queryString.stringify(payload)}`,
})

const getImages = () => request({
  url: `${devopsApiUrl}${CI_IMAGES}`,
})

const getHarborProjects = () => request({
  url: `${userPortalApiUrl}/registries/default/projects`,
})

const getHarborProjectImages = ({ query }) => request({
  url: `${userPortalApiUrl}${IMAGE_CONFIG}?${queryString.stringify(query)}`,
})

const getHarborImageTags = ({ fullName }) => request({
  url: `${userPortalApiUrl}${IMAGE_CONFIG}/${encodeImageFullname(fullName)}/tags`,
})

const getHarborImageConfig = ({ fullName, tag }) => request({
  url: `${userPortalApiUrl}${IMAGE_CONFIG}/${encodeImageFullname(fullName)}/tags/${tag}/configinfo`,
})

const getDockerRegistry = () => request({
  url: `${userPortalApiUrl}/docker-registry`,
})

export {
  getClusters,
  getProjectMembers,
  getImages,
  getHarborProjects,
  getHarborProjectImages,
  getHarborImageTags,
  getHarborImageConfig,
  getDockerRegistry,
}
