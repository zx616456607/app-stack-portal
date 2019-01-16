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
  getServiceEvent,
  getServiceMonitor,
  getProcessList,
  getPodDetail,
  redistributionPod,
  getPodEvent,
  deleteNativeResourceList,
} from '../services/nativeDetail'
import {
  formatMonitorName,
  formatPodMonitor,
} from '../utils/helper'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import cloneDeep from 'lodash/cloneDeep'
import { DOCK_DEFAULT_SIZE } from '../utils/constants'

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
    dockSize: DOCK_DEFAULT_SIZE,
    dockVisible: false,
    dockContainer: '',
    dockName: '',
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
      if (instances.length === 0) {
        return
      }
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
    * fetchServiceEvent({ payload }, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          events: [],
        },
      })
      const resPod = yield call(getServiceEvent, payload)
      yield put({
        type: 'updateState',
        payload: {
          events: getDeepValue(resPod, 'data.events'.split('.')) || [],
        },
      })
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
          events: getDeepValue(resPod, 'data.events'.split('.')) || [],
        },
      })
    },
    * fetchMonitor({ payload: { cluster, name, query } }, { call, put, select }) {
      const {
        app: { project },
      } = yield select(state => state)
      const res = yield call(getServiceMonitor, { cluster, name, query, project })
      const {
        nativeDetail: { monitor },
      } = yield select(state => state)
      const result = formatPodMonitor(cloneDeep(res))
      yield put({
        type: 'updateState',
        payload: {
          monitor: {
            ...monitor,
            [query.type]: {
              data: formatMonitorName(result.data),
            },
          },
        },
      })
    },
    * fetchRealTimeMonitor(
      { payload: { cluster, name, query } },
      { call, put, select }
    ) {
      const {
        app: { project },
      } = yield select(state => state)
      const res = yield call(getServiceMonitor, { cluster, name, query, project })
      const { nativeDetail: { realTimeMonitor } } = yield select(state => state)
      const result = formatPodMonitor(cloneDeep(res))
      yield put({
        type: 'updateState',
        payload: {
          realTimeMonitor: {
            ...realTimeMonitor,
            [query.type]: {
              data: formatMonitorName(result.data),
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
    * redistributionPod({ payload: { body, force } }, { call, select }) {
      const { app: { cluster } } = yield select(state => state)
      const res = yield call(redistributionPod, {
        cluster,
        body,
        force,
      })
      return res
    },
    * deleteNativeResourceList({ payload }, { call }) {
      const res = yield call(deleteNativeResourceList, payload)
      return res
    },
  },
}
