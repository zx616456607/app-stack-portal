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
import TenxEditor from '@tenx-ui/editor'
import '@tenx-ui/editor/assets/index.css'
import yaml from 'js-yaml'
import { connect } from 'dva'
import 'brace/mode/yaml'
import 'brace/snippets/yaml'
import 'brace/theme/monokai'

const dvaStates = ({ nativeDetail: { detailData, type } }) => ({ data: detailData, type })

@connect(dvaStates)
export default class YamlTab extends React.PureComponent {

  render() {
    const { data, type } = this.props
    const value = { kind: type, ...data }
    return (
      <div style={{ height: 500 }} >
        <TenxEditor
          value={yaml.dump(value)}
          readOnly={true}
          onChange={yamlStr => this.setState({ yamlStr })}
        />
      </div>
    )
  }
}
