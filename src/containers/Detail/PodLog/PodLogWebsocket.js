/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Socket
 * 获取 Pod log
 *
 * @author songsz
 * @date 2018-11-08
 */
import React from 'react'
import PropTypes from 'prop-types'
import { WebSocket } from '@tenx-ui/webSocket'
import { paasApi } from '../../../utils/config'
import { connect } from 'dva'
import TenxLogs from '@tenx-ui/logs'
import { formatDate } from '../../../utils/helper'
import { ecma48SgrEscape } from '../../../utils/ecma48_sgr_escape'
import styles from './style/PodLogWebsocket.less'

const RETRY_TIMEOUT = 5000
export const MAX_LOGS_NUMBER = 500

const mapState = ({ app: { watchToken, cluster, project, user }, nativeDetail }) => {
  return {
    watchToken,
    name: nativeDetail.name,
    cluster,
    namespace: user.namespace,
    project,
  }
}

@connect(mapState)
export default class PodLogSocket extends React.PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
    callback: PropTypes.func.isRequired,
  }

  static defaultProps = {
    callback: () => {},
  }
  state = {
    reconnect: true,
    logsLoading: false,
  }
  renderLog(logObj, index) {
    let { name, log, mark } = logObj
    const dateReg = /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,})?(Z|(\+\d{2}:\d{2}))\b/
    const logDateArray = log.match(dateReg)
    let logDate
    if (logDateArray && logDateArray[0]) {
      logDate = logDateArray[0]
      log = log.replace(logDate, '')
    }
    return (
      <div className={styles.logDetail} key={`logs_${index}`}>
        <span style={{ color: 'yellow' }}>[{name}] </span>
        {
          logDate &&
          <span style={{ color: 'orange' }}>[{formatDate(logDate)}] </span>
        }
        {
          mark &&
          <span style={{ color: '#57c5f7' }}>[{mark}] </span>
        }
        <span dangerouslySetInnerHTML={{ __html: ecma48SgrEscape(log) }}></span>
      </div>
    )
  }
  componentWillUnmount() {
    this.logsLoadingTimeout && clearTimeout(this.logsLoadingTimeout)
  }
  getLogs(logs) {
    const { logsLoading } = this.state
    if (!logsLoading && logs.length < 1) {
      return (
        <div style={{ color: 'white' }}>
          <span>暂无日志</span>
        </div>
      )
    }
    return logs.map(this.renderLog)
    // logsLoading ? [
    //   logs.map(this.renderLog),
    //   <div className='logDetail'>
    //     <span>loading ...</span>
    //   </div>
    // ] : logs.map(this.renderLog)
  }
  onSetupSocket = ws => {
    this.logRef && this.logRef.clearLogs()
    const initState = {
      logsLoading: true,
    }
    this.setState(initState)
    this.ws = ws
    const { watchToken, name, cluster, namespace, project } = this.props
    const watchAuthInfo = {
      accessToken: watchToken,
      type: 'log',
      name,
      cluster,
      namespace,

    }
    project && (watchAuthInfo.teamspace = project)
    ws.send(JSON.stringify(watchAuthInfo))
    ws.onmessage = event => {
      if (event.data === 'TENXCLOUD_END_OF_STREAM') { // 服务器主动断开, 不重连
        this.setState({
          reconnect: false,
        })
        return
      }
      this.logsLoadingTimeout && clearTimeout(this.logsLoadingTimeout)
      this.logsLoadingTimeout = setTimeout(() => this.setState({
        logsLoading: false,
      }), RETRY_TIMEOUT)
      let { data } = event
      data = JSON.parse(data)
      const { name: _name, log } = data
      if (log === undefined) return
      const logArray = log.split('\n')
      const logsLen = logArray.length
      if (logsLen > MAX_LOGS_NUMBER) {
        logArray.splice(0, (logsLen - MAX_LOGS_NUMBER))
      }
      const temp = []
      logArray.map(_log => _log && temp.push({ name: _name, log: _log }))

      this.logRef && this.logRef.writelns(this.getLogs(temp))
    }
    ws.onCloseExtend = () => {
      this.setState(initState)
    }
  }

  renderWS() {
    // if status is not in progress, skip socket
    // if (IN_PROGRESS_STATUS.indexOf(status) < 0 && watchedBuilds.length === 0) {
    //   return null
    // }

    const { reconnect } = this.state
    const protocol = paasApi.protocol === 'http' ? 'ws' : 'wss'
    return <WebSocket
      url={`${protocol}://${paasApi.host}/spi/v2/watch`}
      onSetup={this.onSetupSocket}
      reconnect={reconnect}
    />
  }
  render() {
    return (
      <div>
        <TenxLogs
          ref={ref => (this.logRef = ref)}
          logs={[
            <div style={{ color: 'white' }}>
              <span>loading ...</span>
            </div>,
          ]}
        />
        {
          this.renderWS()
        }
      </div>
    )
  }
}
