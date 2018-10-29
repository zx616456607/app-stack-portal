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

const routes = [
  {
    path: '/job/:id',
    component: require('./Pods').default,
  },
  {
    path: '/job/:id/yaml',
    component: require('./Yaml').default,
  },
]

const getActiveKey = pathname => {
  let activeKey = 'default'
  const pathList = pathname.split('/').filter(item => item !== '')
  if (pathList.length > 2) {
    activeKey = [ 'yaml' ].includes(pathList[2]) ? pathList[2] : 'default'
  }
  return activeKey
}

const onTabChange = (key, id, dispatch) => {
  let _pathname = `/job/${id}/${key}`
  if (key === 'default') {
    _pathname = _pathname.replace(/\/default$/, '')
  }
  dispatch(routerRedux.push({
    pathname: _pathname,
  }))
}

const JobDetail = ({ dispatch, match, children, location: { pathname }, history }) => {
  const activeKey = getActiveKey(pathname)
  const { id } = match.params
  return (
    <div>
      <ReturnButton onClick={history.goBack}>返回</ReturnButton>
      <DetailHeader/>
      <Page inner className={styles.page}>
        <div>
          <Tabs activeKey={activeKey} onChange={key => onTabChange(key, id, dispatch)}>
            <TabPane tab={<div className={styles.tabs}>Pods</div>} key="default" />
            <TabPane tab={<div className={styles.tabs}>Yaml</div>} key="yaml" />
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

JobDetail.propTypes = {
  //
}

export default connect()(JobDetail)
