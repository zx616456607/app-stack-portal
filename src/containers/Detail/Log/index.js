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
  getColorLogs = () => {
    this.logRef && this.logRef.clearLogs()
    const { logs } = this.props
    const res = []
    logs.map(log => res.push(`
<span style="color: #ffc20e">[${log.name}]</span>
<span style="color: #ff0">[${
      moment(parseInt(log.time_nano / 1000))
        .format(DEFAULT_TIME_FORMAT)
      }]</span>
<span style="color: #37fc34">${log.log}</span><div/>
`)
    )
    this.logRef && this.logRef.writelns(res)
  }
  render() {
    this.getColorLogs()
    return (
      <TenxLogs
        ref={ref => (this.logRef = ref)}
        logs={[]}
        isDangerouslySetInnerHTML={true}
      />
    )
  }
}

export default Log
