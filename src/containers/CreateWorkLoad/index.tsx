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
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import { analyzeYamlBase } from './tool'
import { confirm } from '@tenx-ui/modal'
import { getUnifiedHistory } from '@tenx-ui/utils/es/UnifiedLink'
import set from 'lodash/set'

interface CreateWorkLoadProps extends RouteComponentProps, SubscriptionAPI {
  cluster: string,
  yamlValue: yamlString,
  editorWarn: any[],
  namespace: string
}

interface CreateWorkLoadState {
  editflag: boolean;
}
class CreateWorkLoad extends React.Component<CreateWorkLoadProps, CreateWorkLoadState> {
  state = {
    editflag: false, // 默认是创建
  }
  timer: any
  analyzeNamespace = (res) => {
    const flag =  res.every(element => {
      const inameSpace = getDeepValue(element, ['metadata', 'namespace'])
      if (inameSpace === null) { return true }
      return inameSpace === this.props.namespace
    });
    if (flag === false) {
      const npayload = { type: 'add', message: ['analyzeNamespace', ''] }
      this.props.dispatch({ type: 'createNative/patchWarn', payload: npayload })
    }
    if (flag === true) {
      const npayload = { type: 'delete', message: ['analyzeNamespace', ''] }
      this.props.dispatch({ type: 'createNative/patchWarn', payload: npayload })
    }
  }
  analyze = (value) => {
    let res: any[] = []
    try {
      res = (analyzeYamlBase(value) as any[])
    } catch (error) {
      const { reason } = error
      const npayload = { type: 'add', message: ['yamlBasegrammar', reason] }
      this.props.dispatch({ type: 'createNative/patchWarn', payload: npayload })
      return false
    }
    this.analyzeNamespace(res)
    const payload = { type: 'delete', message: ['yamlBasegrammar', ''] }
    this.props.dispatch({ type: 'createNative/patchWarn', payload })
  }
  onBeforeChange = ( value: string ) => {
    if (this.timer) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(() => {
      this.analyze(value)
    }, 800);
    this.props.dispatch({ type: 'createNative/updateYamlValue', payload: { yamlValue: value } })
  }
  getRouteData = () => {
    const { location: { search }, match: { params } } = this.props
    let paramsData
    if (search) {
      paramsData = queryString.parse(search)
      if (params.type) {
        paramsData.type = params.type
      }
    } else {
      paramsData = params
    }
    return paramsData
  }
  componentWillUnmount() {
    const payload = { type: 'delete', message: ['all', ''] }
    this.props.dispatch({ type: 'createNative/patchWarn', payload })
    const editflag = this.getRouteData() && this.getRouteData().edit || false
    if (editflag) {
      this.props.dispatch({ type: 'createNative/updateYamlValue', payload: { yamlValue: '' } })
    }
  }
  composeFileCreate = async () => {
    const templateid = this.getRouteData() && this.getRouteData().templateid || false
    if (!templateid) { return }
    const payload = { id: templateid  }
    let res
    try {
      res = await this.props.dispatch({ type: 'createNative/loadStackDetail', payload })
    } catch (e) {
      return notification.warn({ message: '加载编排文件详情失败', description: '' })
    }
    const content = getDeepValue(res, [ 'data', 'content' ])
    this.props.dispatch({ type: 'createNative/updateYamlValue', payload: { yamlValue: content } })
  }
  async componentDidMount() {
    const routeData = this.getRouteData()
    const editflag = routeData && routeData.edit || false
    this.setState({ editflag })
    if (editflag === false && this.props.yamlValue !== '') {
      confirm({
        modalTitle: '打开未保存的yaml',
        title: '您有未保存的yaml，是否要打开未保存的yaml？',
        width: 420,
        onOk() {
        },
        onCancel: () => {
          this.props.dispatch({ type: 'createNative/updateYamlValue', payload: { yamlValue: '' } })
        },
      })
    }
    this.composeFileCreate()
    if (!routeData || !routeData.name || !routeData.type) { return } // 如果参数不全, 直接返回
    const payload = { cluster: this.props.cluster, type: routeData.type, name: routeData.name }
    try {
      const res = await
      this.props.dispatch({ type: 'NativeResourceList/getNativeResourceDetail', payload })
      const K8sConfigJson = { kind: routeData.type, ...(res as any).data }
      const newPayload = { yamlValue: yaml.dump(K8sConfigJson)  }
      this.props.dispatch({ type: 'createNative/updateYamlValue', payload: newPayload })
    } catch (e) {
      notification.warn({ message: '获取详情失败', description: '' })
    }
    await this.analyze(this.props.yamlValue)
  }
  setYamlValue = (value: yamlString) => {
    this.props.dispatch({ type: 'createNative/updateYamlValue', payload: { yamlValue: value } })
  }
  createOrEditNative = async () => {
    const { match: { params }  } = this.props
    const urlCluster = params.cluster
    const cluster = urlCluster === undefined ? this.props.cluster : urlCluster
    const jsonConfigs = this.props.yamlValue.split('---').map((yamlConfig) => {
      try {
        const json = yaml.load(yamlConfig)
        set(json, [ 'metadata', 'resourceVersion' ], undefined) // 这个字段会导致后台创建失败, 需要去掉
        return yaml.dump(json)
      } catch (e) {
        console.warn(e)
        return {}
      }
    }).join('---')
    const payload = { cluster, yaml: jsonConfigs }
    const unifiedHistory = getUnifiedHistory()
    if (!this.state.editflag) { // 创建
      try {
        if (params.type === 'PodSecurityPolicy') {
          await this.props.dispatch({ type: 'createNative/createPSP', payload })
          setTimeout( () => unifiedHistory.goBack(), 600)
          return
        }
        await this.props.dispatch({ type: 'createNative/createNativeResource', payload })
        notification.success({ message: '创建成功', description: '' })
        setTimeout( () => {
          this.props.dispatch({ type: 'createNative/updateYamlValue', payload: { yamlValue: '' } })
          unifiedHistory.goBack()
        }, 600)
      } catch (e) {
        const { code, reason, message } = e.response
        if (code ===  409 && reason === 'AlreadyExists') {
          return notification.warn({ message: '该资源已经存在', description: reason })
        }
        if (code === 500) {
          return notification.warn({ message: 'yaml格式错误', description: reason })
        }
        notification.warn({ message: '创建失败', description: message })
      }
      return
    }
    if (this.state.editflag) { // 编辑
      try {
        if (params.type === 'PodSecurityPolicy') {
          await this.props.dispatch({ type: 'createNative/updatePSP', payload })
          setTimeout( () => unifiedHistory.goBack(), 600)
          return
        }
        await this.props.dispatch({ type: 'createNative/updateNativeResource', payload })
        notification.success({ message: '更新成功', description: '' })
        setTimeout( () => {
          this.props.dispatch({ type: 'createNative/updateYamlValue', payload: { yamlValue: '' } })
          unifiedHistory.goBack()
        }, 600)
      } catch (e) {
        const { code, message } = e.response
        if (code === 500) {
          return notification.warn({ message: 'yaml格式错误', description: '' })
        }
        notification.success({ message: '更新失败', description: message })
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
          setYamlValue={this.setYamlValue}
          editorWarn={this.props.editorWarn}
        />
        </div>
      </QueueAnim>
    </Page>
    )
  }
}

function mapStateToProps(state) {
  const { app: { cluster = '' } = {}, createNative: { yamlValue = '' } = {} } = state
  const editorWarn = getDeepValue(state, ['createNative', 'editorWarn' ])
  const namespace = getDeepValue(state, ['app', 'project'])
  return { cluster, yamlValue, editorWarn, namespace }
}
export default withRouter(connect(mapStateToProps)(CreateWorkLoad))
