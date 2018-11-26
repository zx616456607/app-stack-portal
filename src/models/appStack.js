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

import { deployAppstack, templateListRequest } from '../services/appStack'

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
    * fetchAppStackList({ put }) {
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
          data: listMock,
        },
      })
    },
    * fetchAppStackTemplate({ cluster, query }, { call, put }) {
      const res = yield call(templateListRequest, { cluster, query })
      const listMock = [
        {
          name: 'myAppStack1',
          appCount: 6,
          serviceCount: 22245634565434532415442,
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
          containerCount: 22245634565434532415442,
        },
        {
          name: 'myAppStack4',
          appCount: 6,
          serviceCount: 22245634565434532415442,
          containerCount: 22245634565434532415442,
        },
      ]
      const data = {
        appStacks: listMock,
        total: 5,
      }
      if (res.code === 200) {
        yield put({
          type: 'appStackTemplateList',
          payload: {
            // templateList: res.data
            templateList: data,
          },
        })
      }
    },
  },
}
