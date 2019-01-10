/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * AppStackDesigner
 *
 * @author zhangpc
 * @date 2018-11-14
 */

import React from 'react'
import '@tenx-ui/page/assets/index.css'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'dva'
import { confirm } from '@tenx-ui/modal'
import { notification, Modal, Form, Input } from 'antd'
import yamlParser from 'js-yaml'
import styles from './style/index.less'
import YamlDock from './YamlDock'
import PaperGraph from './PaperGraph'

const FormItem = Form.Item
const APP_STACK_LOCAL_STORAGE_KEY = '_app_stack_graph'

const mapStateToProps = state => {
  const { app: { cluster = '' } = {}, appStack, loading } = state
  const { templateDetail } = appStack
  return { cluster, templateDetail, loading }
}
@Form.create()
@connect(mapStateToProps)
export default class AppStackDesigner extends React.Component {
  state = {
    templateYamlStr: `nodes: []
inputs: []`,
    inputYamlStr: '',
    yamlObj: {},
    createBtnLoading: false,
    yamlDockVisible: false,
    yamlDockSize: null,
    saveStackModal: false,
    saveStackBtnLoading: false,
  }

  editMode = this.props.match.path === '/app-stack/designer/:name/edit'

  yarmlEditor = undefined

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type: 'appStack/clearAppStackTemplateDetail',
    })
    window.addEventListener('beforeunload', this.handleWindowClose)
  }

  componentWillUnmount() {
    const { dispatch } = this.props
    dispatch({
      type: 'appStack/clearAppStackTemplateDetail',
    })
    window.removeEventListener('beforeunload', this.handleWindowClose)
    this._saveGraphObj2LS()
  }

  handleWindowClose = () => {
    this._saveGraphObj2LS()
    return true
  }

  // edit mode not support
  _saveGraphObj2LS = () => {
    if (this.editMode || !this.graph) {
      return
    }
    const graphData = JSON.stringify(this.graph.toJSON())
    return localStorage.setItem(APP_STACK_LOCAL_STORAGE_KEY, graphData)
  }

  _removeGraphObjFromLS = () => {
    return localStorage.removeItem(APP_STACK_LOCAL_STORAGE_KEY)
  }

  _getGraphObjFromLS = () => {
    return localStorage.getItem(APP_STACK_LOCAL_STORAGE_KEY)
  }

  initGraph = async () => {
    const {
      match: { path, params: { name } },
      dispatch,
    } = this.props
    // editMode: get app stack template detail
    if (path === '/app-stack/designer/:name/edit') {
      try {
        await dispatch({
          type: 'appStack/fetchAppStackTemplateDetail',
          payload: ({ name }),
        })
        const { templateDetail } = this.props
        const { _graph } = JSON.parse(templateDetail.content)
        if (_graph && _graph.cells) {
          this.graph.initGraph(_graph)
        }
      } catch (error) {
        console.warn(error)
        notification.error({
          message: '加载模版详情失败',
        })
      }
      return
    }
    // check localStorage
    let graphData = this._getGraphObjFromLS()
    try {
      graphData = JSON.parse(graphData)
    } catch (error) {
      //
    }
    if (graphData && graphData.cells && graphData.cells.length > 0) {
      const self = this
      confirm({
        modalTitle: '打开未保存模板',
        title: '您有未保存的模板，是否要打开未保存的模板？',
        width: 420,
        onOk() {
          self.graph.initGraph(graphData)
        },
        onCancel() {
          self._removeGraphObjFromLS()
        },
      })
    }
  }

  graph2Yaml = () => {
    const yamlObj = {
      nodes: {},
      inputs: {},
    }
    this.graph.getCells().forEach(cell => {
      const { id, attributes: { _app_stack_template, _app_stack_input } } = cell
      const _shortId = this.graph.idShort(id)
      if (_app_stack_template) {
        yamlObj.nodes[_shortId] = _app_stack_template
      }
      if (_app_stack_input) {
        yamlObj.inputs[_shortId] = _app_stack_input
      }
    })
    this.setState({
      yamlObj,
      templateYamlStr: yamlParser.safeDump(yamlObj),
      inputYamlStr: yamlParser.safeDump(yamlObj.inputs),
    })
  }

  yaml2Graph = (templateYamlStr, inputYamlStr) => {
    if (templateYamlStr === undefined && inputYamlStr === undefined) {
      return
    }
    try {
      let { yamlObj = {} } = this.state
      if (templateYamlStr !== undefined) {
        yamlObj = yamlParser.safeLoad(templateYamlStr) || {}
      } else {
        yamlObj.inputs = yamlParser.safeLoad(inputYamlStr)
      }
      this.setState({ yamlObj })
      const nodes = yamlObj.nodes || {}
      const inputs = yamlObj.inputs || {}
      let cells = this.graph.getCells()
      cells = cells.filter(({ attributes: { type } }) => type !== 'link')
      cells.forEach(cell => {
        const key = this.graph.idShort(cell.id)
        if (!nodes[key]) {
          cell.remove()
          this.graph2Yaml()
          return
        }
        cell.attributes._app_stack_template = nodes[key]
        cell.attributes._app_stack_input = inputs[key]
      })
    } catch (error) {
      console.warn('parse yaml failed', error)
    }
  }

  onStackSave = () => {
    const { form, dispatch, history } = this.props
    const { validateFields } = form
    validateFields(async (err, body) => {
      if (err) {
        return
      }
      const _graph = this.graph.toJSON()
      // check empty stack
      if (_graph.cells.length === 0) {
        this.setState({ saveStackModal: false })
        notification.info({
          message: '保存堆栈模版失败',
          description: '无效的空白模版',
        })
        return
      }
      // check if have DeploymentService
      let isHaveDeploymentService = false
      _graph.cells.every(cell => {
        if (cell.type === 'devs.DeploymentService') {
          isHaveDeploymentService = true
          return false
        }
        return true
      })
      if (!isHaveDeploymentService) {
        this.setState({ saveStackModal: false })
        notification.info({
          message: '保存堆栈模版失败',
          description: '堆栈模版至少要包含一个服务',
        })
        return
      }
      // check link
      let linkCheckPassed = true
      const links = _graph.cells.filter(({ type }) => type === 'link')
      _graph.cells.every(cell => {
        const { _link_rules, id } = cell
        if (!_link_rules || !_link_rules.required) {
          return true
        }
        let isLink = false
        links.every(({ source: { id: sourceId }, target: { id: targetId } }) => {
          if (sourceId === id || targetId === id) {
            isLink = true
            return false
          }
          return true
        })
        if (!isLink) {
          linkCheckPassed = false
          notification.warn({
            message: _link_rules.message,
          })
          return false
        }
        return true
      })
      if (!linkCheckPassed) {
        this.setState({ saveStackModal: false })
        return
      }
      this.setState({ saveStackBtnLoading: true })
      const { name } = body
      const { yamlObj } = this.state
      body.content = JSON.stringify({
        ...yamlObj,
        _graph,
      })
      try {
        await dispatch({
          type: (
            this.editMode
              ? 'appStack/fetchUpdateAppstack'
              : 'appStack/fetchCreateAppstack'
          ),
          payload: {
            name,
            body,
          },
        })
        this.setState({ saveStackModal: false })
        notification.success({
          message: '保存堆栈模版成功',
        })

        // clear graph for handleWindowClose
        this.graph.clear()

        this._removeGraphObjFromLS()
        history.push('/app-stack/templates')
      } catch (error) {
        if (error.status === 409) {
          notification.warn({
            message: `堆栈 ${name} 已存在，请使用其他名称`,
          })
          return
        }
        notification.warn({
          message: '保存堆栈模版失败',
        })
      } finally {
        this.setState({ saveStackBtnLoading: false })
      }
    })
  }

  onYamlTabChange = yamlTabKey => {
    // sync graph to yaml when change tab
    this.graph2Yaml()
    this.setState({ yamlEditorTabKey: yamlTabKey })
  }

  render() {
    const { form, templateDetail } = this.props
    const { getFieldDecorator } = form
    const {
      yamlDockSize, yamlDockVisible, saveStackModal, saveStackBtnLoading,
      templateYamlStr, inputYamlStr,
    } = this.state
    const FormItemLayout = {
      labelCol: {
        span: 4,
      },
      wrapperCol: {
        span: 20,
      },
    }
    return (
      <div
        id="appStackDesigner"
        className={styles.appStackDesigner}
      >
        <QueueAnim
          style={{
            marginBottom: (yamlDockVisible ? yamlDockSize : 0),
          }}
          // onEnd={this.initDesigner}
        >
          <PaperGraph
            key="designer"
            editMode={this.editMode}
            onGraphChange={this.graph2Yaml}
            onGraphSave={() => this.setState({ saveStackModal: true })}
            toogleYamlDockVisible={() => this.setState({
              yamlDockVisible: !yamlDockVisible,
            })}
            onLoad={(paper, graph) => {
              this.paper = paper
              this.graph = graph
              this.initGraph()
            }}
          />
        </QueueAnim>
        <YamlDock
          visible={yamlDockVisible}
          onVisibleChange={visible => this.setState({ yamlDockVisible: visible })}
          onTabChange={this.onYamlTabChange}
          onSizeChange={size => this.setState({ yamlDockSize: size })}
          onYamlChange={({ templateYamlStr: template, inputYamlStr: input }) => {
            this.setState({ templateYamlStr: template, inputYamlStr: input })
            this.yaml2Graph(template, input)
          }}
          value={{ templateYamlStr, inputYamlStr }}
        />
        <Modal
          title="保存堆栈模板"
          okText="确认保存"
          visible={saveStackModal}
          confirmLoading={saveStackBtnLoading}
          onOk={this.onStackSave}
          onCancel={() => this.setState({ saveStackModal: false })}
        >
          <Form>
            <FormItem
              {...FormItemLayout}
              label="模板名称"
            >
              {getFieldDecorator('name', {
                initialValue: templateDetail && templateDetail.name,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: '请输入堆栈名称',
                  },
                ],
              })(
                <Input disabled={this.editMode} placeholder="请输入堆栈名称" />
              )}
            </FormItem>
            <FormItem
              {...FormItemLayout}
              label="模板描述"
            >
              {getFieldDecorator('description', {
                initialValue: templateDetail && templateDetail.description,
              })(
                <Input.TextArea placeholder="请输入堆栈描述" />
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    )
  }
}
