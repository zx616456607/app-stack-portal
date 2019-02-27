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
  const routes = [
    {
      path: '/workloads/*/createWorkLoad',
      component: () => import('./containers/CreateWorkLoad'),
      models: () => [
        import('./models/createNativeResource'),
        import('./models/nativeResourceList'),
      ],
    },
    {
      path: '/workloads/Deployment',
      component: () => import('./containers/Deployment'),
      models: () => [
        import('./models/nativeResourceList'),
      ],
    },
    {
      path: '/workloads/Deployment/:id',
      exact: false,
      component: () => import('./containers/Detail'),
      models: () => [
        import('./models/nativeDetail'),
      ],
    },
    {
      path: '/workloads/StatefulSet',
      component: () => import('./containers/StatefulSet'),
      models: () => [
        import('./models/nativeResourceList'),
      ],
    },
    {
      path: '/workloads/StatefulSet/:id',
      exact: false,
      component: () => import('./containers/Detail'),
      models: () => [
        import('./models/nativeDetail'),
      ],
    },
    {
      path: '/workloads/Job',
      exact: true,
      component: () => import('./containers/Job/List'),
      models: () => [
        import('./models/nativeResourceList'),
      ],
    },
    {
      path: '/workloads/Job/:id',
      exact: false,
      component: () => import('./containers/Detail'),
      models: () => [
        import('./models/nativeDetail'),
      ],
    },
    {
      path: '/workloads/CronJob',
      component: () => import('./containers/CronJob/index.tsx'),
      models: () => [
        import('./models/nativeResourceList'),
      ],
    },
    {
      path: '/workloads/CronJob/:id',
      exact: false,
      component: () => import('./containers/Detail'),
      models: () => [
        import('./models/nativeDetail'),
      ],
    },
    {
      path: '/workloads/Pod',
      component: () => import('./containers/Pod/index.tsx'),
      models: () => [
        import('./models/nativeResourceList'),
        import('./models/nativeDetail'),
      ],
    },
    {
      path: '/workloads/Pod/:id',
      exact: false,
      component: () => import('./containers/Detail'),
      models: () => [
        import('./models/nativeDetail'),
      ],
    },
    {
      path: '/net-management/Service',
      component: () => import('./containers/ServiceDiscovery'),
      models: () => [
        import('./models/nativeResourceList'),
      ],
    },
    {
      path: '/net-management/Service/:id',
      exact: false,
      component: () => import('./containers/Detail'),
      models: () => [
        import('./models/nativeDetail'),
      ],
    },
    /* {
      path: '/test',
      component: () => import('./containers/Test'),
    }, */
    {
      path: '/cluster/createWorkLoad',
      component: () => import('./containers/CreateWorkLoad'),
      models: () => [
        import('./models/createNativeResource'),
        import('./models/nativeResourceList'),
      ],
    },
    {
      path: '/app-stack',
      component: () => import('./containers/AppStack/StackApps'),
      models: () => [
        import('./models/appStack'),
      ],
    },
    {
      path: '/app-stack/appStackDetail/:name',
      exact: false,
      component: () => import('./containers/AppStack/StackApps/StackAppsDetail'),
      models: () => [
        import('./models/appStack'),
        import('./models/nativeDetail'),
      ],
    },
    {
      path: '/app-stack/templates',
      component: () => import('./containers/AppStack/Templates'),
      models: () => [
        import('./models/appStack'),
      ],
    },
    {
      path: '/app-stack/templates/:name/deploy',
      component: () => import('./containers/AppStack/Templates/Deploy'),
      models: () => [
        import('./models/appStack'),
      ],
    },
    {
      path: '/app-stack/designer',
      component: () => import('./containers/AppStack/Designer'),
      models: () => [
        import('./models/appStack'),
      ],
    },
    {
      path: '/app-stack/designer/:name/edit',
      component: () => import('./containers/AppStack/Designer'),
      models: () => [
        import('./models/appStack'),
      ],
    },
  ]
  return (
    <ConnectedRouter history={history}>
      <LocaleProvider locale={zhCN}>
        <App>
          <Switch>
            <Route exact path="/" render={() => (<Redirect to="/workloads/StatefulSet" />)} />
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
