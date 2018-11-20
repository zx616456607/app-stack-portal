/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * xterm
 *
 * @author Songsz
 * @date 2018-11-12
 *
*/

import React from 'react'
import { XTerm } from '@tenx-ui/xterm'
import Dock from 'react-dock'
import styles from './style/index.less'
import PropTypes from 'prop-types'
import { Icon, Button } from 'antd'
import { connect } from 'dva'
import { DOCK_DEFAULT_HEADER_SIZE, DOCK_DEFAULT_SIZE } from '../../../utils/constants'
import { userPortalApi } from '../../../utils/config'
import { WebSocket } from '@tenx-ui/webSocket'
import { getDeepValue } from '../../../utils/helper'
import { b64_to_utf8, utf8_to_b64 } from '../../../utils/helper'

const TERM_TIPS_DISABLED = 'term_tips_disabled'

const mapState = (
  { app: { cluster, project, user: { userName } },
    nativeDetail: { dockSize, dockVisible, type, name, podDetail } }) =>
  ({ dockSize, dockVisible, cluster, project, type, name, podDetail, userName })

@connect(mapState)
export default class Index extends React.Component {
  static propTypes = {
    headerContent: PropTypes.element,
  }
  consts = {
    isConnecting: '终端连接中...',
    timeout: '连接超时',
    connectStop: '连接已断开',
  }
  state = {
    showSocket: false,
    connected: false,
    termMsg: this.consts.isConnecting,
    tipHasKnow: false,
  }
  componentDidMount() {
    // runFakeTerminal(this.xterm)
    this.setState({
      showSocket: true,
    })
    this.wsTimeout = setTimeout(() => {
      this.setState({
        termMsg: this.consts.timeout,
      })
    }, 10 * 1000)
  }
  componentWillUnmount() {
    this.wsTimeout && clearTimeout(this.wsTimeout)
    const term = this.xterm.xterm
    if (term) term.destroy()
    delete this.xterm
  }
  renderHeader = () => {
    const { headerContent = null, dockSize } = this.props
    return (
      <div className={styles.header}>
        <div className={styles.headerStatic}>
          <div>
            {headerContent}
          </div>
          <span className={styles.right}>
            {
              dockSize > DOCK_DEFAULT_HEADER_SIZE + 8 &&
              <Icon type="minus" className={styles.icon} onClick={() => this.onSizeChange(DOCK_DEFAULT_HEADER_SIZE)}/>
            }
            {
              dockSize <= DOCK_DEFAULT_HEADER_SIZE + 8 &&
              <Icon type="border" className={styles.icon} onClick={() => this.onSizeChange(DOCK_DEFAULT_SIZE)}/>
            }
            <Icon type="close" className={styles.icon} onClick={this.onCloseDock}/>
          </span>
        </div>
        { this.renderWarning() }
        { this.renderMsg() }
      </div>
    )
  }
  onNeverRemindClick = () => {
    const { userName } = this.props
    const noTipList = JSON.parse(window.localStorage.getItem(TERM_TIPS_DISABLED) || '{}')
    noTipList[userName] = true
    window.localStorage.setItem(TERM_TIPS_DISABLED, JSON.stringify(noTipList))
    this.setState({ tipHasKnow: true })
  }
  renderWarning = () => {
    const { userName } = this.props
    const { tipHasKnow } = this.state
    const noTipList = JSON.parse(window.localStorage.getItem(TERM_TIPS_DISABLED) || '{}')
    if (noTipList[userName] || tipHasKnow) return null
    return (
      <span className={styles.warningTip}>
        <span>
          <span>由于容器本身无状态且不可变的特性，以防容器销毁后，对容器内部做的改动无法保留，</span>
          <span className={styles.notModify}>建议不要直接修改容器中内容（有状态容器中存储映射出来的目录除外）</span>
        </span>
        <span>
          <Button
            onClick={() => this.setState({ tipHasKnow: true })}
            className={styles.hasKnow}
            size="small"
            type="primary">知道了</Button>
          <Button onClick={this.onNeverRemindClick} size="small">不再提醒</Button>
        </span>
      </span>
    )
  }
  renderMsg = () => {
    const { termMsg } = this.state
    if (termMsg) {
      return (
        <span className={styles.termMsg}>
          <div className={styles.webLoadingBox}>
            {
              termMsg === this.consts.isConnecting &&
              <React.Fragment>
                <span className={styles.terIcon}/>
                <span className={styles.terIcon}/>
                <span className={styles.terIcon}/>
              </React.Fragment>
            }
            <span>{termMsg}</span>
          </div>
        </span>
      )
    }
    return null
  }
  updateState = payload => this.props.dispatch({
    type: 'nativeDetail/updateState',
    payload,
  })
  onSizeChange = dockSize => {
    if (dockSize < DOCK_DEFAULT_HEADER_SIZE) return
    this.updateState({ dockSize })
  }
  onCloseDock = () => this.updateState({ dockVisible: false })
  onSetupSocket = ws => {
    const that = this
    const term = this.xterm.xterm
    ws.onmessage = message => {
      this.wsTimeout && clearTimeout(this.wsTimeout)
      this.state.termMsg && this.setState({
        termMsg: '',
      })
      const msg = b64_to_utf8(message.data)
      // 终端 exit
      if (encodeURI(msg) === '%0D%0Aexit%0D%0A') {
        term.destroy()
        delete that.xterm
        return
      }
      if (msg === '[403 resource permission error] This operation has no permissions') {
        this.setState({
          termMsg: '[403 resource permission error]',
        })
      }
    }
    ws.addEventListener('close', () => {
      that.setState({ termMsg: that.consts.connectStop })
    })
    term.attach(ws)
    term.setOption('fontFamily', '"Monospace Regular", "DejaVu Sans Mono", Menlo, Monaco, Consolas, monospace')
    term.setOption('fontSize', 12)
    term.refresh(term.x, term.y)
    term.focus()
    // let inputCmd = ''
    term.on('data', function(_data) {
      // inputCmd += _data
      if (ws && ws.readyState === 1) {
        ws.send('0' + utf8_to_b64(_data));
      }
      if (_data === '\r' || _data === '\n') {
        // inputCmd = ''
      }
    })
  }

  renderWS = () => {
    const { cluster, project, type, name, podDetail } = this.props
    const container = getDeepValue(podDetail, 'spec.containers.0.name'.split('.'))
    if (type !== 'Pod' || !name || !container) return null
    const protocol = userPortalApi.protocol === 'http' ? 'ws' : 'wss'
    const wsUrl = `${protocol}://${userPortalApi.host}/api/v1/cluster/${
      cluster}/namespaces/${project}/pods/${name}/exec?container=${container}`
    return <WebSocket
      url={wsUrl}
      protocol={'base64.channel.k8s.io'}
      onSetup={this.onSetupSocket}
      reconnect={false}
    />
  }
  render() {
    const { dockSize, dockVisible } = this.props
    return (
      <div>
        <Dock
          fluid={false}
          size={dockSize}
          isVisible={dockVisible}
          position="bottom"
          dimMode="none"
          onSizeChange={this.onSizeChange}
        >
          <div className={styles.container}>
            { this.renderHeader() }
            <div className={styles.placeholderHeader}/>
            <XTerm
              ref={xterm => (this.xterm = xterm)}
              // 只有k8s的xterm才需要使用thirdAddons, 现在只有'attach'可用
              thirdAddons={[ 'attach' ]}
              options={{
                cursorBlink: true,
              }}
            />
          </div>
        </Dock>
        { this.state.showSocket && this.renderWS() }
      </div>
    )
  }
}
