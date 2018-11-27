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
  loadSample,
} from '../services/createNativeResource'

interface YamlValuePar {
  payload: {
    yamlValue?: string | undefined;
  }
}

export default {
  namespace: 'createNative',
  state: {
    yamlValue: '',
  },
  reducers: {
    updateYamlValue(state, { payload: { yamlValue = '' } = {} }: YamlValuePar) {
      return { ...state, yamlValue }
    },
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
    * loadSample({ payload }, { call }) {
      const res = yield call(loadSample, payload)
      return res
    },
  },
}
