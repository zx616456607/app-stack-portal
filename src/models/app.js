/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * model of app
 *
 * @author zhangpc
 * @date 2018-05-24
 */
/* global window */
/* global document */
/* global location */
/* eslint no-restricted-globals: ["error", "event"] */

import { getUnifiedHistory } from '@tenx-ui/utils/es/UnifiedLink'
import { Icon } from 'antd'
import config from '../utils/config'
import { delay } from '../utils/helper'
import {
  auth as authService,
  getUserById,
  getAuthData,
  setAuthData,
  // removeAuthData,
} from '../services/app'
import queryString from 'query-string'
import {
  AppStack as AppStackIcon,
  Network as NetworkIcon,
  Stack as StackIcon,
} from '@tenx-ui/icon'

const { prefix } = config
const watcher = { type: 'watcher' }

function* _authorize(_, { select, call, put }) {
  const { locationPathname, locationQuery } = yield select(__ => __.app)
  const {
    username, token, jwt, project, cluster, onbehalfuser, onbehalfuserid, watchToken, harbor,
    redirect, ...otherQuery
  } = locationQuery
  const { data: jwtToken } = yield call(authService, { username, token, jwt })
  const payload = Object.assign({}, getAuthData(), { jwtToken })
  if (project) {
    payload.project = project
    payload.onbehalfuser = null
  } else if (onbehalfuser) {
    payload.onbehalfuser = onbehalfuser
    payload.onbehalfuserid = onbehalfuserid
    payload.project = null
  } else if (username && token) {
    payload.project = null
    payload.onbehalfuser = null
    payload.onbehalfuserid = null
  }
  if (cluster) {
    payload.cluster = cluster
  }
  if (watchToken) payload.watchToken = watchToken
  if (harbor) payload.harbor = harbor
  setAuthData(payload)
  yield put({
    type: 'updateState',
    payload,
  })
  const unifiedHistory = getUnifiedHistory()
  if (redirect) {
    unifiedHistory.replace(redirect)
  } else {
    const queryStr = queryString.stringify(otherQuery)
    const search = queryStr && `?${queryStr}`
    unifiedHistory.replace({
      pathname: locationPathname,
      search,
    })
  }
  const { data: user } = yield call(getUserById, jwtToken.userID)
  yield put({
    type: 'updateState',
    payload: { user },
  })
  return jwtToken
}

export default {
  namespace: 'app',
  state: {
    user: {},
    menu: [
      {
        text: '工作负载',
        icon: <AppStackIcon style={{ marginRight: 8 }} />,
        key: 'workloads',
        type: 'SubMenu',
        children: [
          {
            text: 'Deployment',
            icon: <Icon type="bulb" />,
            key: 'Deployment',
            to: '/workloads/Deployment',
          },
          {
            text: 'StatefulSet',
            icon: <Icon type="bulb" />,
            key: 'StatefulSet',
            to: '/workloads/StatefulSet',
          },
          {
            text: 'Job',
            icon: <Icon type="bulb" />,
            key: 'Job',
            to: '/workloads/Job',
          },
          {
            text: 'CronJob',
            icon: <Icon type="bulb" />,
            key: 'CronJob',
            to: '/workloads/CronJob',
          },
          {
            text: 'Pod',
            icon: <Icon type="bulb" />,
            key: 'Pod',
            to: '/workloads/Pod',
          },
        ],
      },
      {
        text: '服务发现',
        icon: <NetworkIcon style={{ marginRight: 8 }} />,
        key: 'net-management',
        type: 'SubMenu',
        children: [
          {
            text: 'Service',
            icon: <Icon type="bulb" />,
            key: 'Service',
            to: '/net-management/Service',
          },
        ],
      },
      {
        text: '堆栈',
        icon: <StackIcon style={{ marginRight: 8 }} />,
        key: 'app-stack',
        type: 'SubMenu',
        children: [
          {
            text: '堆栈',
            key: 'app-stack',
            icon: <Icon type="bulb" />,
            to: '/app-stack',
          },
          {
            text: '堆栈模板',
            key: 'app-stack-templates',
            icon: <Icon type="bulb" />,
            to: '/app-stack/templates',
          },
          {
            text: 'Designer',
            key: 'designer',
            icon: <Icon type="bulb" />,
            to: '/app-stack/designer',
          },
        ],
      },
      /* {
        text: 'test',
        icon: <Icon type="bulb" />,
        key: 'test',
        to: '/workloads/test',
      },
      {
        text: '404',
        icon: <Icon type="ie" />,
        key: '404',
        to: '/workloads/404',
      }, */
    ],
    siderFold: window.localStorage.getItem(`${prefix}siderFold`) === 'true',
    locationPathname: '',
    locationQuery: {},
  },
  subscriptions: {
    setupHistory({ dispatch, history }) {
      history.listen(location => {
        dispatch({
          type: 'updateState',
          payload: {
            locationPathname: location.pathname,
            locationQuery: queryString.parse(location.search),
          },
        })
      })
    },
  },
  effects: {
    * authorize(_, { select, call, put }) {
      yield* _authorize(_, { select, call, put })
    },
    authWatcher: [ function* ({ race, call, take, put, select }) {
      while (true) {
        yield take('authorize')
        yield delay({ timeout: 2000 })

        let { jwtToken } = yield select(_ => _.app)
        // authorization failed, wait the next auth
        if (!jwtToken || !jwtToken.token) continue

        let userSignedOut
        while (!userSignedOut) {
          // wait until the token expires one minute before
          const wait = delay({
            timeout: (jwtToken.expiresIn - 60) * 1000,
          })
          const { expired } = yield race({
            expired: wait,
            signout: take('signout'),
          })
          // token expired first
          if (expired) {
            jwtToken = yield _authorize(null, { select, call, put })
          } else {
            // @Todo: user signed out before token expiration
            userSignedOut = true // breaks the loop
            yield call('signout')
          }
        }
      }
    }, watcher ],
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },

    switchSider(state) {
      window.localStorage.setItem(`${prefix}siderFold`, !state.siderFold)
      return {
        ...state,
        siderFold: !state.siderFold,
      }
    },
  },
}
