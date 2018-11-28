/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * AppStack
 *
 * @author zhangpc
 * @date 2018-11-14
 */

import React from 'react'
import '@tenx-ui/page/assets/index.css'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'dva'
import * as joint from 'jointjs'
import 'jointjs/dist/joint.css'
import graphlib from 'graphlib'
import TenxEditor from '@tenx-ui/editor'
import '@tenx-ui/editor/assets/index.css'
import { confirm } from '@tenx-ui/modal'
import {
  Button, notification, Slider, Icon, Row, Col, Tabs, Modal, Form, Input,
} from 'antd'
import classnames from 'classnames'
// import $ from 'jquery'
import Dock from 'react-dock'
import yamlParser from 'js-yaml'
import styles from './style/index.less'
// import * as yamls from './yamls'
import './shapes'

const TabPane = Tabs.TabPane
const FormItem = Form.Item

const PAPER_SCALE_MAX = 5
const PAPER_SCALE_MIN = 0.1
const PAPER_SCALE_STEP = 0.1
const RESOURCE_LIST = [
  {
    id: 'Application',
    icon: <Icon type="appstore" />,
    title: '应用',
    enabled: true,
  },
  {
    id: 'Deployment',
    icon: <Icon type="appstore" />,
    title: 'Deployment',
    enabled: true,
  },
  {
    id: 'Service',
    icon: <Icon type="appstore" />,
    title: 'Service',
    enabled: true,
  },
  {
    id: 'ConfigMap',
    icon: <Icon type="appstore" />,
    title: 'ConfigMap',
    enabled: true,
  },
  {
    id: 'service-2',
    icon: <Icon type="appstore" />,
    title: '服务配置·加密配置',
  },
  {
    id: 'service-3',
    icon: <Icon type="appstore" />,
    title: '存储·独享型',
  },
  {
    id: 'service-4',
    icon: <Icon type="appstore" />,
    title: '存储·共享型',
  },
  {
    id: 'service-5',
    icon: <Icon type="appstore" />,
    title: '存储·本地存储',
  },
  {
    id: 'service-6',
    icon: <Icon type="appstore" />,
    title: '服务发现',
  },
  {
    id: 'service-7',
    icon: <Icon type="appstore" />,
    title: '应用负载均衡·集群内',
  },
  {
    id: 'service-8',
    icon: <Icon type="appstore" />,
    title: '应用负载均衡·集群外',
  },
  {
    id: 'service-9',
    icon: <Icon type="appstore" />,
    title: '集群网络出口',
  },
  {
    id: 'service-10',
    icon: <Icon type="appstore" />,
    title: '自定义资源',
  },
  {
    id: 'service-11',
    icon: <Icon type="appstore" />,
    title: '安全组',
  },
]
const DOCK_DEFAULT_HEADER_SIZE = 42
const APP_STACK_LOCAL_STORAGE_KEY = '_app_stack_graph'

const mapStateToProps = state => {
  const { app: { cluster = '' } = {}, appStack, loading } = state
  const { templateDetail } = appStack
  return { cluster, templateDetail, loading }
}
@Form.create()
@connect(mapStateToProps)
export default class AppStack extends React.Component {
  state = {
    templateYamlStr: `nodes: []
inputs: []`,
    inputYamlStr: '',
    yamlObj: {},
    createBtnLoading: false,
    paperScale: 1,
    yamlDockVisible: false,
    yamlDockSize: 340,
    yamlEditorTabKey: 'template',
    saveStackModal: false,
    saveStackBtnLoading: false,
  }

  editMode = this.props.match.path === '/app-stack/designer/:name/edit'

  newEmbeds = []

  activeElement = undefined

  yarmlEditor = undefined

  yaml2GraphTimeout = undefined

