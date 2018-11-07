/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 *
 *
 * @author Songsz
 * @date 2018-11-06
 *
*/

import React from 'react'
import styles from './style/index.less'
import { Divider, Tooltip, Select } from 'antd'
import { cpuFormat, getDeepValue, memoryFormat } from '../../../utils/helper'
import { connect } from 'dva'
import { Authority as SecretIcon } from '@tenx-ui/icon'

const Option = Select.Option
const mapState = ({ nativeDetail: { podDetail } }) => ({ data: podDetail })

@connect(mapState)
class Config extends React.PureComponent {
  state = {
    containerIndex: 0,
  }
  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type: 'nativeDetail/fetchPodDetail',
    })
  }
  getConfigMap = (container, containerIndex) => {
    const volumes = container.spec.volumes
    const configMaps = []
    if (container.spec.containers[containerIndex].volumeMounts) {
      container.spec.containers[containerIndex].volumeMounts.forEach(volume => {
        if (volume.mountPath === '/var/run/secrets/kubernetes.io/serviceaccount') { return }
        volumes.forEach(item => {
          if (!item) return false
          if (item.name === volume.name) {
            if (item.configMap) {
              if (item.configMap.items) {
                item.configMap.items.forEach(configMap => {
                  const arr = volume.mountPath.split('/')
                  if (arr[arr.length - 1] === configMap.path) {
                    configMap.mountPath = volume.mountPath
                    configMap.configMapName = item.configMap.name
                    configMaps.push(configMap)
                  }
                })
              } else {
                configMaps.push({
                  mountPath: volume.mountPath,
                  configMapName: item.configMap.name,
                  key: '已挂载整个配置组',
                })
              }
            }
          }
        })
      })
      return configMaps
    }
  }
  renderEnvValue = (data, i) => (getDeepValue(data, `spec.containers.${i}.env`) || []).map(
    item => item.value || (
      <div>
        <Tooltip title="加密变量">
          <SecretIcon className={styles.secretEnvIcon}/>
        </Tooltip>
        {getDeepValue(item, 'valueFrom.secretKeyRef.name')}/
        {getDeepValue(item, 'valueFrom.secretKeyRef.key')}
      </div>
    )
  ) || []
  getDataSource = data => {
    const { containerIndex } = this.state
    const serverConfig = this.getConfigMap(data, containerIndex)
    const res = [{
      header: '基本信息',
      content: [{
        title: '镜像',
        value: getDeepValue(data, 'images') || '--',
      }, {
        title: '所属节点',
        value: getDeepValue(data, 'status.hostIP') || '--',
      }],
    }, {
      header: '资源配置',
      content: [{
        title: 'CPU',
        value: cpuFormat(
          getDeepValue(data, `spec.containers.${containerIndex}.resources.requests.memory`),
          getDeepValue(data, `spec.containers.${containerIndex}.resources`)
        ) || '--',
      }, {
        title: '内存',
        value: memoryFormat(getDeepValue(data, `spec.containers.${containerIndex}.resources`)),
      }, {
        title: '系统盘',
        value: '10G',
      }],
    }, {
      header: '环境变量',
      content: [{
        title: '变量名',
        value: (getDeepValue(data, `spec.containers.${containerIndex}.env`) || []).map(item => item.name || '--') || [],
      }, {
        title: '变量值',
        value: this.renderEnvValue(data, containerIndex),
      }],
    }, {
      header: '存储',
      content: [{
        title: '存储类型',
        value: undefined,
      }, {
        title: '存储',
        value: undefined,
      }, {
        title: '容器目录',
        value: '333322',
      }],
    }, {
      header: '服务配置',
      content: [{
        title: '配置组',
        value: serverConfig.map(item => item.configMapName || '--') || [],
      }, {
        title: '配置文件',
        value: serverConfig.map(item => item.key || '--') || [],
      }, {
        title: '挂载点',
        value: serverConfig.map(item => item.mountPath || '--') || [],
      }],
    }]
    return res
  }
  renderContent = content => content.map((cell, i) => (
    <div className={styles.cell} key={i}>
      <div className={styles.title}>{cell.title}</div>
      {
        Array.isArray(cell.value)
          ? cell.value.map((c, j) => (
            <div key={j} className={styles.text}>{c}</div>
          ))
          : <div className={styles.text}>{cell.value}</div>
      }
    </div>
  ))
  onContainerChange = v => this.setState({
    containerIndex: v,
  })
  render() {
    const { data } = this.props
    const dataDom = data.metadata ? this.getDataSource(this.props.data) : []
    return (
      <div className={styles.container}>
        <div className={styles.changeContainer}>
          <div className={styles.label}>容器:</div>
          <Select
            value={this.state.containerIndex}
            onChange={this.onContainerChange}
            className={styles.slc}>
            {
              (getDeepValue(data, 'spec.containers') || []).map((container, index) =>
                <Option key={index} value={index}>{container.name}</Option>
              )
            }
          </Select>
        </div>
        <Divider/>
        {
          dataDom.map((item, index) => (
            <div className={styles.row} key={index}>
              <div className={styles.header}>
                {item.header}
              </div>
              <div className={styles.content}>
                {this.renderContent(item.content || [])}
              </div>
              <Divider/>
            </div>
          ))
        }
      </div>
    )
  }
}

export default Config
