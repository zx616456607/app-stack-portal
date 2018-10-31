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
import { paasApiUrl } from '../utils/config'

const getNativeDetail = ({ cluster, type, name }) => request({
  url: `${paasApiUrl}${CLUSTERS}/${cluster}/native/${type}/${name}`,
})

const getPodsList = ({ cluster, type, name }) => request({
  url: `${paasApiUrl}${CLUSTERS}/${cluster}/native/${type}/${name}/instance`,
})

export {
  getNativeDetail,
  getPodsList,
}
