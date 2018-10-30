/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * model of task templates
 *
 * @author songsz
 * @date 2018-04-09
 */

import {
  getClusters,
} from '../services/paas'

export default {
  namespace: 'nativeDetail',
  state: {
  },

  reducers: {
    updateState(state, { payload }) {
      return { ...state, ...payload }
    },
  },

  effects: {
    * getNativeDetail(_, { call, put }) {
      const res = yield call(getClusters)
      if (res.clusters) {
        yield put({
          type: 'saveClusters',
          payload: {
            clusters: res.clusters || [],
          },
        })
      }
    },
  },
}
