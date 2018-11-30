/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * TempStackDetail
 *
 * @author zhouhaitao
 * @date 2018-11-23
 */

import React from 'react'
import QueueAnim from 'rc-queue-anim'
import { Card, Form, Input, Collapse, Table, Button } from 'antd'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import Loader from '@tenx-ui/loader'
import styles from './style/index.less'
import Ellipsis from '@tenx-ui/ellipsis'
const FormItem = Form.Item
const { TextArea } = Input
const Panel = Collapse.Panel
const formItemLayout = {
  labelCol: {
    sm: { span: 8, pull: 5 },
  },
  wrapperCol: {
    sm: { span: 16, pull: 5 },
  },
}
const panelStyle = {
  background: '#f7f7f7',
  marginBottom: 24,
  border: 0,
  overflow: 'hidden',
};

@connect(state => {
  const { appStack, loading } = state
  const { templateDetail } = appStack
  return { templateDetail, loading }
}, dispatch => ({
  appStackTemplateDetail: name => dispatch({
    type: 'appStack/fetchAppStackTemplateDetail',
    payload: ({ name }),
  }),
}))
class TempStackDetail extends React.Component {
  state = {
    column: [
      {
        title: '参数名称',
        dataIndex: 'name',
        width: '25%',
        render: text => <Ellipsis lines={1}>{text}</Ellipsis>,
      },
      {
        title: '参数类型',
        dataIndex: 'label',
        width: '25%',
      },
      {
        title: '参数值',
        dataIndex: 'value',
        render: text => {
          return <Input defaultValue={text} style={{ width: 100 }}/>
        },
        width: '25%',
      },
      {
        title: '参数描述',
        dataIndex: 'description',
        width: '25%',
        render: text => <Ellipsis lines={1}>{text}</Ellipsis>,
      },
    ],

  }
  componentDidMount() {
    const { appStackTemplateDetail } = this.props
    appStackTemplateDetail(this.props.match.params.name)
  }
  appStackStart() {

  }
  render() {
    const { match, loading, templateDetail, form } = this.props
    const { getFieldDecorator } = form
    const templateDetailLoading = loading.effects['appStack/fetchAppStackTemplateDetail']
    const { column } = this.state
    let paramsConfig = []
    if (templateDetail) {
      try {
        const { inputs } = JSON.parse(templateDetail.content)
        paramsConfig = inputs
      } catch (e) {
        // do nothing
      }
    }
    return <QueueAnim
      id="tempStackDetail"
    >
      {
        templateDetailLoading ?
          <Loader spinning={true} fullScreen={true}/>
          :
          <Card key="tempStackDetail">
            <Form>
              <div className={styles.stackInfo}>
                <h2>堆栈信息</h2>
                <div className={styles.content}>
                  <FormItem
                    {...formItemLayout}
                    label="使用模板"
                  >
                    <div></div>
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="堆栈名称"
                  >
                    {
                      getFieldDecorator('stackName', {
                        initialValue: match.params.name,
                        rules: [
                          {
                            required: true,
                            message: '请填写堆栈名称',
                          },
                        ],
                      })(<Input placeholder="请输入堆栈名称"/>)
                    }
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="描述"
                  >
                    {
                      getFieldDecorator('description', {
                        initialValue: templateDetail && templateDetail.description,
                      })(<TextArea placeholder=""/>)
                    }

                  </FormItem>
                </div>
              </div>
              <span className={styles.splitLine}></span>
              <div className={styles.config}>
                <h2>参数配置</h2>
                <div className={styles.configContent}>
                  <Collapse bordered={false}>
                    {
                      Object.keys(paramsConfig).map(k => {
                        const item = paramsConfig[k].input
                        const data = []
                        Object.keys(item).forEach(j => {
                          data.push({
                            name: j,
                            label: item[j].label,
                            value: item[j].default,
                            description: item[j].description,
                            key: j,
                          })
                        })
                        return <Panel header={`标签: ${k}`} key={k} style={panelStyle}>
                          <Table
                            columns={column}
                            dataSource={data}
                            pagination={false}
                          />
                        </Panel>
                      })
                    }
                  </Collapse>
                </div>
              </div>
              <div className={styles.btnGroup}>
                <Link to="/app-stack/templates">
                  <Button>取消</Button>
                </Link>
                <Button type="primary" onClick={this.appStackStart}>启动应用堆栈</Button>
              </div>
            </Form>
          </Card>
      }
    </QueueAnim>
  }
}

export default Form.create()(TempStackDetail)
