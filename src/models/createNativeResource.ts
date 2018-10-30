/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * createNativeCluster.ts page
 *
 * @author zhangtao
 * @date Tuesday October 30th 2018
 */

import { createNativeResource } from '../services/createNativeResource'

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
  },
}
