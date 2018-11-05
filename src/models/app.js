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

import { routerRedux } from 'dva/router'
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

const { prefix } = config
const watcher = { type: 'watcher' }

function* _authorize(_, { select, call, put }) {
  const { locationPathname, locationQuery } = yield select(__ => __.app)
  const {
    username, token, jwt, project, cluster, onbehalfuser, onbehalfuserid,
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
  setAuthData(payload)
  yield put({
    type: 'updateState',
    payload,
  })
  if (redirect) {
    yield put(routerRedux.replace(redirect))
  } else {
    yield put(routerRedux.replace({
      pathname: locationPathname,
      search: queryString.stringify(otherQuery),
    }))
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
        text: 'Deployment',
        icon: <Icon type="bulb" />,
        key: 'Deployment',
        to: '/Deployment',
      },
      {
        text: 'StatefulSet',
        icon: <Icon type="bulb" />,
        key: 'StatefulSet',
        to: '/StatefulSet',
      },
      {
        text: 'Job',
        icon: <Icon type="bulb" />,
        key: 'Job',
        to: '/Job',
      },
      {
        text: 'CronJob',
        icon: <Icon type="bulb" />,
        key: 'CronJob',
        to: '/CronJob',
      },
      {
        text: 'Pod',
        icon: <Icon type="bulb" />,
        key: 'Pod',
        to: '/Pod',
      },
      {
        text: 'test',
        icon: <Icon type="bulb" />,
        key: 'test',
        to: '/test',
      },
      {
        text: '404',
        icon: <Icon type="ie" />,
        key: '404',
        to: '/404',
      },
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
