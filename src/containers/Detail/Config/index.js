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
  async componentDidMount() {
    const { dispatch } = this.props
    const res = await dispatch({
      type: 'nativeDetail/fetchPodDetail',
    })
    if (!res.data) return
    this.getMount(res.data, this.state.containerIndex)
  }

  getMount(container, i) {
    const res = {
      mountPath: [],
      name: [],
      typeText: [],
    }
    const volumes = container.spec.volumes || []
    const volumeMounts = container.spec.containers[i].volumeMounts || []
    volumes.map(item => {
      let type = '--'
      let name = '--'
      const volumeIndex = item.name
      let mountPath = '--'
      if (item.hostPath || item.persistentVolumeClaim || item.rbd) {
        // 确定存储类型和存储名称
        if (item.hostPath) {
          type = '本地存储'
          name = '-'
        } else if (item.persistentVolumeClaim) {
          name = item.persistentVolumeClaim.claimName
          const annotations = container.metadata.annotations
          for (const key in annotations) {
            const index = volumeIndex.replace('-', '')
            if (key === index) {
              if (annotations[key] === 'private') {
                type = '独享型（rbd）'
              } else if (annotations[key] === 'share') {
                type = '共享型（nfs）'
              } else {
                type = '-'
              }
              break
            }
          }
        } else if (item.rbd) {
          type = '独享型（rbd）'
          const imageArray = item.rbd.image.split('.')
          name = imageArray[imageArray.length - 1]
        }
        // 确定容器目录
        for (let j = 0; j < volumeMounts.length; j++) {
          if (volumeMounts[j].name === volumeIndex) {
            mountPath = volumeMounts[j].mountPath
            break
          }
        }
        if ((type === '本地存储' && mountPath === '/etc/localtime') || (type === '本地存储' && mountPath === '/etc/timezone')) {
          return null
        }
        let typeText
        switch (type) {
          case '本地存储':
            typeText = '本地存储'
            break
          case '独享型（rbd）':
            typeText = '独享型（rbd）'
            break
          case '共享型（nfs）':
            typeText = '共享型（rbd）'
            break
          default:
            typeText = '-'
            break
        }
        return { typeText, name, mountPath }
      }
      return null

    }).filter(l => !!l).map(l => {
      res.mountPath.push(l.mountPath)
      res.name.push(l.name)
      res.typeText.push(l.typeText)
      return null
    })
    return res
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
  getMounts = (data, i) => {
    const res = { name: [], path: [], type: [] }
    const vObj = {}
    ;(getDeepValue(data, 'spec.volumes') || []).filter(v => v.persistentVolumeClaim).map(
      v => (vObj[v.name] = v.persistentVolumeClaim.claimName)
    )
    const ann = getDeepValue(data, 'metadata.annotations')
    if (!Object.keys(vObj).length) return {}
    ;(getDeepValue(data, `spec.containers.${i}.volumeMounts`) || []).map(mount => {
      if (vObj[mount.name]) {
        res.name.push(vObj[mount.name] || '--')
        res.path.push(mount.mountPath || '--')
        res.type.push(ann[mount.name] || '--')
      }
      return null
    })
    if (!res.name.length) {
      res.name.push('--')
      res.path.push('--')
      res.type.push('--')
    }
    return res
  }
  getDataSource = data => {
    const { containerIndex } = this.state
    const serverConfig = this.getConfigMap(data, containerIndex)
    const mount = this.getMounts(data, containerIndex)
    const res = [{
      header: '基本信息',
      content: [{
        title: '镜像',
        value: (
          getDeepValue(data, `spec.containers.${containerIndex}.image`)
        ) || '--',
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
        value: mount.type || '--',
      }, {
        title: '存储',
        value: mount.name || '--',
      }, {
        title: '容器目录',
        value: mount.path || '--',
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
