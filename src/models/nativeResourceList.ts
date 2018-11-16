/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * nativeResourceList.ts page
 *
 * @author zhangtao
 * @date Tuesday October 30th 2018
 */
import {
  getNativeResourceList,
  deleteNativeResourceList,
  getNativeResourceDetail,
  operationNativeResource,
} from '../services/nativeResourceList'
import {redistributionPod} from "../services/nativeDetail";

export default {
  namespace: 'NativeResourceList',
  state: {
  },
  reducers: {
  },
  effects: {
    * getNativeResourceList({ payload }, { call }) {
      const res = yield call(getNativeResourceList , payload)
      return res
    },
    * deleteNativeResourceList({ payload }, { call }) {
      const res = yield call(deleteNativeResourceList, payload)
      return res
    },
    * getNativeResourceDetail({ payload }, { call }) {
      const res = yield call(getNativeResourceDetail, payload)
      return res
    },
    * operationNativeResource({ payload }, { call }) {
      const res = yield call(operationNativeResource, payload)
      return res
    },
    * redistributionPod({ payload: { body, force } }, { call, select }) {
      const { app: { cluster } } = yield select(state => state)
      const res = yield call(redistributionPod, {
        cluster,
        body,
        force,
      })
      return res
    },
  },
}
