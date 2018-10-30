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
import { Icon, Row, Col, Button } from 'antd'
import { withRouter, RouteComponentProps } from 'dva/router'
import TenxEditor from '@tenx-ui/editor'
import '@tenx-ui/editor/assets/index.css'
import 'codemirror/mode/yaml/yaml'
import queryString from 'query-string'
import styles from './styles/index.less'
import { connect, SubscriptionAPI } from 'dva'

interface CreateWorkLoadProps extends RouteComponentProps, SubscriptionAPI {

}

class CreateWorkLoad extends React.Component<CreateWorkLoadProps, any> {
  state = {
    value: 'echo',
    editflag: false, // 默认是创建
  }
  onChange = value => {
    this.setState({ value })
  }
  componentDidMount() {
    const { history, location: { search }  } = this.props
    const editflag = queryString.parse(search).edit || false
    this.setState({ editflag })
  }
  createOrEditNative = () => {
    if (!this.state.editflag) { // 创建
      // const payload = { cluster:, yaml: this.state.value }
      this.props.dispatch({ type: 'createNative/createNativeResource' })
    }
  }
  render() {
    return(
      <Page>
      <QueueAnim>
          <TenxEditor
            onChange={this.onChange}
            title="Yaml"
            options={{ mode: 'xml', theme: 'base16-dark' }}
            value={this.state.value}
            headerExtraContent={
            <span className={styles.editOperation}>
              <Icon type="plus" theme="outlined" />
              <Icon type="save" theme="outlined" />
            </span>}
          />
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
  return {}
}
export default withRouter(connect(mapStateToProps)(CreateWorkLoad))
