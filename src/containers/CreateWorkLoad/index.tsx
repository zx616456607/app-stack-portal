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
import { Icon, Button, notification } from 'antd'
import { withRouter, RouteComponentProps } from 'dva/router'
import TenxEditor from '@tenx-ui/editor'
import '@tenx-ui/editor/assets/index.css'
import 'codemirror/mode/yaml/yaml'
import queryString from 'query-string'
import styles from './styles/index.less'
import { connect, SubscriptionAPI } from 'dva'
import yaml from 'js-yaml'

interface CreateWorkLoadProps extends RouteComponentProps, SubscriptionAPI {
  cluster: string
}

class CreateWorkLoad extends React.Component<CreateWorkLoadProps, any> {
  state = {
    value: '',
    editflag: false, // 默认是创建
  }
  onChange = value => {
    this.setState({ value })
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
      this.setState({ value: yaml.dump(K8sConfigJson) })
    } catch (e) {
      notification.warn({ message: '获取详情失败', description: '' })
    }
  }
  createOrEditNative = async () => {
    const payload = { cluster: this.props.cluster, yaml: this.state.value }
    const { location: { search }  } = this.props
    const config = queryString.parse(search)
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
          return notification.warn({ message: '该资源已经存在', description: '' })
        }
        if (code === 500) {
          return notification.warn({ message: 'yaml格式错误', description: '' })
        }
        notification.error({ message: '创建失败', description: '' })
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
        const { code } = e.response
        if (code === 500) {
          return notification.warn({ message: 'yaml格式错误', description: '' })
        }
        notification.success({ message: '更新失败', description: '' })
      }
    }
  }
  render() {
    return(
      <Page>
      <QueueAnim>
        <div className={styles.createNativeEdit}>
          <TenxEditor
            onChange={this.onChange}
            title="Yaml"
            options={{ mode: 'yaml', theme: 'base16-dark' }}
            value={this.state.value}
            headerExtraContent={
            <span className={styles.editOperation}>
              <Icon type="plus" theme="outlined" />
              <Icon type="save" theme="outlined" />
            </span>}
          />
        </div>
        <div className={styles.operationBar}>
          <div>
            <Button
              className={styles.darkButton}
              onClick={() => history.back()}
            >
              取消
            </Button>
            <Button
              type="primary"
              onClick={this.createOrEditNative}
            >
            {
              this.state.editflag ? '保存' : '确定'
            }
            </Button>
          </div>
        </div>
      </QueueAnim>
    </Page>
    )
  }
}

function mapStateToProps(state) {
  const { app: { cluster = '' } = {} } = state
  return { cluster }
}
export default withRouter(connect(mapStateToProps)(CreateWorkLoad))
