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
import { notification } from 'antd'
import moment from 'moment'
import { DEFAULT_TIME_FORMAT } from '../../../utils/constants'
import TenxLogs from '@tenx-ui/logs'

const mapStateToProps =
  ({ nativeDetail: { logs: { logs = [], count = 0 }, name } }) => ({ logs, count, name })

@connect(mapStateToProps)
class Log extends React.PureComponent {
  componentDidMount() {
    const timeNow = moment(new Date()).format(DEFAULT_TIME_FORMAT.split(' ')[0])
    const { dispatch } = this.props
    dispatch({
      type: 'nativeDetail/fetchNativeLogs',
      payload: {
        body: {
          from: 0,
          size: 50,
          date_start: timeNow,
          date_end: timeNow,
          log_type: 'stdout',
        },
      },
    }).catch(() => notification.warn({ message: '获取日志出错' }))
  }
  render() {
    const logsz = [
      '[0] node app.js',
      '[1] hello world',
    ]
    return (
      <div>
        <TenxLogs
          ref={ref => (this.logRef = ref)}
          logs={logsz}
        />
      </div>
    )
  }
}

export default Log
