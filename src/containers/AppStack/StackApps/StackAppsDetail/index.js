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
import { Card, Button, Tabs, notification } from 'antd'
import { Stack as StackIcon, Circle as CircleIcon } from '@tenx-ui/icon'
import { connect } from 'dva'
import styles from './style/index.less'
import * as modal from '@tenx-ui/modal'
import StackElements from './StackElements'
import StackYaml from './StackYaml'
import Loader from '@tenx-ui/loader'
import { getServiceStatus } from '../../../../utils/helper';

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
  componentDidMount() {
    const { getStackDetail, cluster } = this.props
    const name = this.props.match.params.name
    getStackDetail({ cluster, name })
  }
  convertStatus = () => {
    const runningList = []
    const pendingList = []
    const stoppedList = []
    let status = {
      txt: '未知',
      color: '#9e9e9e',
    }
    const { appStacksDetail } = this.props
    if (appStacksDetail) {
      const { deployments } = appStacksDetail
      deployments.forEach(v => {
        const statusObject = getServiceStatus(v)
        switch (statusObject.phase) {
          case 'Running':
            runningList.push(statusObject)
            break
          case 'Pending':
            pendingList.push(statusObject)
            break
          case 'Stopped':
            stoppedList.push(statusObject)
            break
          default:
            return
        }
        if (runningList.length > 0 && runningList.length < deployments.length) {
          status = {
            txt: '资源未全部运行',
            color: '#ffbf00',
          }
          return
        }
        if (pendingList.length === deployments.length) {
          status = {
            txt: '堆栈启动中',
            color: '#2db7f5',
          }
          return
        }
        if (runningList.length === deployments.length) {
          status = {
            txt: '正常运行',
            color: '#5cb85c',
          }
          return
        }
      })
    }
    return status
  }
  start = () => {
    const name = this.props.match.params.name
    const { cluster, appStackStart } = this.props
    modal.confirm({
      modalTitle: '启动堆栈',
      title: '该操作将启动堆栈内所有服务，待所有服务正常运行后，堆栈运行状态为正常',
      content: '确认启动该堆栈所有服务？',
      okText: '确认启动',
      onOk: () => {
        appStackStart({ cluster, name }).then(res => {
          if (res && res.code === 200) {
            this.setState({
              stopModal: false,
            })
            notification.success({ message: '启动成功' })
          } else {
            notification.success({ message: '启动失败' })
          }
        })
      },
      onCancel() {
      },
    })
  }
  stop = () => {
    const name = this.props.match.params.name
    const { cluster, appStackStop } = this.props
    modal.confirm({
      modalTitle: '停止堆栈',
      title: '该操作将停止堆栈内所有服务，待所有服务停止运行后，堆栈运行状态为未启动',
      content: '确认停止该堆栈所有服务？',
      okText: '确认停止',
      onOk: () => {
        appStackStop({ cluster, name }).then(res => {
          if (res && res.code === 200) {
            this.setState({
              stopModal: false,
            })
            notification.success({ message: '停止成功' })
          } else {
            notification.success({ message: '停止失败' })
          }
        })
      },
      onCancel() {
      },
    })
  }
  deleteStack = () => {
    const name = this.props.match.params.name
    const { cluster, appStackDelete } = this.props
    modal.confirm({
      modalTitle: '删除堆栈模板',
      title: '该操作将删除对应堆栈模板的所有内容，且无法恢复！',
      content: '确认执行删除操作？',
      okText: '确认删除',
      onOk: () => {
        appStackDelete({ cluster, name }).then(res => {
          if (res && res.code === 200) {
            this.setState({
              delModal: false,
            })
            this.props.history.push('/app-stack')
            notification.success({ message: '删除成功' })
          } else {
            notification.error({ message: '删除失败' })
          }
        })
      },
      onCancel() {
      },
    })
  }
  render() {
    const name = this.props.match.params.name
    const { appStacksDetail, loading } = this.props
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
          <Button onClick={this.stop} loading={stopLoading}>
            <span className={styles.stopIcon} style={{ background: '#666' }}></span>停止
          </Button>
          <Button onClick={this.deleteStack} loading={delLoading} icon="delete">删除</Button>
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
    </div>
  }
}

export default StackAppsDetail
