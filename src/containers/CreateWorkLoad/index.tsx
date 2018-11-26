/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * index.tsx page
 *
 * @author zhangtao
 * @date Monday October 29th 2018
 */
import * as React from 'react'
import Page from '@tenx-ui/page'
import '@tenx-ui/page/assets/index.css'
import QueueAnim from 'rc-queue-anim'
import { notification } from 'antd'
import { withRouter, RouteComponentProps } from 'dva/router'
import queryString from 'query-string'
import { connect, SubscriptionAPI } from 'dva'
import yaml from 'js-yaml'
import { yamlString } from './editorType'
import Editor from './editor'

interface CreateWorkLoadProps extends RouteComponentProps, SubscriptionAPI {
  cluster: string,
  yamlValue: yamlString,
}

interface CreateWorkLoadState {
  editflag: boolean;
}
class CreateWorkLoad extends React.Component<CreateWorkLoadProps, CreateWorkLoadState> {
  state = {
    editflag: false, // 默认是创建
  }
  onBeforeChange = ( value: string ) => {
    this.props.dispatch({ type: 'createNative/updateYamlValue', payload: { yamlValue: value } })
  }
  async componentDidMount() {
    const { location: { search }  } = this.props
    const config = queryString.parse(search)
    const editflag = config.edit || false
    this.setState({ editflag })
    if (!config.name || !config.type) { return } // 如果参数不全, 直接返回
    const payload = { cluster: this.props.cluster, type: config.type, name: config.name }
    try {
      const res = await
      this.props.dispatch({ type: 'NativeResourceList/getNativeResourceDetail', payload })
      const K8sConfigJson = { kind: config.type, ...(res as any).data }
      const newPayload = { yamlValue: yaml.dump(K8sConfigJson)  }
      this.props.dispatch({ type: 'createNative/updateYamlValue', payload: newPayload })
    } catch (e) {
      notification.warn({ message: '获取详情失败', description: '' })
    }
  }
  setYamlValue = (value: yamlString) => {
    this.props.dispatch({ type: 'createNative/updateYamlValue', payload: { yamlValue: value } })
  }
  createOrEditNative = async () => {
    const { location: { search }  } = this.props
    const config = queryString.parse(search)
    const urlCluster = config.cluster
    const cluster = urlCluster === undefined ? this.props.cluster : urlCluster
    const payload = { cluster, yaml: this.props.yamlValue }
    if (!this.state.editflag) { // 创建
      try {
        if (config.type === 'PodSecurityPolicy') {
          await this.props.dispatch({ type: 'createNative/createPSP', payload })
          setTimeout( () => history.back(), 600)
          return
        }
        await this.props.dispatch({ type: 'createNative/createNativeResource', payload })
        notification.success({ message: '创建成功', description: '' })
        setTimeout( () => history.back(), 600)
      } catch (e) {
        const { code, reason } = e.response
        if (code === 409 && reason === 'AlreadyExists') {
          return notification.warn({ message: '该资源已经存在', description: reason })
        }
        if (code === 500) {
          return notification.warn({ message: 'yaml格式错误', description: reason })
        }
        notification.error({ message: '创建失败', description: reason })
      }
      return
    }
    if (this.state.editflag) { // 编辑
      try {
        if (config.type === 'PodSecurityPolicy') {
          await this.props.dispatch({ type: 'createNative/updatePSP', payload })
          setTimeout( () => history.back(), 600)
          return
        }
        await this.props.dispatch({ type: 'createNative/updateNativeResource', payload })
        notification.success({ message: '更新成功', description: '' })
        setTimeout( () => history.back(), 600)
      } catch (e) {
        const { code, reason } = e.response
        if (code === 500) {
          return notification.warn({ message: 'yaml格式错误', description: '' })
        }
        notification.success({ message: '更新失败', description: reason })
      }
    }
  }
  render() {
    return(
      <Page>
      <QueueAnim>
        <div key="page">
        <Editor
          onBeforeChange={this.onBeforeChange}
          value={this.props.yamlValue}
          createOrEditNative={this.createOrEditNative}
          editflag={this.state.editflag}
          dispatch={this.props.dispatch}
          history={this.props.history}
          setYamlValue={this.setYamlValue}
        />
        </div>
      </QueueAnim>
    </Page>
    )
  }
}

function mapStateToProps(state) {
  const { app: { cluster = '' } = {}, createNative: { yamlValue = '' } = {} } = state
  return { cluster, yamlValue }
}
export default withRouter(connect(mapStateToProps)(CreateWorkLoad))
