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
import { Icon } from 'antd'
import { connect } from 'dva'
import { DOCK_DEFAULT_HEADER_SIZE, DOCK_DEFAULT_SIZE } from '../../../utils/constants'
import { userPortalApi } from '../../../utils/config'
import { WebSocket } from '@tenx-ui/webSocket'
import { getDeepValue } from '../../../utils/helper'
import {
  b64_to_utf8,
  // utf8_to_b64,
} from '../../../utils/helper'

const mapState = (
  { app: { cluster, project },
    nativeDetail: { dockSize, dockVisible, type, name, podDetail } }) =>
  ({ dockSize, dockVisible, cluster, project, type, name, podDetail })

@connect(mapState)
export default class Index extends React.Component {
  static propTypes = {
    headerContent: PropTypes.element,
  }
  state = {
    showSocket: false,
    connected: false,
  }
  componentDidMount() {
    // runFakeTerminal(this.xterm)
    this.setState({
      showSocket: true,
    })
  }
  componentWillUnmount() {
  }
  renderHeader = () => {
    const { headerContent = null, dockSize } = this.props
    return (
      <div className={styles.header}>
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
    )
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
    ws.onmessage = function(message) {
      const msg = b64_to_utf8(message.data)
      // 终端 exit
      if (encodeURI(msg) === '%0D%0Aexit%0D%0A') {
        that.xterm.destroy()
        delete that.xterm
        return
      }
      if (msg === '[403 resource permission error] This operation has no permissions') {
        // const error = {
        //   statusCode: 403,
        //   message: {
        //     status: 'Failure',
        //     message: 'user can not access resource due to acl',
        //     reason: 'Forbidden',
        //     details:{
        //       name: '',
        //       kind: 'ResourcePermission'
        //     },
        //     code: 403,
        //     data: {
        //       id: 38,
        //       name: '登录容器终端',
        //       desc: '登录容器终端',
        //       category: 35,
        //       code: 'LOGIN_CON',
        //       status: 0,
        //       count: 0,
        //     },
        //   },
        // }
      }
    }
    term.attach(ws)
    term.refresh(term.x, term.y)
    term.focus()
    // let inputCmd = ''
    // term.on('data', function(_data) {
    //   inputCmd += _data
    //   if (ws && ws.readyState === 1) {
    //     ws.send('0' + utf8_to_b64(_data));
    //   }
    //   if (_data === '\r' || _data === '\n') {
    //     inputCmd = ''
    //   }
    // })
  }

  renderWS = () => {
    const { cluster, project, type, name, podDetail } = this.props
    const container = getDeepValue(podDetail, 'spec.containers.0.name')
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
              addons={[ 'attach' ]}
            />
          </div>
        </Dock>
        { this.state.showSocket && this.renderWS() }
      </div>
    )
  }
}
