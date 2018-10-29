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
import styles from './styles/index.less'

interface CreateWorkLoadProps extends RouteComponentProps {

}

class CreateWorkLoad extends React.Component<CreateWorkLoadProps, any> {
  state = {
    value: 'echo',
  }
  onChange = value => {
    this.setState({ value })
  }
  render() {
    const { history } = this.props
    return(
      <Page>
      <QueueAnim>
        <Row>
          <Col span={24}>
          <TenxEditor
            onChange={this.onChange}
            title="Yaml"
            options={{ mode: 'yaml', theme: 'default' }}
            value={this.state.value}
            headerExtraContent={
            <span className={styles.editOperation}>
              <Icon type="plus" theme="outlined" />
              <Icon type="save" theme="outlined" />
            </span>}
          />
          </Col>
          <Col span={0}>
            <div>
              "// TODO: 操作板, 下期做"
            </div>
          </Col>
        </Row>
        <div className={styles.operationBar}>
          <div>
            <Button
              onClick={() => history.goBack()}
            >
              取消
            </Button>
            <Button type="primary">确定</Button>
          </div>
        </div>
      </QueueAnim>
    </Page>
    )
  }
}

export default withRouter(CreateWorkLoad)
