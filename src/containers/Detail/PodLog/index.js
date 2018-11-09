/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 *
 *
 * @author Songsz
 * @date 2018-11-08
 *
*/

import React from 'react'
import PodLogWebsocket from './PodLogWebsocket'

class PodLog extends React.PureComponent {
  socketCb = () => {
  }
  render() {
    return <div>
      <PodLogWebsocket callback={this.socketCb}/>
    </div>
  }
}
export default PodLog
