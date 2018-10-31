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
interface NativeResourceListParam {
  cluster: string;
  type: string;
}
// 获取k8s原生资源列表
export const getNativeResourceList = ({ cluster, type }: NativeResourceListParam) => request({
  url: `${paasApiUrl}/clusters/${cluster}/native/${type}`,
})

interface DeleteNativeResourceList extends NativeResourceListParam {
  name: string;
}
// 删除k8s原生资源列表
export const deleteNativeResourceList = ({ cluster, type, name }: DeleteNativeResourceList) =>
request({
  url: `${paasApiUrl}/clusters/${cluster}/native/${type}`,
  options: {
    method: 'DELETE',
  },
})
