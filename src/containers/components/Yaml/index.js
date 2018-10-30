/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * yaml tab
 *
 * @author Songsz
 * @date 2018-10-29
 *
*/

import React from 'react'
import Shell from '@tenx-ui/editor'
import '@tenx-ui/editor/assets/index.css'

export default class YamlTab extends React.PureComponent {
  state = {
    value: 'echo',
  }
  onChange = value => {
    this.setState({ value })
  }
  render() {
    return (
      <div>
        <Shell
          onChange={this.onChange}
          title="Yaml"
          options={{ mode: 'xml', theme: 'material' }}
          value={this.state.value} />
      </div>
    )
  }
}
