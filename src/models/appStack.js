/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * model of appStack
 *
 * @author zhangpc
 * @date 2018-11-16
 */

import {
  createAppstack,
  updateAppstack,
  getAppstackConfigs,
  deployAppstack,
  appStacksListRequest,
  templateListRequest,
  appStacksStartRequest,
  appStacksStopRequest,
  appStacksDeleteRequest,
  appStacksDetailRequest,
  appStacksEventsRequest,
  templateDetailRequest,
  templateDeleteRequest,
} from '../services/appStack'

export default {
  namespace: 'appStack',
  state: {},
  reducers: {
    appStackList(state, { payload }) {
      return { ...state, ...payload }
    },
    appStackDetail(state, { payload }) {
      return { ...state, ...payload }
    },
    appStackTemplateList(state, { payload }) {
      return { ...state, ...payload }
    },
    appStackConfigs(state, { payload }) {
      const appStackConfigs = Object.assign({}, state.appStackConfigs, payload)
      return { ...state, appStackConfigs }
    },
  },
  effects: {
    * fetchCreateAppstack({ payload: { name, body } }, { call }) {
      const res = yield call(createAppstack, {
        name, body,
      })
      return res
    },
    * fetchUpdateAppstack({ payload: { name, body } }, { call }) {
      const res = yield call(updateAppstack, {
        name, body,
      })
      return res
    },
    * fetchAppstackConfigs({ payload: { configType, query } }, { call, put }) {
      const res = yield call(getAppstackConfigs, {
        configType, query,
      })
      yield put({
        type: 'appStackConfigs',
        payload: {
          [configType]: res.data.data,
        },
      })
      return res
    },
    * fetchDeployAppstack({ payload: { cluster, name, body } }, { call }) {
      const res = yield call(deployAppstack, {
        cluster, name, body,
      })
      return res
    },
    * fetchAppStackList({ payload: { cluster, query } }, { call, put }) {
      const res = yield call(appStacksListRequest, { cluster, query })
      yield put({
        type: 'appStackList',
        payload: {
          appStacks: {
            list: res.data.appStacks,
            total: res.data.total,
          },
        },
      })
    },
    * fetchAppStackTemplate({ payload: { query } }, { call, put }) {
      const res = yield call(templateListRequest, { query })
      if (res.code === 200) {
        yield put({
          type: 'appStackTemplateList',
          payload: {
            template: {
              list: res.data.appStacks,
              total: res.data.total,
            },

          },
        })
      }
    },
    * fetchAppStackTemplateDelete({ payload: { name } }, { call }) {
      const res = yield call(templateDeleteRequest, name)
      return res
    },
    * fetchAppStackTemplateDetail({ payload: { name } }, { call, put }) {
      const res = yield call(templateDetailRequest, name)
      if (res.code === 200) {
        yield put({
          type: 'appStackTemplateList',
          payload: {
            templateDetail: res.data,
          },
        })
      }
    },
    * clearAppStackTemplateDetail(_, { put }) {
      yield put({
        type: 'appStackTemplateList',
        payload: {
          templateDetail: {},
        },
      })
    },
    * fetchAppStackDetail({ payload: { cluster, name } }, { call, put }) {
      const res = yield call(appStacksDetailRequest, { cluster, name })
      if (res.code === 200) {
        yield put({
          type: 'appStackDetail',
          payload: {
            appStacksDetail: res.data,
          },
        })
      }
    },
    * fetchAppStackEvents({ payload: { cluster, name } }, { call, put }) {
      const res = yield call(appStacksEventsRequest, { cluster, name })
      if (res.code === 200) {
        yield put({
          type: 'appStackDetail',
          payload: {
            appStackEvents: res.data,
          },
        })
      }
      return res
    },
    * stackStart({ payload: { cluster, name } }, { call }) {
      const res = yield call(appStacksStartRequest, { cluster, name })
      return res
    },
    * stackStop({ payload: { cluster, name } }, { call }) {
      const res = yield call(appStacksStopRequest, { cluster, name })
      return res
    },
    * stackDelete({ payload: { cluster, name } }, { call }) {
      const res = yield call(appStacksDeleteRequest, { cluster, name })
      return res
    },
  },
}
