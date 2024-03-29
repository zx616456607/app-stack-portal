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
  url: `${paasApiUrl}/clusters/${cluster}/native/${type}/${name}`,
  options: {
    method: 'DELETE',
  },
})

// 获取 k8s 原生资源详情
export const getNativeResourceDetail = ({ cluster, type, name }: DeleteNativeResourceList) =>
request({
  url: `${paasApiUrl}/clusters/${cluster}/native/${type}/${name}`,
})

interface OperationNativeResource extends DeleteNativeResourceList {
  options: string;
}
// 打补丁
export const operationNativeResource =
({ cluster, type, name, options }: OperationNativeResource) =>
 request({
  url: `${paasApiUrl}/clusters/${cluster}/native/${type}/${name}`,
  options: {
    method: 'PATCH',
    body: options,
    headers: {
      'Content-Type': 'application/strategic-merge-patch+json',
    },
  },
})
