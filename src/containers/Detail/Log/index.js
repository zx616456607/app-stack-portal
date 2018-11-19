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
import styles from './style/index.less'

const mapStateToProps =
  ({ nativeDetail: { logs: { logs = [], count = 0 }, name } }) => ({ logs, count, name })

@connect(mapStateToProps)
class Log extends React.PureComponent {
  async componentDidMount() {
    const timeNow = moment(new Date()).format(DEFAULT_TIME_FORMAT.split(' ')[0])
    const { dispatch } = this.props
    await dispatch({
      type: 'nativeDetail/fetchPodsList',
    }).catch(() => notification.warn({ message: '获取 Pods 失败' }))

    dispatch({
      type: 'nativeDetail/fetchNativeLogs',
      payload: {
        body: {
          from: 0,
          size: 50,
          date_start: timeNow,
          date_end: timeNow,
          log_type: 'stdout',
          kind: 'pod',
        },
      },
    }).catch(() => notification.warn({ message: '获取日志出错' }))
  }
  getColorLogs = () => {
    const { logs } = this.props
    const res = []
    logs.map(log => res.push(
      <div>
        <span className={styles.name}>[{log.name}]&nbsp;</span>
        <span className={styles.date}>[{
          moment(parseInt(log.time_nano / 1000))
            .format(DEFAULT_TIME_FORMAT)
        }]&nbsp;</span>
        <span className={styles.content}>{log.log}</span>
      </div>
    ))
    if (!res.length) {
      res.push(
        <div className={styles.noLog}>
        暂无日志
        </div>
      )
    }
    if (this.logRef) {
      this.logRef.clearLogs()
      this.logRef.writelns(res)
    }
    return res
  }
  render() {
    this.getColorLogs()
    return (
      <TenxLogs
        ref={ref => (this.logRef = ref)}
      />
    )
  }
}

export default Log
