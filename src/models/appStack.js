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

import { deployAppstack } from '../services/appStack'

export default {
  namespace: 'appStack',
  state: {},
  effects: {
    * fetchDeployAppstack({ payload: { cluster, name, body } }, { call }) {
      const res = yield call(deployAppstack, {
        cluster, name, body,
      })
      return res
    },
  },
}
