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
import autoFitFS from '@tenx-ui/utils/lib/autoFitFS'

const dvaStates = ({ nativeDetail: { detailData, type } }) => ({ data: detailData, type })

@autoFitFS(90)
@connect(dvaStates)
export default class YamlTab extends React.PureComponent {

  render() {
    const { data, type } = this.props
    let apiVersion = ''
    switch (type) {
      case 'CronJob':
        apiVersion = 'batch/v1beta1'
        break
      case 'Deployment':
        apiVersion = 'apps/v1'
        break
      case 'Job':
        apiVersion = 'batch/v1'
        break
      case 'Pod':
        apiVersion = 'Core/v1'
        break
      case 'StatefulSet':
        apiVersion = 'apps/v1'
        break
      case 'Service':
        apiVersion = 'v1'
        break
      default:
        break
    }
    const value = { apiVersion, kind: type, ...data }
    return (
      <TenxEditor
        value={yaml.dump(value)}
        readOnly={true}
        onChange={yamlStr => this.setState({ yamlStr })}
        height={this.props.autoFitFsH}
      />
    )
  }
}
