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
  checkProjectIstio,
} from '../services/createNativeResource'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'

interface YamlValuePar {
  payload: {
    yamlValue?: string | undefined;
  }
}

export default {
  namespace: 'createNative',
  state: {
    yamlValue: ``,
    editorWarn: [],
  },
  reducers: {
    updateYamlValue(state, { payload: { yamlValue = '' } = {} }: YamlValuePar) {
      return { ...state, yamlValue }
    },
    patchWarn(state, { payload: { type, message } }) {
      if (type === 'add') {
        const { editorWarn = [] } = state
        const keyArray = editorWarn.map(([ikey]) => ikey) || []
        const [key] = message
        if (keyArray.includes(key) ) {
          return state
        }
        const newEditorWarn = [ ...editorWarn, message ] || []
        return { ...state, editorWarn: newEditorWarn }
      }
      if (type === 'delete') {
        const { editorWarn = [] } = state
        const [key] = message
        if (key === 'all') {
          return { ...state,  editorWarn: [] }
        }
        const newEditorWarn = editorWarn.filter(([ikey]) => {
          return ikey !== key
        }) || [];
        return { ...state, editorWarn: newEditorWarn }
      }
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
    * checkProjectIstio({ payload }, { call }) {
      const res = yield call(checkProjectIstio, payload)
      const istioEnable = getDeepValue(res, [ 'istioEnabled' ]) || false
      return istioEnable
    },
  },
}
