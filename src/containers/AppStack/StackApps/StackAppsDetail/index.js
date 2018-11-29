/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * StackAppsDetail
 *
 * @author zhouhaitao
 * @date 2018-11-26
 */

import React from 'react'
import { Card, Button, Tabs, Modal, notification } from 'antd'
import { Stack as StackIcon, Circle as CircleIcon } from '@tenx-ui/icon'
import { connect } from 'dva'
import styles from './style/index.less'
import StackElements from './StackElements'
import StackYaml from './StackYaml'
import Loader from '@tenx-ui/loader'

const Tabpane = Tabs.TabPane

@connect(state => {
  const { appStack, loading, app } = state
  const { cluster } = app
  const { appStacksDetail } = appStack
  return { appStacksDetail, loading, cluster }
}, dispatch => ({
  getStackDetail: ({ cluster, name }) => dispatch({
    type: 'appStack/fetchAppStackDetail',
    payload: { cluster, name },
  }),
  appStackStart: ({ cluster, name }) => dispatch({
    type: 'appStack/stackStart',
    payload: ({ cluster, name }),
  }),
  appStackStop: ({ cluster, name }) => dispatch({
    type: 'appStack/stackStop',
    payload: ({ cluster, name }),
  }),
  appStackDelete: ({ cluster, name }) => dispatch({
    type: 'appStack/stackDelete',
    payload: ({ cluster, name }),
  }),

}))
class StackAppsDetail extends React.Component {
  state = {
    stopModal: false,
    delModal: false,
  }
  componentDidMount() {
    const { getStackDetail, cluster } = this.props
    const name = this.props.match.params.name
    getStackDetail({ cluster, name })
  }
  convertStatus = () => {
    return {
      color: '#5cb85c',
      txt: '正常运行',
    }
  }
  start = () => {
    const name = this.props.match.params.name
    const { cluster, appStackStart } = this.props
    appStackStart({ cluster, name }).then(res => {
      if (res.code === 200) {
        notification.success({ message: '启动成功' })
      } else {
        notification.success({ message: '启动失败' })
      }
    })
  }
  stop = () => {
    this.setState({
      stopModal: true,
    })
  }
  deleteStack = () => {
    this.setState({
      delModal: true,
    })
  }

  confirmStop = () => {
    const name = this.props.match.params.name
    const { cluster, appStackStop } = this.props
    appStackStop({ cluster, name }).then(res => {
      if (res.code === 200) {
        this.setState({
          stopModal: false,
        })
        notification.success({ message: '停止成功' })
      } else {
        notification.success({ message: '停止失败' })
      }
    })
  }
  confirmDel = () => {
    const name = this.props.match.params.name
    const { cluster, appStackDelete } = this.props
    appStackDelete({ cluster, name }).then(res => {
      if (res.code === 200) {
        this.setState({
          delModal: false,
        })
        this.props.history.push('/app-stack')
        notification.success({ message: '删除成功' })
      } else {
        notification.error({ message: '删除失败' })
      }
    })
  }
  render() {
    const name = this.props.match.params.name
    const { appStacksDetail, loading } = this.props
    const { stopModal, delModal } = this.state
    const stackYamlContent = appStacksDetail && appStacksDetail.appStack.spec.content
    const k8sYamlContent = appStacksDetail && appStacksDetail.appStack.spec.k8sManifest
    const yamlContent = { stackYamlContent, k8sYamlContent }
    const contentLoading = loading.effects['appStack/fetchAppStackDetail']
    const delLoading = loading.effects['appStack/stackDelete']
    const startLoading = loading.effects['appStack/stackStart']
    const stopLoading = loading.effects['appStack/stackStop']
    return <div
      id="stackAppDetail"
    >
      <Card className={styles.detailInfo} hoverable key="header">
        <div className={styles.detailInfoLeft}>
          <div className={styles.detailIcon}>
            <StackIcon/>
          </div>
          <div className={styles.detailName}>
            <h1>{name}</h1>
            <div className={styles.status}>
              状态： <CircleIcon style={{ color: this.convertStatus().color }}/>
              <span style={{ color: this.convertStatus().color }}>{this.convertStatus().txt}</span>
            </div>
          </div>
        </div>
        <div className={styles.detailInfoRight}>
          <Button icon="caret-right" onClick={this.start} loading={startLoading}>启动</Button>
          <Button onClick={this.stop}><span className={styles.stopIcon} style={{ background: '#666' }}></span>停止</Button>
          <Button onClick={this.deleteStack} icon="delete">删除</Button>
        </div>
      </Card>
      <Card hoverable key="content" className={styles.detailContent}>
        {
          contentLoading ?
            <div className={styles.loading}>
              <Loader
                spinning={true}
              />
            </div>
            :
            <Tabs defaultActiveKey="element">
              <Tabpane tab="堆栈元素" key="element">
                <StackElements/>
              </Tabpane>
              <Tabpane tab="YAML" key="YAML">
                <StackYaml
                  data={yamlContent}
                />
              </Tabpane>
              <Tabpane tab="堆栈拓补" key="topology">

              </Tabpane>
              <Tabpane tab="事件" key="event">

              </Tabpane>
            </Tabs>
        }
      </Card>
      <Modal
        title="停止堆栈？"
        visible={stopModal}
        onCancel={() => this.setState({ stopModal: false })}
        onOk={this.confirmStop}
        confirmLoading={stopLoading}
      >
        确定停止堆栈吗？
      </Modal>
      <Modal
        title="删除堆栈？"
        visible={delModal}
        onCancel={() => this.setState({ delModal: false })}
        onOk={this.confirmDel}
        confirmLoading={delLoading}
      >
        确认删除堆栈吗？
      </Modal>
    </div>
  }
}

export default StackAppsDetail
