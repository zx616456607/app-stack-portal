/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * entry of src
 *
 * @author zhangpc
 * @date 2018-05-24
 */
import '@babel/polyfill'
import dva from 'dva'
// 为自定义 iconfont 以及 @tenx-ui 的 moudule 在此统一引入 antd 样式
import 'antd/dist/antd.less'
import createLoading from 'dva-loading'
import createHistory from 'history/createBrowserHistory'
import { notification } from 'antd'
import './assets/style/index.less'
import { confirm } from '@tenx-ui/modal'
import '@tenx-ui/modal/assets/index.css'
import 'antd/lib/modal/style'
import '@tenx-ui/icon/assets/index.css'
import '@tenx-ui/page/assets/index.css'
import '@tenx-ui/ellipsis/assets/index.css'
import '@tenx-ui/return-button/assets/index.css'
import '@tenx-ui/logs/assets/index.css'
const isProd = process.env.NODE_ENV === 'production'

/* const logger = store => next => action => {
  console.log('dispatching', action)
  const result = next(action)
  console.log('next state', store.getState())
  return result
}*/

// 1. Initialize
// 开发时使用 `browserHistory`, 嵌入 `iframe` 时使用 `hashHistory`,
// @Todo：后面替换 `iframe` 嵌入方案后统一使用 `browserHistory`
const dvaOpts = {}
if (!isProd) {
  dvaOpts.history = createHistory()
}
const app = dva({
  ...dvaOpts,
  // handle global error here
  onError(e) {
    const { status, response = {} } = e

    // [global] 401 handle token expired
    if (status === 401 && response.err === 'User is not authorized. Authorization, token are required.') {
      notification.warn({
        message: '您的登录状态已失效',
        description: '请登录后继续当前操作',
      })
      // 阻止后续的 reject 操作，即后续 `action` 中的错误处理将不会执行
      // 这样可以避免同一个错误被多次处理
      // @Todo: 可能会有问题
      e.preventDefault()
      return
    }

    // [global] 403 handle resource permission
    if (status === 403 && response.details && response.details.kind === 'ResourcePermission') {
      confirm({
        modalTitle: '当前操作未被授权',
        title: '当前操作未被授权，请联系管理员进行授权后，再进行操作',
        hideCancel: true,
        iconType: 'exclamation-circle-o',
        onOk() {},
        onCancel() {},
      })
      e.preventDefault()
      return
    }
    // message.warn(e.status + ' ' + e.message)
  },
  // onAction: logger,
})

// 2. Plugins
// ～ dva-loading
app.use(createLoading({
  effects: true,
}))

// 3. Model
app.model(require('./models/app').default)
app.model(require('./models/paas').default)
// 4. Router
app.router(require('./router').default)

// 5. Start
app.start('#root')
