/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * StackElements
 *
 * @author zhouhaitao zhangpc
 * @date 2018-11-26
 */

import React from 'react'
import { Button, Table, Input, notification, Row, Col } from 'antd'
import styles from './style/index.less'
import { connect } from 'react-redux'
import { cpuFormat, memoryFormat } from '../../../../../utils/helper'
import autoFitFS from '@tenx-ui/utils/lib/autoFitFS'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import TimeHover from '@tenx-ui/time-hover'
import UnifiedLink from '@tenx-ui/utils/es/UnifiedLink'

import { ELEMENT_KEY_KIND_MAP } from '../../../../../utils/constants'
const Search = Input.Search
const getElementResource = spec => {
  const ResourceNodes = []
  const cpu = cpuFormat(
    getDeepValue(spec, 'template.spec.containers.0.resources.requests.memory'.split('.')),
    getDeepValue(spec, 'template.spec.containers.0.resources'.split('.'))
  )
  if (cpu && cpu !== '-') {
    ResourceNodes.push(<Row key="cpu" className={styles.resourceLine}>
      <Col span={8}>CPU:</Col>
      <Col span={16}>{cpu}</Col>
    </Row>)
  }
  const memory = memoryFormat(getDeepValue(spec, 'template.spec.containers.0.resources'.split('.'))) || '-'
  if (memory && memory !== '-') {
    ResourceNodes.push(<Row key="memory" className={styles.resourceLine}>
      <Col span={8}>内存:</Col>
      <Col span={16}>{memory}</Col>
    </Row>)
  }
  const storage = getDeepValue(spec, 'resources.requests.storage'.split('.'))
  if (storage) {
    ResourceNodes.push(<Row key="storage" className={styles.resourceLine}>
      <Col span={8}>存储:</Col>
      <Col span={16}>{storage}</Col>
    </Row>)
  }
  if (ResourceNodes.length === 0) {
    ResourceNodes.push(<span key="-">-</span>)
  }
  return ResourceNodes
}

const getElementUrl = (name, kind, element, cluster) => {
  switch (kind) {
    case 'Deployment':
    case 'StatefulSet':
    case 'Job':
    case 'CronJob':
    case 'Pod':
      return `/workloads/${kind}/${name}`
    case 'Service':
      return `/net-management/${kind}/${name}`
    case 'PersistentVolumeClaim': {
      const storageType = getDeepValue(element, [ 'metadata', 'labels', 'system/storageType' ])
      if (storageType === 'ceph') {
        return `/storage-management/privateStorage/k8s-pool/${cluster}/${name}`
      }
      if (storageType === 'nfs' || storageType === 'glusterfs') {
        return `/storage-management/shareStorage/${cluster}/${name}?diskType=${storageType}`
      }
      return
    }
    case 'Secret':
      return '/app_manage/configs/secrets'
    default:
      return
  }
}

@autoFitFS(50)
@connect(state => {
  const { appStack, loading, app } = state
  const { cluster } = app
  let { appStacksDetail } = appStack
  let stackElements = []
  if (appStacksDetail) {
    const appObj = {}
    Object.keys(ELEMENT_KEY_KIND_MAP).forEach(key => {
      const elements = appStacksDetail[key] || []
      const kind = ELEMENT_KEY_KIND_MAP[key]
      elements.forEach(element => {
        const { spec, metadata: { name, creationTimestamp, labels, uid } } = element
        const appName = labels['system/appName']
        if (appName) {
          appObj[appName] = {
            kind: 'Application',
            name: appName,
            creationTimestamp,
            uid: appName,
          }
        }
        stackElements.push({
          kind,
          name,
          creationTimestamp,
          uid,
          resource: getElementResource(spec, kind),
          url: getElementUrl(name, kind, element, cluster),
        })
      })
    })
    stackElements = Object.keys(appObj).map(key => appObj[key]).concat(stackElements)
  } else {
    appStacksDetail = {}
  }
  return {
    cluster,
    loading,
    appStacksDetail,
    stackElements,
  }
})
class StackElements extends React.Component {
  name = this.props.match.params.name

  columns = [
    {
      title: '元素类型',
      dataIndex: 'kind',
    },
    {
      title: '资源名称',
      dataIndex: 'name',
      render: (name, { url }) => {
        if (url) {
          return <UnifiedLink to={url}>{name}</UnifiedLink>
        }
        return name
      },
    },
    {
      title: '规格',
      dataIndex: 'resource',
      render: text => text || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'creationTimestamp',
      render: text => <TimeHover time={text} />,
    },
  ]

  state = {
    searchValue: '',
  }

  refresh = async () => {
    const { dispatch, cluster } = this.props
    try {
      await dispatch({
        type: 'appStack/fetchAppStackDetail',
        payload: { cluster, name: this.name },
      })
    } catch (error) {
      notification.warn({
        message: '刷新失败',
      })
    }
  }

  search = searchValue => this.setState({ searchValue })

  render() {
    const { stackElements, loading } = this.props
    const { searchValue } = this.state
    const filterStackElements = stackElements.filter(({ name }) => (name || '').indexOf(searchValue) > -1)
    return <div id="stackElements" style={{ minHeight: this.props.autoFitFsH }}>
      <div className={styles.operation} style={filterStackElements.length === 0 ? { position: 'relative' } : null}>
        <div className={styles.operationLeft}>
          <Button icon="sync" onClick={this.refresh}>刷新</Button>
          <Search onSearch={this.search} placeholder="输入资源名称搜索" style={{ width: 200 }}/>
        </div>
      </div>
      <Table
        className={styles.table}
        columns={this.columns}
        dataSource={filterStackElements}
        loading={loading.effects['appStack/fetchAppStackDetail']}
        pagination={{
          position: 'top',
          simple: true,
          pageSize: 10,
        }}
        rowKey={row => row.uid}
      />
    </div>
  }
}
export default StackElements
