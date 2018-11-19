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

export const deployAppstack = ({ cluster, name, body }) => request({
  url: `${paasApiUrl}${CLUSTERS}/${cluster}/appstacks/${name}`,
  options: {
    method: 'POST',
    body,
  },
})
