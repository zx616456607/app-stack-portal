/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * StackApps
 *
 * @author zhouhaitao
 * @date 2018-11-22
 */


import React from 'react'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { Button } from 'antd'
import styles from './style/index.less'

@connect(state => {
  return state
}, dispatch => ({
  getAppStackList: () => dispatch({
    type: 'appStack/fetchAppStackList',
  }),
}))
class StackApps extends React.Component {
  state = {}
  componentDidMount() {
    const { getAppStackList } = this.props
    getAppStackList()
  }
  render() {
    return <QueueAnim
      id="appStack"
    >
      <Button type="primary" icon="plus" key="button">部署堆栈</Button>
      <div key="appStackContent" className={styles.appStackContent}>

      </div>
    </QueueAnim>
  }
}

export default StackApps
