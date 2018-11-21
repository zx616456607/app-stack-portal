/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * createNativeCluster.ts page
 *
 * @author zhangtao
 * @date Tuesday October 30th 2018
 */

import {
  createNativeResource,
  updateNativeResource,
  createPSP,
  updatePSP,
  createStack,
  loadStackDetail,
  loadStackList,
} from '../services/createNativeResource'

export default {
  namespace: 'createNative',
  state: {
  },
  reducers: {
  },
  effects: {
    * createNativeResource({ payload }, { call }) {
      const res = yield call(createNativeResource , payload)
      return res
    },
    * createPSP({ payload }, { call }) {
      const res = yield call(createPSP , payload)
      return res
    },
    * updateNativeResource({ payload }, { call }) {
      const res = yield call(updateNativeResource, payload)
      return res
    },
    * updatePSP({ payload }, { call }) {
      const res = yield call(updatePSP, payload)
      return res
    },
    * createStack({ payload }, { call }) {
      const res = yield call(createStack, payload)
      return res
    },
    * loadStackDetail({ payload }, { call }) {
      const res = yield call(loadStackDetail, payload)
      return res
    },
    * loadStackList({ payload }, { call }) {
      const res = yield call(loadStackList, payload)
      return res
    },
  },
}
