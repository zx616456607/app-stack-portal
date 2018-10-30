/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 *
 * Detail Frame
 *
 * @author Songsz
 * @date 2018-10-29
 *
 */

import React from 'react'
import { connect } from 'dva'
import { Switch, Route, routerRedux, withRouter } from 'dva/router'
import { Tabs } from 'antd'
import Page from '@tenx-ui/page'
import ReturnButton from '@tenx-ui/return-button'
import styles from './style/index.less'

const TabPane = Tabs.TabPane

const routes = [
  {
    pathname: '/job/:id',
    component: require('../../Job/Detail/Pods').default,
    tabName: 'Pods',
    tabKey: 'default',
  }, {
    component: require('../../Job/Detail/Yaml').default,
    tabName: 'Yaml',
    tabKey: 'yaml',
  },
]

const getFullRoutes = (_routes, prefix) => {
  _routes.map((route, index) => {
    _routes[index] = { ...route, path: route.tabKey === 'default' ? prefix : prefix + route.tabKey }
    return null
  })
  return _routes
}

class Detail extends React.PureComponent {
  state = {
    activeTabKey: 'default',
  }
  componentDidMount() {
    this.setActiveKey()
  }
  setActiveKey = path => {
    const { location, routePrefix } = this.props
    const pathname = path || location.pathname
    const fullRoutes = getFullRoutes(routes, routePrefix)
    const lth = routePrefix.split('/').filter(i => i !== '').length
    let activeKey = 'default'
    const pathList = pathname.split('/').filter(item => item !== '')
    if (pathList.length > lth) {
      const tabRoute = []
      fullRoutes.map(route => tabRoute.push(route.tabKey))
      activeKey = tabRoute.includes(pathList[lth]) ? pathList[lth] : 'default'
    }
    this.setState({
      activeTabKey: activeKey,
    })
    return activeKey
  }
  onTabChange = (key, id, dispatch, prefix) => {
    let _pathname = ''
    const list = prefix.split('/').filter(i => i !== '')
    list.map(pr => (_pathname += `/${pr.indexOf(':') > -1 ? id : pr}`))
    _pathname = `${_pathname}/${key}`
    if (key === 'default') {
      _pathname = _pathname.replace(/\/default$/, '')
    }
    dispatch(routerRedux.push({
      pathname: _pathname,
    }))
    this.setActiveKey(_pathname)
  }
  render() {
    const {
      dispatch, match, children,
      history, routePrefix, header,
    } = this.props
    const fullRoutes = getFullRoutes(routes, routePrefix)
    const { id } = match.params
    return (
      <div>
        <ReturnButton onClick={history.goBack}>返回</ReturnButton>
        {header()}
        <Page inner className={styles.page}>
          <div>
            <Tabs
              activeKey={this.state.activeTabKey}
              onChange={key => this.onTabChange(key, id, dispatch, routePrefix)}>
              {
                fullRoutes.map(route =>
                  <TabPane
                    key={route.tabKey}
                    tab={<div className={styles.tabs}>{route.tabName}</div>}/>
                )
              }
            </Tabs>
            {children}
            <Switch>
              {
                routes.map((config, key) => <Route exact key={key} {...config} />)
              }
            </Switch>
          </div>
        </Page>
      </div>
    )
  }
}

Detail.propTypes = {
  //
}

export default connect()(withRouter(Detail))
