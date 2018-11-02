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
  getNativeDetail,
  getPodsList,
  getNativeLogs,
  getPodEvent,
} from '../services/nativeDetail'
import { getDeepValue } from '../utils/helper'

export default {
  namespace: 'nativeDetail',
  state: {
    type: '',
    name: '',
    detailData: {},
    pods: [],
    logs: {},
    events: [],
  },

  reducers: {
    updateState(state, { payload }) {
      return { ...state, ...payload }
    },
  },

  effects: {
    * fetchNativeDetail(_, { call, put, select }) {
      const { app: { cluster }, nativeDetail: { type, name } } = yield select(state => state)
      const res = yield call(getNativeDetail, { cluster, type, name })
      if (res.data) {
        yield put({
          type: 'updateState',
          payload: {
            detailData: res.data || {},
          },
        })
      }
    },
    * fetchPodsList(_, { call, put, select }) {
      yield put({
        type: 'updateState',
        payload: {
          pods: [],
        },
      })
      const { app: { cluster }, nativeDetail: { type, name } } = yield select(state => state)
      const res = yield call(getPodsList, { cluster, type, name })
      if (res.data) {
        yield put({
          type: 'updateState',
          payload: {
            pods: (res.data && res.data.items) || [],
          },
        })
      }
    },
    * fetchNativeLogs({ payload: { body } }, { call, put, select }) {
      yield put({
        type: 'updateState',
        payload: {
          logs: {},
        },
      })
      const { app: { cluster }, nativeDetail: { name } } = yield select(state => state)
      yield put({
        type: 'updateState',
        payload: {
          logs: {},
        },
      })
      const res = yield call(getNativeLogs, { cluster, name, body })
      if (res.data && res.data.logs) {
        yield put({
          type: 'updateState',
          payload: {
            logs: res.data,
          },
        })
      }
      return res
    },
    * fetchPodEvent({ payload }, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          events: [],
        },
      })
      const resPod = yield call(getPodEvent, payload)
      yield put({
        type: 'updateState',
        payload: {
          events: getDeepValue(resPod, 'data.events') || [],
        },
      })
    },
  },
}
