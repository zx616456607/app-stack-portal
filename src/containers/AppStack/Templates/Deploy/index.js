/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * StackTemplateDeploy
 *
 * @author zhouhaitao
 * @date 2018-11-23
 */

import React from 'react'
import QueueAnim from 'rc-queue-anim'
import {
  Card, Form, Input, Collapse, Table, Button, notification, InputNumber,
} from 'antd'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import Loader from '@tenx-ui/loader'
import yamlParser from 'js-yaml'
import styles from './style/index.less'
import { addAppStackLabelsForResource } from './utils'

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
  const { app: { cluster = '' } = {}, appStack, loading } = state
  const { templateDetail } = appStack
  return { cluster, templateDetail, loading }
}, dispatch => ({
  appStackTemplateDetail: name => dispatch({
    type: 'appStack/fetchAppStackTemplateDetail',
    payload: ({ name }),
  }),
  deployAppstack: payload => dispatch({
    type: 'appStack/fetchDeployAppstack',
    payload,
  }),
}))
class StackTemplateDeploy extends React.Component {
  state = {
    templateContent: {},
    templateInputs: {},
    collapseActiveKey: [],
    btnLoading: false,
  }

  columns = [
    {
      title: '参数名称',
      dataIndex: 'key',
    },
    {
      title: '参数类型',
      dataIndex: 'kind',
    },
    {
      title: '参数值',
      dataIndex: 'default',
      render: (value, input) => {
        const { form } = this.props
        const { getFieldDecorator } = form
        const { key, _shortId, description, type } = input
        return <FormItem>
          {
            getFieldDecorator(`${_shortId}-${key}`, {
              initialValue: value,
              rules: [
                {
                  required: true,
                  message: `请填写${description}`,
                },
              ],
            })(
              type === 'number'
                ? <InputNumber placeholder={description} style={{ width: '100%' }} />
                : <Input placeholder={description} />
            )
          }
        </FormItem>
      },
    },
    {
      title: '参数描述',
      dataIndex: 'description',
    },
  ]

  _findInputKind = (nodes, input) => {
    if (!nodes) {
      return 'Application'
    }
    if (!Array.isArray(nodes)) {
      return nodes.kind
    }
    const _checkInputIsExistByKey = node => {
      let isExist = false
      const _checkClosures = _node => {
        Object.entries(_node).forEach(([ , value ]) => {
          if (!value) {
            return
          }
          if (value.get_input === input.key) {
            isExist = true
            return
          }
          if (typeof value === 'object') {
            return _checkClosures(value)
          }
        })
      }
      _checkClosures(node)
      return isExist
    }
    for (let i = 0; i < nodes.length; i++) {
      if (_checkInputIsExistByKey(nodes[i])) {
        return nodes[i].kind
      }
    }
  }

  async componentDidMount() {
    const { appStackTemplateDetail, match } = this.props
    try {
      await appStackTemplateDetail(match.params.name)
      const { templateDetail } = this.props
      const templateContent = JSON.parse(templateDetail.content)
      const { inputs, nodes } = templateContent
      const templateInputs = {}
      Object.entries(inputs).forEach(([ _shortId, input ], index) => {
        Object.entries(input).forEach(([ key, inputObj ]) => {
          if (index === 0) {
            this.setState({ collapseActiveKey: [ inputObj.label ] })
          }
          inputObj.key = key
          inputObj._shortId = _shortId
          inputObj.kind = this._findInputKind(nodes[_shortId], inputObj)
          // inputObj.kind = nodes[_shortId] && nodes[_shortId].kind || 'Application'
          templateInputs[inputObj.label] = templateInputs[inputObj.label] || []
          templateInputs[inputObj.label].push(inputObj)
        })
      })
      // sort inputs: move input without default value to the front
      Object.keys(templateInputs).forEach(key => {
        templateInputs[key].sort((inputA, inputB) => {
          const order = (inputA.default !== '' && inputB.default === '')
            ? 1
            : 0
          return order
        })
      })
      this.setState({ templateContent, templateInputs })
    } catch (error) {
      console.warn(error)
      notification.warn({
        message: '获取堆栈详情模版失败',
      })
    }
  }

  _idShort = id => id.split('-')[0]

  appStackStart = () => {
    const { form, deployAppstack, cluster, history } = this.props
    const { validateFields } = form
    validateFields(async (err, values) => {
      if (err) {
        return
      }
      this.setState({ btnLoading: true })
      // _graph.cells
      const { templateContent } = this.state
      const k8sManifest = []
      const _relaceInput2Value = (template, id, parentId) => {
        Object.entries(template).forEach(([ key, value ]) => {
          if (!value) {
            return
          }
          if (value.get_input) {
            template[key] = values[`${id}-${value.get_input}`]
            if (template[key] === undefined) {
              template[key] = values[`${parentId}-${value.get_input}`]
            }
            return
          }
          if (typeof value === 'object') {
            _relaceInput2Value(value, id, parentId)
          }
        })
      }
      templateContent._graph.cells.forEach(({ _app_stack_template, id, parent }) => {
        const _shortId = this._idShort(id)
        if (_app_stack_template) {
          if (!Array.isArray(_app_stack_template)) {
            _app_stack_template = [ _app_stack_template ]
          }
          _app_stack_template.forEach(template => {
            _relaceInput2Value(template, _shortId, this._idShort(parent))
            addAppStackLabelsForResource(values.stackName, template)
            // remove undefined value
            k8sManifest.push(JSON.parse(JSON.stringify(template)))
          })
        }
      })

      try {
        const res = await deployAppstack({
          name: values.stackName,
          cluster,
          description: values.description,
          body: {
            conent: JSON.stringify(templateContent._graph),
            k8sManifest: k8sManifest.map(template => yamlParser.safeDump(template)).join('---\n'),
          },
        })
        console.warn('res', res)
        notification.success({
          message: '启动应用堆栈成功',
        })
        history.push('/app-stack')
      } catch (error) {
        console.warn('error', error)
        notification.warn({
          message: '启动应用堆栈失败',
        })
      } finally {
        this.setState({ btnLoading: false })
      }
    })
  }

  onCollapseChange = keys => {
    this.setState({ collapseActiveKey: keys })
  }

  render() {
    const { match, loading, form } = this.props
    const { getFieldDecorator } = form
    const templateDetailLoading = loading.effects['appStack/fetchAppStackTemplateDetail']
    const { templateInputs, collapseActiveKey, btnLoading } = this.state
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
                    <div>{match.params.name}</div>
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="堆栈名称"
                  >
                    {
                      getFieldDecorator('stackName', {
                        // initialValue: match.params.name,
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
                        // initialValue: templateDetail && templateDetail.description,
                      })(<TextArea placeholder="请输入堆栈描述"/>)
                    }
                  </FormItem>
                </div>
              </div>
              <span className={styles.splitLine}></span>
              <div className={styles.config}>
                <h2>参数配置</h2>
                <div className={styles.configContent}>
                  <Collapse
                    bordered={false}
                    activeKey={collapseActiveKey}
                    onChange={this.onCollapseChange}
                  >
                    {
                      Object.entries(templateInputs).map(([ label, inputs ]) => {
                        return <Panel header={label} key={label} style={panelStyle}>
                          <Table
                            columns={this.columns}
                            dataSource={inputs}
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
                <Button type="primary" onClick={this.appStackStart} loading={btnLoading}>
                启动应用堆栈
                </Button>
              </div>
            </Form>
          </Card>
      }
    </QueueAnim>
  }
}

export default Form.create()(StackTemplateDeploy)
