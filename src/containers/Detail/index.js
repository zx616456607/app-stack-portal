/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * Detail container
 *
 * @author Songsz
 * @date 2018-10-29
 *
*/

import React from 'react'
import { connect } from 'dva'
import { Switch, Route } from 'dva/router'
import { Tabs, notification, Spin } from 'antd'
import DetailHeader from './Header/index'
import styles from './style/index.less'
import Terminal from './Terminal'
import { historyPush } from '@tenx-ui/utils/es/UnifiedLink'

const TabPane = Tabs.TabPane

const mapStateToProps = (
  { nativeDetail: { type, name, dockVisible } }) => ({ type, name, dockVisible })

@connect(mapStateToProps)
class NativeDetail extends React.PureComponent {
  constructor(props) {
    super(props)
    const { match: { path } } = this.props
    this.type = path.split('/').filter(i => i !== '')[1]
    this.pathPrefix = this.type === 'Service' ? '/net-management' : '/workloads'
  }

  async componentDidMount() {
    const { match: { params }, dispatch } = this.props
    await dispatch({
      type: 'nativeDetail/updateState',
      payload: {
        type: this.type,
        name: params.id,
      },
    })
    dispatch({
      type: 'nativeDetail/fetchNativeDetail',
    }).catch(() => notification.warn({ message: '获取应用详情出错' }))
  }
  componentWillUnmount() {
    const { dispatch } = this.props
    dispatch({
      type: 'nativeDetail/updateState',
      payload: {
        type: '',
        name: '',
      },
    })
  }
  onTabChange = (key, id, dispatch, type) => {
    let _pathname = `${this.pathPrefix}/${type}/${id}/${key}`
    if (key === 'default') {
      _pathname = _pathname.replace(/\/default$/, '')
    }
    historyPush(_pathname)
  }
  getActiveKey = (pathname, routes) => {
    let activeKey = 'default'
    const pathList = pathname.split('/').filter(item => item !== '')
    if (pathList.length > 3) {
      const rtList = []
      routes.map(rt => rtList.push(rt.tabKey))
      activeKey = rtList.includes(pathList[3]) ? pathList[3] : 'default'
    }
    return activeKey
  }
  getRoutes = type => {
    const res = []
    if (type === 'Pod') {
      res.push({
        path: `${this.pathPrefix}/${type}/:id`,
        component: require('./Config').default,
        tabName: '配置',
        tabKey: 'default',
      })
    }
    if (type !== 'Pod') {
      res.push({
        path: `${this.pathPrefix}/${type}/:id`,
        component: require('./Pods').default,
        tabName: type === 'CronJob' ? '执行记录' : 'Pods',
        tabKey: 'default',
      }, {
        path: `${this.pathPrefix}/${type}/:id/yaml`,
        component: require('./Yaml').default,
        tabName: 'Yaml',
        tabKey: 'yaml',
      })
    }
    if (type !== 'CronJob') { // [KK-1585]
      res.push({
        path: `${this.pathPrefix}/${type}/:id/monitor`,
        component: require('./Monitor').default,
        tabName: '监控',
        tabKey: 'monitor',
        tabDisabled: type === 'CronJob',
      })
    }
    if (type === 'Pod') {
      res.push({
        path: `${this.pathPrefix}/${type}/:id/log`,
        component: require('./PodLog/PodLogWebsocket').default,
        tabName: '日志',
        tabKey: 'log',
      })
    }
    if (type !== 'Pod') {
      res.push({
      //   path: `${this.pathPrefix}/${type}/:id/alarm`,
      //   component: require('./Alarm').default,
      //   tabName: '告警',
      //   tabKey: 'alarm',
      //   tabDisabled: true,
      // }, {
        path: `${this.pathPrefix}/${type}/:id/log`,
        component: require('./Log').default,
        tabName: '日志',
        tabKey: 'log',
      })
    }

    res.push(
      {
        path: `${this.pathPrefix}/${type}/:id/event`,
        component: require('./Event').default,
        tabName: '事件',
        tabKey: 'event',
      })
    if (type === 'Pod') {
      res.push({
        path: `${this.pathPrefix}/${type}/:id/process`,
        component: require('./Process').default,
        tabName: '进程',
        tabKey: 'process',
      })
    }
    return res
  }

  render() {
    const { dispatch, children, location: { pathname }, type, name, dockVisible } = this.props
    if (!type || !name) return <Spin/>
    const routes = this.getRoutes(type)
    return (
      <div>
        <DetailHeader/>
        <div className={styles.page}>
          <div>
            <Tabs
              activeKey={this.getActiveKey(pathname, routes)}
              onChange={key => this.onTabChange(key, name, dispatch, type)}
            >
              {
                routes.map(rt =>
                  <TabPane
                    tab={<div className={styles.tabs}>{rt.tabName}</div>}
                    key={rt.tabKey}
                    disabled={rt.tabDisabled}
                  />
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
          {
            dockVisible &&
            <Terminal/>
          }
        </div>
      </div>
    )
  }
}

NativeDetail.propTypes = {
  //
}

export default NativeDetail
