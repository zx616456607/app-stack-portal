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
  deployAppstack,
  appStacksListRequest,
  templateListRequest,
  appStacksStartRequest,
  appStacksStopRequest,
  appStacksDeleteRequest,
  appStacksDetailRequest,
  templateDetailRequest,
} from '../services/appStack'
import { notification } from 'antd/lib/index';

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
    * fetchDeployAppstack({ payload: { cluster, name, body } }, { call }) {
      const res = yield call(deployAppstack, {
        cluster, name, body,
      })
      return res
    },
    * fetchAppStackList({ payload: { cluster, query } }, { call, put }) {
      try {
        const res = yield call(appStacksListRequest, { cluster, query })
        yield put({
          type: 'appStackList',
          payload: {
            appStacks: res.data.appStacks,
          },
        })
      } catch (e) {
        notification.error({ message: '获取堆栈列表失败', description: '' })
      }
    },
    * fetchAppStackTemplate({ payload: { query } }, { call, put }) {
      try {
        const res = yield call(templateListRequest, { query })
        if (res.code === 200) {
          yield put({
            type: 'appStackTemplateList',
            payload: {
              templateList: res.data.appStacks,
            },
          })
        }
      } catch (e) {
        notification.error({ message: '获取堆栈模板列表失败', description: '' })
      }
    },
    * fetchAppStackTemplateDetail({ payload: { name } }, { call, put }) {
      try {
        const res = yield call(templateDetailRequest, name)
        if (res.code === 200) {
          yield put({
            type: 'appStackTemplateList',
            payload: {
              templateDetail: res.data,
            },
          })
        }
      } catch (e) {
        notification.error({ message: '获取堆栈模板详情失败', description: '' })
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
      try {
        const res = yield call(appStacksDetailRequest, { cluster, name })
        if (res.code === 200) {
          yield put({
            type: 'appStackDetail',
            payload: {
              appStacksDetail: res.data,
            },
          })
        }
      } catch (e) {
        notification.error({ message: '获取堆栈详情失败', description: '' })
      }
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
