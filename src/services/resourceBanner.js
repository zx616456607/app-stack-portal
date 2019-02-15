import request from '../utils/request'
// import * as api from './constants'
import { paasApiUrl } from '../utils/config'
import { toQuerystring } from '../utils/helper'

// 获取项目列表
export const getListProject = ({ payload: { query } = {} }) => {
  let url = `${paasApiUrl}/projects/listwithoutstatistic`
  if (query) {
    url += `?${toQuerystring(query)}`
  }
  return request({
    url,
    options: {
      method: 'GET',
    },
  })
}
