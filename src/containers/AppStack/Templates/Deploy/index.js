/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * StackTemplateDeploy
 *
 * @author zhouhaitao,zhangpc
 * @date 2018-11-23
 */

import React from 'react'
import QueueAnim from 'rc-queue-anim'
import {
  Card, Form, Input, Collapse, Table, Button, notification, InputNumber,
  Select,
} from 'antd'
import UnifiedLink, { historyPush } from '@tenx-ui/utils/es/UnifiedLink'
import { connect } from 'dva'
import Loader from '@tenx-ui/loader'
import yamlParser from 'js-yaml'
import styles from './style/index.less'
import { addAppStackLabelsForResource } from './utils'
import cloneDeep from 'lodash/cloneDeep'
import _set from 'lodash/set'
import { k8sNameCheck } from '../../../../utils/helper'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import * as _builtInFunction from '../../Designer/shapes/_builtInFunction'
import { fullGraph } from '../../Designer/shapes'
import sortBy from 'lodash/sortBy'

const ELEMENT_KIND_INPUT_MAP = {
  AppStack: {
    key: 'stackName',
    overwrite: true,
    text: '堆栈',
  },
  Application: {
    key: 'app_name',
    text: '应用',
  },
  Deployment: {
    key: 'deployment_name',
    text: '服务',
  },
  Service: {
    key: 'service_name',
    text: '服务或服务发现',
  },
  ConfigMap: {
    key: 'configMap_name',
    text: '服务配置',
  },
  CronJob: {
    key: 'cronJob_name',
    text: 'CronJob',
  },
  Job: {
    key: 'job_name',
    text: 'Job',
  },
  Secret: {
    key: 'secret_name',
    text: '加密配置',
  },
  StatefulSet: {
    key: 'statefulSet_name',
    text: 'StatefulSet',
  },
  PersistentVolumeClaim: {
    key: 'pvc_name',
    text: '存储',
  },
}
const FormItem = Form.Item
const Option = Select.Option
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

@connect(state => {
  const { app: { cluster = '' } = {}, appStack, loading } = state
  const { templateDetail, appStackConfigs } = appStack
  return {
    cluster, templateDetail, loading,
    appStackConfigs: appStackConfigs || {},
  }
}, dispatch => ({
  appStackTemplateDetail: name => dispatch({
    type: 'appStack/fetchAppStackTemplateDetail',
    payload: ({ name }),
  }),
  deployAppstack: payload => dispatch({
    type: 'appStack/fetchDeployAppstack',
    payload,
  }),
  getAppstackConfigs: payload => dispatch({
    type: 'appStack/fetchAppstackConfigs',
    payload,
  }),
}))
class StackTemplateDeploy extends React.Component {
  state = {
    templateContent: {},
    templateInputs: {},
    collapseActiveKeys: [],
    btnLoading: false,
  }

  getSelectOptions = ({ backend, configType, candidates }) => {
    if (!backend) {
      if (!candidates || !Array.isArray(candidates)) {
        return []
      }
      return candidates.map(key => {
        const keyType = typeof key
        if (keyType === 'string' || keyType === 'number') {
          return {
            id: key,
            name: key,
          }
        }
        if (!key.id || !key.name) {
          const error = new Error('The item of candidates should be a string, number or like this: { id: 213, name: \'test\' }')
          console.warn('candidates', candidates, error)
          return {
            id: 'invalid',
            name: 'invalid candidates',
            disabled: true,
          }
        }
        return key
      })
    }
    const { appStackConfigs } = this.props
    let options = appStackConfigs[configType] || []
    if (!Array.isArray(options)) {
      console.warn(`${configType} return value must be a array like this: { id: 213, name: \'test\' }`)
      options = [
        {
          id: 'invalid',
          name: 'invalid appStackConfigs',
          disabled: true,
        },
      ]
    }
    return options
  }

