/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * nativeResourceList.ts page
 *
 * @author zhangtao
 * @date Tuesday October 30th 2018
 */
import { getListProject } from '../services/resourceBanner'
export default {
  namespace: 'NativeResourceList',
  state: {
  },
  reducers: {
  },
  effects: {
    * getListProject({ payload }, { call }) {
      const res = yield call(getListProject, payload)
      return res
    },
  },
}
