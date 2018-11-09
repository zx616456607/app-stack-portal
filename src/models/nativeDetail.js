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
  getServiceMonitor,
  getProcessList,
  getPodDetail,
} from '../services/nativeDetail'
import {
  formatInstanceMonitor,
} from '../utils/helper'
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
    podDetail: {},
    process: [],
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
      const { app: { cluster }, nativeDetail: { pods } } = yield select(state => state)
      yield put({
        type: 'updateState',
        payload: {
          logs: {},
        },
      })
      const instances = []
      pods.map(pod => instances.push(pod.metadata.name))
      const res = yield call(getNativeLogs, {
        cluster, body,
        instances: instances.join(','),
      })
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
    * fetchMonitor({ payload: { cluster, name, query, namespace } }, { call, put, select }) {
      const res = yield call(getServiceMonitor, { cluster, name, query, namespace })
      const { nativeDetail: { monitor } } = yield select(state => state)
      yield put({
        type: 'updateState',
        payload: {
          monitor: {
            ...monitor,
            [query.type]: {
              data: formatInstanceMonitor(res.data),
            },
          },
        },
      })
    },
    * fetchRealTimeMonitor(
      { payload: { cluster, name, query, namespace } },
      { call, put, select }
    ) {
      const res = yield call(getServiceMonitor, { cluster, name, query, namespace })
      const { nativeDetail: { realTimeMonitor } } = yield select(state => state)
      yield put({
        type: 'updateState',
        payload: {
          realTimeMonitor: {
            ...realTimeMonitor,
            [query.type]: {
              data: formatInstanceMonitor(res.data),
            },
          },
        },
      })
    },
    * fetchProcessList({ payload: { query } }, { call, select, put }) {
      yield put({
        type: 'updateState',
        payload: {
          process: [],
        },
      })
      const { app: { cluster }, nativeDetail: { name } } = yield select(state => state)
      const res = yield call(getProcessList, { cluster, name, query })
      if (res.data) {
        yield put({
          type: 'updateState',
          payload: {
            process: res.data || [],
          },
        })
      }
      return res
    },
    * fetchPodDetail(_, { call, select, put }) {
      yield put({
        type: 'updateState',
        payload: {
          podDetail: {},
        },
      })
      const { app: { cluster }, nativeDetail: { name } } = yield select(state => state)
      const res = yield call(getPodDetail, { cluster, instance: name })
      if (res.data) {
        yield put({
          type: 'updateState',
          payload: {
            podDetail: res.data,
          },
        })
      }
      return res
    },
  },
}
