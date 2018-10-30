/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * Job container
 *
 * @author Songsz
 * @date 2018-10-29
 *
*/

import React from 'react'
import { connect } from 'dva'
import { Switch, Route, routerRedux } from 'dva/router'
import { Tabs } from 'antd'
import Page from '@tenx-ui/page'
import ReturnButton from '@tenx-ui/return-button'
import DetailHeader from './Header'
import styles from './style/index.less'

const TabPane = Tabs.TabPane

const mapStateToProps = ({ nativeDetail: { type, name } }) => ({ type, name })

@connect(mapStateToProps)
class NativeDetail extends React.PureComponent {
  async componentDidMount() {
    const { match: { params, path }, dispatch } = this.props
    await dispatch({
      type: 'nativeDetail/updateState',
      payload: {
        type: path.split('/').filter(i => i !== '')[0],
        name: params.id,
      },
    })
    dispatch({
      type: 'nativeDetail/fetchNativeDetail',
    })
  }
  onTabChange = (key, id, dispatch, type) => {
    let _pathname = `/${type}/${id}/${key}`
    if (key === 'default') {
      _pathname = _pathname.replace(/\/default$/, '')
    }
    dispatch(routerRedux.push({
      pathname: _pathname,
    }))
  }
  getActiveKey = (pathname, routes) => {
    let activeKey = 'default'
    const pathList = pathname.split('/').filter(item => item !== '')
    if (pathList.length > 2) {
      const rtList = []
      routes.map(rt => rtList.push(rt.tabKey))
      activeKey = rtList.includes(pathList[2]) ? pathList[2] : 'default'
    }
    return activeKey
  }
  getRoutes = type => {
    return [
      {
        path: `/${type}/:id`,
        component: require('./Pods').default,
        tabName: 'Pods',
        tabKey: 'default',
      },
      {
        path: `/${type}/:id/yaml`,
        component: require('./Yaml').default,
        tabName: 'Yaml',
        tabKey: 'yaml',
      },
    ]
  }
  render() {
    const { dispatch, children, location: { pathname }, history, type, name } = this.props
    const routes = this.getRoutes(type)
    return (
      <div>
        <ReturnButton onClick={history.goBack}>返回</ReturnButton>
        <DetailHeader/>
        <Page inner className={styles.page}>
          <div>
            <Tabs
              activeKey={this.getActiveKey(pathname, routes)}
              onChange={key => this.onTabChange(key, name, dispatch, type)}
            >
              {
                routes.map(rt =>
                  <TabPane tab={<div className={styles.tabs}>{rt.tabName}</div>} key={rt.tabKey} />
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

NativeDetail.propTypes = {
  //
}

export default NativeDetail
