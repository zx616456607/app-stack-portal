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

import { deployAppstack, appStacksListRequest, templateListRequest } from '../services/appStack'
import { notification } from 'antd/lib/index';

export default {
  namespace: 'appStack',
  state: {},
  reducers: {
    appStackList(state, { payload }) {
      return { ...state, ...payload }
    },
    appStackTemplateList(state, { payload }) {
      return { ...state, ...payload }
    },
  },
  effects: {
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
            appStacks: res.data,
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
  },
}
