/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * router
 *
 * @author zhangpc
 * @date 2018-05-24
 */
import React from 'react'
import { Switch, Route, Redirect, routerRedux } from 'dva/router'
import dynamic from 'dva/dynamic'
import { LocaleProvider } from 'antd'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import App from './containers/App'

const { ConnectedRouter } = routerRedux

function RouterConfig({ history, app }) {
  const error = dynamic({
    app,
    component: () => import('./containers/Error'),
  })
  const routes = [{
    path: '/stateful-set',
    component: () => import('./containers/StatefulSet'),
  }, {
    path: '/job',
    exact: false,
    component: () => import('./containers/Job'),
  }, {
    path: '/cron-job',
    component: () => import('./containers/CronJob'),
  }, {
    path: '/test',
    component: () => import('./containers/Test'),
  }, {
    path: '/createWorkLoad',
    component: () => import('./containers/CreateWorkLoad'),
  },
  ]
  return (
    <ConnectedRouter history={history}>
      <LocaleProvider locale={zhCN}>
        <App>
          <Switch>
            <Route exact path="/" render={() => (<Redirect to="/stateful-set" />)} />
            {
              routes.map(({ path, exact, render, ...dynamics }, key) => {
                const routeProps = {
                  key,
                  exact: (exact === undefined ? true : exact),
                  path,
                  render,
                }
                if (!render) {
                  routeProps.component = dynamic({
                    app,
                    ...dynamics,
                  })
                }
                return <Route {...routeProps} />
              })
            }
            <Route component={error} />
          </Switch>
        </App>
      </LocaleProvider>
    </ConnectedRouter>
  )
}

export default RouterConfig
