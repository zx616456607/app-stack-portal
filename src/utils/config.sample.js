/**
* Licensed Materials - Property of tenxcloud.com
* (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
* config
*
* @author zhangpc
* @date 2018-05-24
*/

const isProd = process.env.NODE_ENV === 'production'

const paasApi = {
  protocol: 'http',
  host: '192.168.1.230:48000',
  prefix: '/api/v2',
}


const userPortalApi = {
  protocol: 'http',
  host: isProd ? window.location.host : 'localhost:8003',
  prefix: '/api/v2',
}

module.exports = {
  // name: '时速云',
  prefix: 'app-stack',
  footerText: '© 2018 北京云思畅想科技有限公司 | 时速云 app stack portal v1.0',
  logo: '/logo.svg',
  CORS: [],
  paasApi,
  paasApiUrl: `${paasApi.protocol}://${paasApi.host}${paasApi.prefix}`,
  userPortalApi,
  userPortalApiUrl: `${userPortalApi.protocol}://${userPortalApi.host}${userPortalApi.prefix}`,
}
