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
import { SocketIO } from '@tenx-ui/webSocket'
import { paasApi } from '../../../utils/config'

export default class PipelineBuildSocket extends React.PureComponent {
  static propTypes = {
    // status: PropTypes.number,
    pipelineId: PropTypes.string.isRequired,
    watchedBuilds: PropTypes.array.isRequired,
    callback: PropTypes.func.isRequired,
  }

  static defaultProps = {
    callback: () => {},
  }

  onSetupSocket = socket => {
    const {
      pipelineId, watchedBuilds, callback,
    } = this.props
    socket.emit('pipelineBuildStatus', {
      pipelineId,
      watchedBuilds,
    })
    socket.on('pipelineBuildStatus', data => {
      if (data) {
        clearTimeout(this._debounceCb)
        this._debounceCb = setTimeout(callback, 200)
      }
    })
  }

  render() {
    const { watchedBuilds } = this.props
    if (!watchedBuilds || watchedBuilds.length === 0) {
      return null
    }
    // if status is not in progress, skip socket
    // if (IN_PROGRESS_STATUS.indexOf(status) < 0 && watchedBuilds.length === 0) {
    //   return null
    // }
    return <SocketIO
      url={paasApi.host}
      protocol={paasApi.protocol === 'http' ? 'ws' : 'wss'}
      path={paasApi.statusPath}
      onSetup={this.onSetupSocket}
    />
  }
}
