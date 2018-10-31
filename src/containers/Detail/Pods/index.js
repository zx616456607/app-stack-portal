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
import Pods from '../../components/Pods'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import { notification } from 'antd'

class PodsContainer extends React.PureComponent {
  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type: 'nativeDetail/fetchPodsList',
    }).catch(() => notification.warn({ message: '获取 Pods 失败' }))
  }
  render() {
    return (
      <Pods { ...this.props } />
    )
  }
}

const mapStateToProps = ({ nativeDetail: { pods } }) => {
  return {
    data: pods || [],
  }
}

export default connect(mapStateToProps)(withRouter(PodsContainer))