  componentDidMount() {
    window.addEventListener('beforeunload', this.handleWindowClose)
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.handleWindowClose)
    this._saveGraphObj2LS()
  }

  handleWindowClose = () => {
    this._saveGraphObj2LS()
    return true
  }

  // edit mode not support
  _saveGraphObj2LS = () => {
    if (this.editMode) {
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

  initDesigner = () => {
    this.paperDom = document.getElementById('app-stack-paper')
    this.navigatorDom = document.getElementById('app-stack-paper-navigator')
    this.graph = new joint.dia.Graph()
    // http://resources.jointjs.com/docs/jointjs/v2.2/joint.html#dia.Paper.prototype.options.async
    this.paper = new joint.dia.Paper({
      // an HTML element into which the paper will be rendered
      el: this.paperDom,
      // a Graph model we want to render into the paper
      model: this.graph,
      // the dimensions of the rendered paper (in pixels)
      width: '100%',
      height: 800,
      // the size of the grid to which elements are aligned.
      // affects the granularity of element movement
      gridSize: 16,
      drawGrid: {
        name: 'fixedDot',
        // args: [
        //   { color: 'red', thickness: 1 }, // settings for the primary mesh
        //   { color: 'green', scaleFactor: 5, thickness: 5 } //settings for the secondary mesh
        // ],
      },
      snapLinks: true,
      linkPinning: false,
      // http://resources.jointjs.com/docs/jointjs/v2.2/joint.html#dia.Paper.prototype.options.embeddingMode
      embeddingMode: true,
      // when number of mousemove events exceeds the clickThreshold there is
      // no pointerclick event triggered after mouseup. It defaults to 0.
      clickThreshold: 5,
      defaultConnectionPoint: { name: 'boundary' },
      highlighting: {
        default: {
          name: 'stroke',
          options: {
            padding: 6,
          },
        },
        embedding: {
          name: 'addClass',
          options: {
            className: 'highlighted-parent',
          },
        },
      },
      interactive: { arrowheadMove: false },
      allowLink(linkView, paper) {
        const graph = paper.model
        return graphlib.alg.findCycles(graph.toGraphLib()).length === 0;
      },
      validateEmbedding(childView, parentView) {
        const isEmbedding = parentView.model instanceof joint.shapes.devs.Application
          && !(childView.model instanceof joint.shapes.devs.Application)
        // resizes the `Application` shape,
        // so it visually contains all shapes embedded in.
        if (isEmbedding) {
          // parentView.model.fitEmbeds({
          //   deep: true,
          //   padding: 48,
          // })
          setTimeout(() => {
            // childView.remove()
          }, 5000)
        }
        return isEmbedding
      },
      validateConnection(sourceView, sourceMagnet, targetView, targetMagnet) {
        return sourceMagnet !== targetMagnet
      },
    })
    // @Todo: 可以用来做鹰眼视图
    this.navigatorPaper = new joint.dia.Paper({
      // an HTML element into which the paper will be rendered
      el: this.navigatorDom,
      // a Graph model we want to render into the paper
      model: this.graph,
      // the dimensions of the rendered paper (in pixels)
      width: 200,
      height: 200,
      // the size of the grid to which elements are aligned.
      // affects the granularity of element movement
      gridSize: 1,
      interactive: false,
    })
    this.navigatorPaper.scale(0.1, 0.1);

    // 可以做 redo undo
    // this.graph.on('change', function(cell) {
    //   console.log('cell', cell)
    // })

    // 可以做 自适应
    this.graph.on('change:embeds', (element, newEmbeds) => {
      const fitEmbeds = () => {
        const currentElement = this.graph.getCell(element.id)
        if (currentElement) {
          currentElement.fitEmbeds({ deep: true, padding: 48 })
        }
      }
      if (newEmbeds && newEmbeds.length <= this.newEmbeds.length) {
        this.fitEmbedsTimeout = setTimeout(fitEmbeds, 5000)
      } else {
        fitEmbeds()
      }
      this.newEmbeds = newEmbeds
    })

    // test
    window._paper = this.paper
    window._graph = this.graph

    // this.graph.on('change:position', (element, newPosition) => {
    //   console.log('element1 moved to ' + newPosition.x + ',' + newPosition.y)
    // })
    // this.graph.on('change:parent', (element, newParent, opt) => {
    //   console.log('element, newParent, opt', element, newParent, opt)
    //   // console.log('newEmbeds', this.graph.getCell(newEmbeds))
    //   if (newParent) {
    //     const newParentModel = this.graph.getCell(newParent)
    //     newParentModel.fitEmbeds({
    //       deep: true,
    //       padding: 48,
    //     })
    //   }
    // })

    const clearActiveElement = () => {
      this.graph.getCells().map(cell => cell.attr('.body/strokeWidth', 1))
      this.activeElement = undefined
    }

    this.paper.on('element:pointerclick', elementView => {
      clearActiveElement()
      const element = elementView.model
      element.attr('.body/strokeWidth', 3)
      this.activeElement = element
    })

    this.paper.on('blank:pointerclick', clearActiveElement)

    // @Todo: 可以用来做画布平移
    /* this.paper.on('blank:pointermove', e => {
      console.warn('blank:pointermove', e)
    })

    this.paper.on('blank:mouseover', e => {
      console.warn('blank:mouseover', e)
    })

    this.paper.on('paper:mouseenter', e => {
      console.warn('paper:mouseenter', e)
    }) */

    this.initGraph()
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
          this.graph.fromJSON(_graph)
          this.graph2Yaml()
        }
      } catch (error) {
        console.warn(error)
        notification.error({
          message: '加载模版详情失败',
        })
      }
    } else {
      // check localStorage
      let graphData = this._getGraphObjFromLS()
      try {
        graphData = JSON.parse(graphData)
      } catch (error) {
        //
      }
      if (!graphData || !graphData.cells) {
        return
      }
      const self = this
      confirm({
        modalTitle: '打开未保存模板',
        title: '您有未保存的模板，是否要打开未保存的模板？',
        onOk() {
          self.graph.fromJSON(graphData)
          self.graph2Yaml()
        },
        onCancel() {
          self._removeGraphObjFromLS()
        },
      })
    }
  }

  onKeyDown = e => {
    // console.log('e.key', e.key)
    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        this.activeElement && this.activeElement.remove()
        this.graph2Yaml()
        break
      default:
        break
    }
  }

  onResourceDrop = ev => {
    ev.preventDefault();
    // console.warn('onDrop ev', ev)
    // console.warn('ev.screenX', ev.screenX)
    // console.warn('ev.screenY', ev.screenY)
    // console.warn('ev.pageX', ev.pageX)
    // console.warn('ev.pageY', ev.pageY)
    console.warn('ev.clientX', ev.clientX)
    console.warn('ev.clientY', ev.clientY)
    console.warn('this.paperDom.offsetLeft', this.paperDom.offsetLeft)
    console.warn('this.paperDom.offsetParent.offsetTop', this.paperDom.offsetParent.offsetTop)
    // console.warn('ev.movementX', ev.movementX)
    // console.warn('ev.movementY', ev.movementY)
    // console.warn('ev.target', ev.target)
    // console.warn('ev.target offset', $(ev.target).offset())
    // console.warn('ev.target.offsetHeight', ev.target.offsetHeight)
    // console.warn('ev.target.offsetY', ev.target.offsetY)
    // Get the id of the target and add the moved element to the target's DOM
    const id = ev.dataTransfer.getData('text');
    const { tx, ty } = this.paper.translate()
    const { paperScale } = this.state
    console.warn('tx', tx)
    console.warn('ty', ty)
    this.paper.translate(0, 0)
    this.paper.scale(1, 1)
    const options = {
      position: {
        x: ev.clientX - this.paperDom.offsetLeft - 200 - 16,
        y: ev.clientY - this.paperDom.offsetParent.offsetTop,
      },
    }
    console.warn('options', options)
    // console.warn('id', id)

    const {
      size = { width: 40, height: 40 },
    } = joint.shapes.devs[id].options || {}
    // 减去元素大小的一半
    options.position.x -= size.width / 2
    options.position.y -= size.height / 2

    const resource = new joint.shapes.devs[id](options)
    this.graph.addCells([ resource ])
    this.graph2Yaml()

    this.paper.translate(tx, ty)
    this.paper.scale(paperScale, paperScale)
    // test only ---begin
    /* const { yamlObj } = this.state
    if (!yamlObj[id] && yamls[id]) {
      yamlObj[id] = yamls[id]
      const templateYamlStr = Object.keys(yamlObj).map(key => yamlObj[key]).join(yamls.YAML_SEPARATOR)
      this.setState({ yamlObj, templateYamlStr })
    } */
    // test only ---end

    // console.log('graph.toJSON()', JSON.stringify(this.graph.toJSON()))
  }

  graph2Yaml = () => {
    const yamlObj = {
      nodes: {},
      inputs: {},
    }
    this.graph.getCells().forEach(cell => {
      const { cid, attributes: { _app_stack_template, _app_stack_input } } = cell
      if (_app_stack_template) {
        yamlObj.nodes[cid] = _app_stack_template
        yamlObj.inputs[cid] = _app_stack_input
      }
    })
    this.setState({
      yamlObj,
      templateYamlStr: yamlParser.safeDump(yamlObj),
      inputYamlStr: yamlParser.safeDump(yamlObj.inputs),
    })
  }

  yaml2Graph = (templateYamlStr, inputYamlStr) => {
    if (!templateYamlStr && !inputYamlStr) {
      return
    }
    try {
      let yamlObj
      if (templateYamlStr) {
        yamlObj = yamlParser.safeLoad(templateYamlStr)
      } else {
        yamlObj = { inputs: yamlParser.safeLoad(inputYamlStr) }
      }
      this.setState({ yamlObj })
      Object.keys(yamlObj.nodes || yamlObj.inputs).forEach(key => {
        const cell = this.graph.getCell(key)
        if (yamlObj.nodes) {
          cell.attributes._app_stack_template = yamlObj.nodes[key]
        }
        if (yamlObj.inputs) {
          cell.attributes._app_stack_input = yamlObj.inputs[key]
        }
      })
    } catch (error) {
      console.warn('parse yaml failed', error)
    }
  }

  onTemplateYamlChange = templateYamlStr => {
    this.setState({ templateYamlStr })
    clearTimeout(this.yaml2GraphTimeout)
    this.yaml2GraphTimeout = setTimeout(() => this.yaml2Graph(templateYamlStr), 300);
  }

  onInputYamlChange = inputYamlStr => {
    this.setState({ inputYamlStr })
    clearTimeout(this.yaml2GraphTimeout)
    this.yaml2GraphTimeout = setTimeout(() => this.yaml2Graph(null, inputYamlStr), 300);
  }

  deployTest = async () => {
    const { templateYamlStr, yamlObj } = this.state
    if (!yamlObj || Object.keys(yamlObj).length !== 3) {
      return notification.info({
        message: '请完成设计后再点击创建',
      })
    }
    this.setState({ createBtnLoading: true })
    const { cluster, dispatch } = this.props
    try {
      const name = `test-${Math.floor(Math.random() * 10000)}`
      const res = await dispatch({
        type: 'appStack/fetchDeployAppstack',
        payload: {
          name,
          cluster,
          body: {
            conent: JSON.stringify(this.graph.toJSON()),
            k8sManifest: templateYamlStr,
          },
        },
      })
      console.warn('res', res)
      notification.success({
        message: '创建成功',
      })
    } catch (error) {
      console.warn('error', error)
      notification.warn({
        message: '创建失败',
      })
    } finally {
      this.setState({ createBtnLoading: false })
    }
  }

  handlePaperScale = type => {
    let { paperScale } = this.state
    switch (type) {
      case '+': {
        paperScale += PAPER_SCALE_STEP
        if (paperScale > PAPER_SCALE_MAX) {
          paperScale = PAPER_SCALE_MAX
        }
        break
      }
      case '-':
        paperScale -= PAPER_SCALE_STEP
        if (paperScale < PAPER_SCALE_MIN) {
          paperScale = PAPER_SCALE_MIN
        }
        break
      default:
        break
    }
    this.paper.scale(paperScale)
    this.setState({ paperScale })
  }

  layout = options => {
    options = Object.assign({}, options, {
      nodeSep: 50,
      edgeSep: 80,
      rankDir: 'TB',
    })
    joint.layout.DirectedGraph.layout(this.graph, options)
  }

  _generateStackContent = () => {
    const { yamlObj } = this.state
    const content = {
      ...yamlObj,
      _graph: this.graph.toJSON(),
    }
    return JSON.stringify(content)
  }

  onStackSave = () => {
    const { form, dispatch, history } = this.props
    const { validateFields } = form
    this.setState({ saveStackBtnLoading: true })
    validateFields(async (err, body) => {
      if (err) {
        return
      }
      body.content = this._generateStackContent()
      try {
        await dispatch({
          type: 'appStack/fetchCreateAppstack',
          payload: {
            name: body.name,
            body,
          },
        })
        this.setState({ saveStackModal: false })
        notification.success({
          message: '保存堆栈模版成功',
        })
        this._removeGraphObjFromLS()
        history.push('/app-stack/templates')
      } catch (error) {
        console.warn('error', error)
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
    const { form } = this.props
    const { getFieldDecorator } = form
    const {
      yamlDockSize, yamlDockVisible, paperScale, yamlEditorTabKey,
      saveStackModal, saveStackBtnLoading,
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
      <QueueAnim
        id="appStackDesigner"
        className={styles.appStackDesigner}
        onEnd={this.initDesigner}
        onKeyDown={this.onKeyDown}
        tabIndex="0"
      >
        <div
          key="designer"
          className={styles.designer}
          style={{
            marginBottom: (yamlDockVisible ? yamlDockSize : 0),
          }}
        >
          <div className={styles.resourceList} key="resource">
            {
              RESOURCE_LIST.map(({ id, title, icon, enabled }) =>
                <div
                  draggable={enabled}
                  key={id}
                  onDragStart={ev => {
                    // Add the target element's id to the data transfer object
                    ev.dataTransfer.setData('text/plain', id)
                    ev.dropEffect = 'move'
                    // console.warn('onDrop ev', ev)
                    // console.warn('ev.screenX', ev.screenX)
                    // console.warn('ev.screenY', ev.screenY)
                    // console.warn('ev.pageX', ev.pageX)
                    // console.warn('ev.pageY', ev.pageY)
                    // console.warn('ev.clientX', ev.clientX)
                    // console.warn('ev.clientY', ev.clientY)
                    // console.warn('ev.movementX', ev.movementX)
                    // console.warn('ev.movementY', ev.movementY)
                    // console.warn('ev.target', ev.target)
                    // console.warn('ev.dropTarget', ev.dropTarget)
                    // console.warn('ev.target offset', $(ev.target).offset())
                    // console.warn('ev.target.offsetHeight', ev.target.offsetHeight)
                    // console.warn('ev.target.offsetY', ev.target.offsetY)
                  }}
                  className={classnames({ [styles.enabled]: enabled })}
                >
                  <Row>
                    <Col className={styles.resourceLeft} span={22}>
                      {icon}
                      <span>{title}</span>
                    </Col>
                    <Col span={2} className={styles.resourceRight}>
                      <Icon type="drag" />
                    </Col>
                  </Row>
                </div>
              )
            }
          </div>
          <div className={styles.graph}>
            <div className={styles.toolBtns}>
              <Button.Group>
                <Button icon="arrow-left" />
                <Button icon="arrow-right" />
              </Button.Group>
              <Button icon="delete" onClick={() => this.graph.clear()}>
              清空设计
              </Button>
              <Button icon="layout" onClick={this.layout} disabled>
              自动布局
              </Button>
              <Button
                icon="gateway"
                onClick={() => {
                  this.paper.scaleContentToFit({
                    maxScale: 2,
                    minScale: PAPER_SCALE_MIN,
                  })
                  const { sx } = this.paper.scale()
                  this.setState({ paperScale: sx })
                  // @Todo: 位置需要居中
                }}
                disabled
              >
              适应屏幕
              </Button>
              <Button icon="save" onClick={() => this.setState({ saveStackModal: true })}>
              保存并提交
              </Button>
              <Button icon="smile" onClick={this.deployTest}>
                <span>部署<sup>test</sup></span>
              </Button>
              <Button
                icon="deployment-unit"
                onClick={() => this.setState({ yamlDockVisible: !yamlDockVisible })}
              >
              完善编排
              </Button>
            </div>
            <div className={styles.toolZoom}>
              <Button
                shape="circle"
                size="small"
                icon="zoom-in"
                onClick={() => this.handlePaperScale('+')}
              />
              <Slider
                value={paperScale}
                min={PAPER_SCALE_MIN}
                max={PAPER_SCALE_MAX}
                step={PAPER_SCALE_STEP}
                marks={{ 1: '1x' }}
                onChange={scale => {
                  this.paper.scale(scale, scale)
                  this.setState({ paperScale: scale })
                }}
                tipFormatter={value => `${value}x`}
                vertical
              />
              <Button
                shape="circle"
                size="small"
                icon="zoom-out"
                onClick={() => this.handlePaperScale('-')}
              />
            </div>
            <div
              id="app-stack-paper"
              className={styles.paper}
              key="paper"
              onDragOver={ev => {
                ev.preventDefault();
                ev.dataTransfer.dropEffect = 'move'
              }}
              onDrop={this.onResourceDrop}
            >
              <div className="loading">loading ...</div>
            </div>
            <div
              id="app-stack-paper-navigator"
              className={styles.navigatorPaper}
              key="navigator-paper"
            >
              <div className="loading">loading ...</div>
            </div>
          </div>
        </div>
        <Dock
          fluid={false}
          size={yamlDockSize}
          isVisible={yamlDockVisible}
          position="bottom"
          dimMode="none"
          onSizeChange={dockSize => {
            if (dockSize < DOCK_DEFAULT_HEADER_SIZE) return
            this.setState({ yamlDockSize: dockSize }, () => {
              this.yarmlEditor.resize()
            })
          }}
        >
          <div className={styles.yamlEditor}>
            <div className={styles.yamlEditorHeader}>
              <Tabs
                activeKey={yamlEditorTabKey}
                onChange={this.onYamlTabChange}
                tabBarExtraContent={<div className={styles.yamlEditorHeaderBtns}>
                  <Button type="dashed" icon="search" />
                  <Button
                    type="dashed"
                    icon="minus"
                    onClick={() => this.setState({ yamlDockVisible: false })}
                  />
                  {/* <Button type="dashed" icon="arrows-alt" /> */}
                </div>}
              >
                <TabPane tab="模版" key="template"></TabPane>
                <TabPane tab="输入" key="input"></TabPane>
                {/* <TabPane tab="输出" key="output"></TabPane> */}
              </Tabs>
            </div>
            {
              yamlEditorTabKey === 'template' &&
              <TenxEditor
                name="app_stack_template"
                theme="chrome"
                fontSize={12}
                value={this.state.templateYamlStr}
                onChange={this.onTemplateYamlChange}
                onLoad={editor => { this.yarmlEditor = editor }}
              />
            }
            {
              yamlEditorTabKey === 'input' &&
              <TenxEditor
                name="app_stack_input"
                theme="chrome"
                fontSize={12}
                value={this.state.inputYamlStr}
                onChange={this.onInputYamlChange}
                onLoad={editor => { this.yarmlEditor = editor }}
              />
            }
          </div>
        </Dock>
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
              label="堆栈名称"
            >
              {getFieldDecorator('name', {
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: '请输入堆栈名称',
                  },
                ],
              })(
                <Input placeholder="请输入堆栈名称" />
              )}
            </FormItem>
            <FormItem
              {...FormItemLayout}
              label="堆栈描述"
            >
              {getFieldDecorator('description', {
                //
              })(
                <Input.TextArea placeholder="请输入堆栈描述" />
              )}
            </FormItem>
          </Form>
        </Modal>
      </QueueAnim>
    )
  }
}