  renderInput = input => {
    const { type, description, optionDesc } = input
    let optionDescStr = ''
    if (optionDesc) {
      optionDescStr = `(${optionDesc})`
    }
    switch (type) {
      case 'select':
        return (
          <Select
            showSearch
            dropdownMatchSelectWidth={false}
            placeholder={`${description} ${optionDescStr}`}
            filterOption={(value, option) =>
              option.props.children.toLowerCase().indexOf(value.toLowerCase()) >= 0
            }
          >
            {
              this.getSelectOptions(input).map(({ name, id, disabled }) =>
                <Option key={id} disabled={disabled}>
                  {name} {optionDescStr}
                </Option>
              )
            }
          </Select>
        )
      case 'number':
        return <InputNumber placeholder={description} style={{ width: '100%' }} />
      default:
        return <Input placeholder={description} />
    }
  }

  columns = [
    {
      title: '参数名称',
      dataIndex: 'key',
      width: '20%',
    },
    {
      title: '参数类型',
      dataIndex: 'kind',
      width: '15%',
    },
    {
      title: '元素 ID',
      dataIndex: '_shortId',
      width: '10%',
    },
    {
      title: '参数值',
      dataIndex: 'default',
      width: '40%',
      render: (value, input) => {
        const { form } = this.props
        const { getFieldDecorator } = form
        const { key, _shortId, description } = input
        return <FormItem>
          {
            getFieldDecorator(`${_shortId}-${key}`, {
              initialValue: value || undefined,
              rules: [
                {
                  required: true,
                  message: `请填写${description}`,
                },
              ],
            })(
              this.renderInput(input)
            )
          }
        </FormItem>
      },
    },
    {
      title: '参数描述',
      dataIndex: 'description',
      width: '15%',
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

  getBackendLoadQuery = ({ needCluster }) => {
    const query = {}
    const { cluster } = this.props
    if (needCluster) {
      query.clusterID = cluster
    }
    return query
  }

  async componentDidMount() {
    const { appStackTemplateDetail, match, getAppstackConfigs } = this.props
    try {
      await appStackTemplateDetail(match.params.name)
      const { templateDetail } = this.props
      const templateContent = JSON.parse(templateDetail.content)
      const { inputs, nodes, _graph } = templateContent
      if (!nodes) {
        notification.warn({
          message: '解析堆栈异常',
          description: '未找到节点',
        })
        return
      }

      // full graph by nodes and inputs for deploy use
      templateContent._graph = fullGraph(_graph, nodes, inputs)

      const templateInputs = {}
      const loadByBackend = []
      Object.entries(inputs).forEach(([ _shortId, input ]) => {
        Object.entries(input).forEach(([ key, inputObj ]) => {
          if (inputObj.backend) {
            const { configType } = inputObj
            loadByBackend.push(getAppstackConfigs({
              configType,
              query: this.getBackendLoadQuery(inputObj),
            }))
          }
          inputObj.key = key
          inputObj._shortId = _shortId
          inputObj.kind = this._findInputKind(nodes[_shortId], inputObj)
          templateInputs[inputObj.label] = templateInputs[inputObj.label] || []
          templateInputs[inputObj.label].push(inputObj)
        })
      })
      // sort inputs: sort by id and desc
      Object.keys(templateInputs).forEach(key => {
        templateInputs[key] = sortBy(templateInputs[key], [ '_shortId', 'description' ])
      })
      // sort inputs: move input without default value to the front
      Object.keys(templateInputs).forEach(key => {
        templateInputs[key].sort((inputA, inputB) => {
          if (inputA.default === '' && inputB.default !== '') {
            return -1
          }
          if (inputA.default !== '' && inputB.default === '') {
            return 1
          }
          return 0
        })
      })
      this.setState({
        templateContent,
        templateInputs,
        // 默认展开所有 panel，否则未展开 panel 中的 form 表单不会渲染
        collapseActiveKeys: Object.keys(templateInputs),
      })
      await Promise.all(loadByBackend).catch(() => {
        notification.warn({
          message: '获取后端可选参数失败',
        })
      })
    } catch (error) {
      console.warn(error)
      notification.warn({
        message: '获取堆栈详情模版失败',
      })
    }
  }

  _idShort = id => id.split('-')[0]

  appStackStart = () => {
    const { form, deployAppstack, cluster, templateDetail } = this.props
    const { validateFieldsAndScroll, setFields } = form
    validateFieldsAndScroll(async (err, values) => {
      if (err) {
        return
      }
      const name = values.stackName
      this.setState({ btnLoading: true })
      // should clone template content here
      const templateContent = cloneDeep(this.state.templateContent)
      const k8sManifest = []
      const _relaceInput2Value = (template, id, parentId) => {
        Object.entries(template).forEach(([ key, value ]) => {
          if (!value) {
            return
          }
          const inputValue = value.get_input || value.get_inmap
          if (inputValue) {
            template[key] = values[`${id}-${inputValue}`]
            // if undefined, find parent input value
            if (template[key] === undefined && parentId) {
              template[key] = values[`${parentId}-${inputValue}`]
            }
            return
          }
          if (typeof value === 'object') {
            _relaceInput2Value(value, id, parentId)
          }
        })
      }
      const _relaceGetAttribute2Value = template => {
        const _replace = _template => {
          Object.entries(_template).forEach(([ key, value ]) => {
            if (!value) {
              return
            }
            const attributePath = value.get_attribute
            if (attributePath) {
              _template[key] = getDeepValue(template, attributePath)
              return
            }
            if (typeof value === 'object') {
              _replace(value)
            }
          })
        }
        _replace(template)
      }
      const _relaceGetBuildInFuntion2Value = template => {
        const _replace = _template => {
          Object.entries(_template).forEach(([ key, value ]) => {
            if (!value) {
              return
            }
            const _builtInFuncName = value.get_by_build_in_function
            if (_builtInFuncName) {
              _template[key] = _builtInFunction[_builtInFuncName](template)
              return
            }
            if (typeof value === 'object') {
              _replace(value)
            }
          })
        }
        _replace(template)
      }
      // replace template values
      templateContent._graph.cells.forEach(cell => {
        const { _app_stack_template, id, parent } = cell
        const _shortId = this._idShort(id)
        if (_app_stack_template) {
          let templates = cloneDeep(_app_stack_template)
          if (!Array.isArray(_app_stack_template)) {
            templates = [ templates ]
          }
          templates.forEach(template => {
            addAppStackLabelsForResource(name, template)
            // replace get_input, get_inmap to value
            _relaceInput2Value(template, _shortId, parent && this._idShort(parent))
            // replace get_attribute to value
            _relaceGetAttribute2Value(template)
            // replace get_by_build_in_function to value
            _relaceGetBuildInFuntion2Value(template)
          })
          cell._app_stack_template = Array.isArray(_app_stack_template)
            ? templates
            : templates[0]
        }
      })
      // patch template by link
      const links = templateContent._graph.cells.filter(({ type }) => type === 'link')
      templateContent._graph.cells.forEach(cell => {
        const { _app_stack_template, id } = cell
        if (_app_stack_template && _app_stack_template.method === 'patch') {
          const needPatchCellsId = []
          links.forEach(({ source: { id: sourceId }, target: { id: targetId } }) => {
            if (id === sourceId) {
              needPatchCellsId.push(targetId)
            } else if (id === targetId) {
              needPatchCellsId.push(sourceId)
            }
          })
          _app_stack_template.metadata.body.forEach(({ patchPath, overwrite, data }) => {
            templateContent._graph.cells.forEach(_cell => {
              if (needPatchCellsId.indexOf(_cell.id) > -1) {
                const patchPathPop = patchPath.slice(0, patchPath.length - 1)
                if (!getDeepValue(_cell._app_stack_template, patchPathPop)) {
                  return
                }
                const setData = overwrite
                  ? data
                  : Object.assign({}, getDeepValue(_cell._app_stack_template, patchPath), data)
                _set(_cell._app_stack_template, patchPath, setData)
              }
            })
          })
        }
      })
      // add tempates to k8sManifest
      templateContent._graph.cells.forEach(cell => {
        const { _app_stack_template, _deploy_2_yaml } = cell
        // filter deploy to k8s ignore shapes: Application, LBgroup
        if (_deploy_2_yaml) {
          let templates = cloneDeep(_app_stack_template)
          if (!Array.isArray(_app_stack_template)) {
            templates = [ templates ]
          }
          templates.forEach(template => {
            // remove undefined value
            k8sManifest.push(JSON.parse(JSON.stringify(template)))
          })
        }
      })

      try {
        await deployAppstack({
          name,
          cluster,
          body: {
            description: values.description,
            content: templateDetail.content,
            k8sManifest: k8sManifest.map(template => yamlParser.safeDump(template)).join('---\n'),
          },
        })
        notification.success({
          message: '启动应用堆栈成功',
        })
        historyPush(`/app-stack/appStackDetail/${name}/events`)
      } catch (error) {
        const { response } = error || {}
        const { code, details, message } = response || {}
        if (code === 409) {
          const { kind, name: name409 } = details
          let keys409 = Object.keys(values).filter(key => values[key] === name409)
          const keyText = ELEMENT_KIND_INPUT_MAP[kind]
          if (!keyText) {
            notification.warn({
              message: '启动应用堆栈失败',
              description: message,
            })
            return
          }
          if (keyText.overwrite) {
            keys409 = [ keyText.key ]
          } else {
            keys409 = keys409.filter(key => key.indexOf(keyText.key) > -1)
          }
          const typeText = keyText.text
          /* switch (kind) {
            case 'AppStack': {
              keys409 = [ 'stackName' ]
              typeText = '堆栈'
              break
            }
            case 'Application': {
              typeText = '应用'
              keys409 = keys409.filter(key => key.indexOf('app_name') > -1)
              break
            }
            case 'Deployment': {
              typeText = '服务'
              keys409 = keys409.filter(key => key.indexOf('deployment_name') > -1)
              break
            }
            case 'Service': {
              typeText = '服务或服务发现'
              keys409 = keys409.filter(key => key.indexOf('service_name') > -1)
              break
            }
            case 'ConfigMap': {
              typeText = '服务配置'
              keys409 = keys409.filter(key => key.indexOf('configMap_name') > -1)
              break
            }
            default:
              notification.warn({
                message: '启动应用堆栈失败',
                description: message,
              })
              return
          } */
          keys409.forEach(key => {
            setFields({
              [key]: {
                value: name409,
                errors: [ new Error(`${typeText} ${name409} 已存在，请更换为其他名称`) ],
              },
            })
          })
          notification.warn({
            message: '启动应用堆栈失败',
            description: `${typeText} ${name409} 已存在`,
          })
          const element = document.getElementById(keys409[0])
          if (element) {
            element.focus()
          }
          return
        }
        notification.warn({
          message: '启动应用堆栈失败',
          description: message,
        })
      } finally {
        this.setState({ btnLoading: false })
      }
    })
  }

  onCollapseChange = keys => {
    this.setState({ collapseActiveKeys: keys })
  }

  render() {
    const { match, loading, form } = this.props
    const { getFieldDecorator } = form
    const templateDetailLoading = loading.effects['appStack/fetchAppStackTemplateDetail']
    const { templateInputs, collapseActiveKeys, btnLoading } = this.state
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
                          {
                            validator: (rule, value, cb) => {
                              const msg = k8sNameCheck(value, '堆栈名称')
                              if (msg === 'success') {
                                return cb()
                              }
                              cb(msg)
                            },
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
                        rules: [
                          {
                            max: 125,
                            message: '堆栈描述长度不能超过 125 个字符',
                          },
                        ],
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
                    activeKey={collapseActiveKeys}
                    onChange={this.onCollapseChange}
                  >
                    {
                      Object.entries(templateInputs).map(([ label, inputs ]) => {
                        return <Panel header={label} key={label}>
                          <Table
                            columns={this.columns}
                            dataSource={inputs}
                            pagination={false}
                            rowKey={({ key, _shortId }) => `${_shortId}-${key}`}
                          />
                        </Panel>
                      })
                    }
                  </Collapse>
                </div>
              </div>
              <div className={styles.btnGroup}>
                <UnifiedLink to="/app-stack/templates">
                  <Button>取消</Button>
                </UnifiedLink>
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
