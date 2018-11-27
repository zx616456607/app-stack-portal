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
  deployAppstack,
  appStacksListRequest,
  templateListRequest,
  appStacksStartRequest,
  appStacksStopRequest,
  appStacksDeleteRequest,
  appStacksDetailRequest,
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
    * fetchDeployAppstack({ payload: { cluster, name, body } }, { call }) {
      const res = yield call(deployAppstack, {
        cluster, name, body,
      })
      return res
    },
    * fetchAppStackList({ payload: { cluster, query } }, { call, put }) {
      try {
        const res = yield call(appStacksListRequest, { cluster, query })
        /*        const listMock = [
          {
            name: 'myAppStack1',
            appCount: 6,
            serviceCount: 69988,
            containerCount: 2225442,
          },
          {
            name: 'myAppStack2',
            appCount: 6,
            serviceCount: 69988,
            containerCount: 2225442,
          },
          {
            name: 'myAppStack3',
            appCount: 6,
            serviceCount: 69988,
            containerCount: 2225442,
          },
          {
            name: 'myAppStack4',
            appCount: 6,
            serviceCount: 69988,
            containerCount: 2225442,
          },
        ]*/
        yield put({
          type: 'appStackList',
          payload: {
            // appStacks: listMock,
            appStacks: res.data.appStacks,
          },
        })
      } catch (e) {
        notification.error({ message: '获取堆栈列表失败', description: '' })
        const listMock = [
          {
            name: 'myAppStack1',
            appCount: 6,
            serviceCount: 69988,
            containerCount: 2225442,
          },
          {
            name: 'myAppStack2',
            appCount: 6,
            serviceCount: 69988,
            containerCount: 2225442,
          },
          {
            name: 'myAppStack3',
            appCount: 6,
            serviceCount: 69988,
            containerCount: 2225442,
          },
          {
            name: 'myAppStack4',
            appCount: 6,
            serviceCount: 69988,
            containerCount: 2225442,
          },
        ]
        yield put({
          type: 'appStackList',
          payload: {
            appStacks: listMock,
            // appStacks: res.data,
          },
        })
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
