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
import { getDeepValue, cpuFormat, memoryFormat } from '../../../../../utils/helper'
import TimeHover from '@tenx-ui/time-hover'
import { Link } from 'react-router-dom'

const Search = Input.Search
const SUPPORT_WORK_LOAD = [ 'Deployment', 'Service', 'StatefulSet', 'Job', 'CronJob', 'Pod' ]

@connect(state => {
  const { appStack, loading, app } = state
  const { cluster } = app
  let { appStacksDetail } = appStack
  let stackElements = []
  if (appStacksDetail) {
    const {
      deployments = [],
      services = [],
      configMaps = [],
    } = appStacksDetail
    const appObj = {}
    deployments.forEach(({ spec, metadata: { name, creationTimestamp, labels, uid } }) => {
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
        kind: 'Deployment',
        name,
        creationTimestamp,
        uid,
        resource: <React.Fragment>
          <Row className={styles.resourceLine}>
            <Col span="8">CPU:</Col>
            <Col span="16">{
              cpuFormat(
                getDeepValue(spec, 'template.spec.containers.0.resources.requests.memory'.split('.')),
                getDeepValue(spec, 'template.spec.containers.0.resources'.split('.'))
              ) || '-'
            }</Col>
          </Row>
          <Row className={styles.resourceLine}>
            <Col span="8">内存:</Col>
            <Col span="16">{
              memoryFormat(getDeepValue(spec, 'template.spec.containers.0.resources'.split('.'))) || '-'
            }</Col>
          </Row>
        </React.Fragment>,
      })
    })
    services.forEach(({ metadata: { name, creationTimestamp, uid } }) => {
      stackElements.push({
        kind: 'Service',
        name,
        creationTimestamp,
        uid,
      })
    })
    configMaps.forEach(({ metadata: { name, creationTimestamp, uid } }) => {
      stackElements.push({
        kind: 'ConfigMap',
        name,
        creationTimestamp,
        uid,
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
      render: (name, { kind }) => {
        if (SUPPORT_WORK_LOAD.indexOf(kind) > -1) {
          return <Link to={`/${kind}/${name}`}>{name}</Link>
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
    const filterStackElements = stackElements.filter(({ name }) => name.indexOf(searchValue) > -1)
    return <div id="stackElements">
      <div className={styles.operation}>
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
