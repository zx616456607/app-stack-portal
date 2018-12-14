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
import * as joint from 'jointjs'
import 'jointjs/dist/joint.css'
import graphlib from 'graphlib'
import TenxEditor from '@tenx-ui/editor'
import '@tenx-ui/editor/assets/index.css'
import 'brace/mode/yaml'
import 'brace/snippets/yaml'
import 'brace/theme/chrome'
import { confirm } from '@tenx-ui/modal'
import {
  Button, notification, Slider, Icon, Row, Col, Tabs, Modal, Form, Input,
} from 'antd'
import classnames from 'classnames'
// import $ from 'jquery'
import Dock from 'react-dock'
import yamlParser from 'js-yaml'
import {
  AppC as AppIcon,
  ServiceC as ServiceIcon,
  ConfigmapC as ConfigmapIcon,
} from '@tenx-ui/icon'
import styles from './style/index.less'
import './style/joint-custom.less'
import './shapes'
import Hotkeys from 'react-hot-keys'
import { getDeepValue } from '../../../utils/helper'

const isProd = process.env.NODE_ENV === 'production'

const TabPane = Tabs.TabPane
const FormItem = Form.Item

const SIDER_WIDTH = isProd ? 0 : 200
const PAPER_SCALE_MAX = 5
const PAPER_SCALE_MIN = 0.1
const PAPER_SCALE_STEP = 0.1
const RESOURCE_LIST = [
  {
    id: 'Application',
    icon: <AppIcon />,
    title: '应用',
    enabled: true,
  },
  {
    id: 'DeploymentService',
    icon: <ServiceIcon />,
    title: '服务',
    enabled: true,
  },
  {
    id: 'ConfigMap',
    icon: <ConfigmapIcon />,
    title: 'ConfigMap',
    enabled: true,
  },
  {
    id: 'Deployment',
    icon: <Icon type="appstore" />,
    title: 'Deployment',
  },
  {
    id: 'Service',
    icon: <Icon type="appstore" />,
    title: 'Service',
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
export default class AppStackDesigner extends React.Component {
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
    idShortIdMap: {},
    undoList: [],
    redoList: [],
  }

  editMode = this.props.match.path === '/app-stack/designer/:name/edit'

  embedsMap = {}

  activeElement = undefined

  yarmlEditor = undefined

  yaml2GraphTimeout = undefined

  componentDidMount() {
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

  componentDidCatch(error, info) {
    console.warn('AppStackDesigner componentDidCatch', error, info)
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
      validateEmbedding: (childView, parentView) => {
        const isEmbedding = parentView.model instanceof joint.shapes.devs.Application
          && !(childView.model instanceof joint.shapes.devs.Application)
        // resizes the `Application` shape,
        // so it visually contains all shapes embedded in.
        return isEmbedding
      },
      validateConnection(sourceView, sourceMagnet, targetView, targetMagnet) {
        return sourceMagnet !== targetMagnet
      },
      // https://resources.jointjs.com/docs/jointjs/v2.2/joint.html#dia.Paper.prototype.options.guard
      /* guard() {
        return true
      }, */
    })
    // @Todo: 可以用来做鹰眼视图
    this.navigatorPaper = new joint.dia.Paper({
      // an HTML element into which the paper will be rendered
      el: this.navigatorDom,
      // a Graph model we want to render into the paper
      model: this.graph,
      // the dimensions of the rendered paper (in pixels)
      width: 150,
      height: 150,
      // the size of the grid to which elements are aligned.
      // affects the granularity of element movement
      gridSize: 1,
      interactive: false,
    })
    this.navigatorPaper.scale(0.1, 0.1);

    // the events of graph => redo undo support
    const _addUndoList = () => {
      const _graph = this.graph.toJSON()
      clearTimeout(this.graphChangeTimeout)
      this.graphChangeTimeout = setTimeout(() => {
        const { undoList } = this.state
        undoList.push(_graph)
        this.setState({ undoList, redoList: [] })
      }, 300)
    }
    this.graph.on('change', () => {
      _addUndoList()
    })
    this.graph.on('add', () => {
      _addUndoList()
    })
    this.graph.on('remove', () => {
      _addUndoList()
    })

    // 可以做 自适应
    this.graph.on('change:embeds', (element, newEmbeds) => {
      const { id } = element
      const fitEmbeds = () => {
        const currentElement = this.graph.getCell(id)
        if (currentElement) {
          currentElement.fitEmbeds({ deep: true, padding: 48 })
        }
      }
      const currentOldEmbeds = this.embedsMap[id] || []

      // [embed-label-handle-part-2] change child input label to app_name label when isEmbedding
      const parentInputLabel = getDeepValue(element, [ 'attributes', '_app_stack_input', 'app_name', 'label' ])
      newEmbeds.forEach(embedId => {
        const currentElement = this.graph.getCell(embedId)
        const childInput = currentElement.attributes._app_stack_input || {}
        Object.keys(childInput).forEach(key => {
          if (parentInputLabel) {
            childInput[key].label = parentInputLabel
          }
        })
      })
      // [embed-label-handle-part-3] remove app_name label when embed out
      const movedOutEmbeds = currentOldEmbeds.filter(embed => newEmbeds.indexOf(embed) < 0)
      movedOutEmbeds.forEach(embedId => {
        const currentElement = this.graph.getCell(embedId)
        const childInput = currentElement.attributes._app_stack_input || {}
        Object.keys(childInput).forEach(key => {
          childInput[key].label = '其他配置'
        })
      })
      this.graph2Yaml()
      if (newEmbeds && newEmbeds.length <= currentOldEmbeds.length) {
        this.fitEmbedsTimeout = setTimeout(fitEmbeds, 5000)
      } else {
        fitEmbeds()
      }
      this.embedsMap[id] = newEmbeds
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
      element.attr('.body/strokeWidth', 2)
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
    const _initGraph = _graph => {
      this.graph.fromJSON(_graph)
      // add init graph to undoList
      this.setState({ undoList: [ _graph ] })
      const { idShortIdMap } = this.state
      this.graph.getCells().forEach(cell => {
        const _shortId = this._idShort(cell.id)
        cell._shortId = this._idShort(cell.id)
        idShortIdMap[_shortId] = cell.id
        idShortIdMap[cell.id] = _shortId
      })
      this.setState({ idShortIdMap }, this.graph2Yaml)
      // [embed-label-handle-part-1] init embeds map
      _graph.cells.forEach(({ id, embeds }) => {
        if (embeds && embeds.length > 0) {
          this.embedsMap[id] = embeds
        }
      })
    }
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
          _initGraph(_graph)
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
          _initGraph(graphData)
        },
        onCancel() {
          self._removeGraphObjFromLS()
        },
      })
    }
  }

  onKeyDown = (keyName, e) => {
    switch (keyName) {
      case 'delete':
      case 'backspace':
        this.activeElement && this.activeElement.remove()
        this.graph2Yaml()
        break
      case 'ctrl+z':
      case 'command+z': {
        if (this.isUndoDisabled()) {
          break
        }
        this.undo()
        break
      }
      case 'ctrl+shift+z':
      case 'command+shift+z':
        this.redo()
        break
      case 'ctrl+s':
      case 'command+s':
        e.preventDefault()
        this.setState({ saveStackModal: true })
        break
      default:
        break
    }
  }

  _idShort = id => id.split('-')[0]

  onResourceDrop = ev => {
    ev.preventDefault();
    // console.warn('onDrop ev', ev)
    // console.warn('ev.screenX', ev.screenX)
    // console.warn('ev.screenY', ev.screenY)
    // console.warn('ev.pageX', ev.pageX)
    // console.warn('ev.pageY', ev.pageY)
    // console.warn('ev.clientX', ev.clientX)
    // console.warn('ev.clientY', ev.clientY)
    // console.warn('this.paperDom.offsetLeft', this.paperDom.offsetLeft)
    // console.warn('this.paperDom.offsetParent.offsetTop', this.paperDom.offsetParent.offsetTop)
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
    // console.warn('tx', tx)
    // console.warn('ty', ty)
    this.paper.translate(0, 0)
    this.paper.scale(1, 1)
    const options = {
      position: {
        x: ev.clientX - this.paperDom.offsetLeft - SIDER_WIDTH - 16,
        y: ev.clientY - this.paperDom.offsetParent.offsetTop,
      },
    }
    // console.warn('options', options)
    // console.warn('id', id)

    const {
      size = { width: 40, height: 40 },
    } = joint.shapes.devs[id].options || {}
    // 减去元素大小的一半
    options.position.x -= size.width / 2
    options.position.y -= size.height / 2

    const resource = new joint.shapes.devs[id](options)
    this.graph.addCells([ resource ])

    this.paper.translate(tx, ty)
    this.paper.scale(paperScale, paperScale)

    const { idShortIdMap } = this.state
    const _shortId = this._idShort(resource.id)
    resource._shortId = _shortId
    idShortIdMap[_shortId] = resource.id
    idShortIdMap[resource.id] = _shortId
    this.setState({ idShortIdMap })

    if (id === 'Application') {
      resource.attributes._app_stack_input.app_name.label = `应用-${_shortId}`
    }

    this.graph2Yaml()
  }

  graph2Yaml = () => {
    const yamlObj = {
      nodes: {},
      inputs: {},
    }
    this.graph.getCells().forEach(cell => {
      const { _shortId, attributes: { _app_stack_template, _app_stack_input } } = cell
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
      const { idShortIdMap } = this.state
      const nodes = yamlObj.nodes || {}
      const inputs = yamlObj.inputs || {}
      this.graph.getCells().forEach(cell => {
        const key = idShortIdMap[cell.id]
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

  clearGraph = () => {
    const self = this
    confirm({
      modalTitle: '确认操作',
      title: '您是否要清除当前模板设计？',
      width: 420,
      onOk() {
        self.graph.clear()
        self.graph2Yaml()
      },
      onCancel() {
        //
      },
    })
  }

  layout = options => {
    options = Object.assign({}, options, {
      nodeSep: 50,
      edgeSep: 80,
      rankDir: 'TB',
    })
    joint.layout.DirectedGraph.layout(this.graph, options)
  }

  onStackSave = () => {
    const { form, dispatch, history } = this.props
    const { validateFields } = form
    validateFields(async (err, body) => {
      if (err) {
        return
      }
      const _graph = this.graph.toJSON()
      if (_graph.cells.length === 0) {
        this.setState({ saveStackModal: false })
        notification.info({
          message: '保存堆栈模版失败',
          description: '无效的空白模版',
        })
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

  undo = () => {
    const { undoList, redoList } = this.state
    if (undoList.length === 0) {
      return
    }
    const pop = undoList.pop()
    redoList.push(pop)
    this.setState({ undoList, redoList })
    const current = undoList[undoList.length - 1]
    this.graph.fromJSON(current || { cells: [] })
  }

  redo = () => {
    const { undoList, redoList } = this.state
    if (redoList.length === 0) {
      return
    }
    const pop = redoList.pop()
    undoList.push(pop)
    this.setState({ undoList, redoList })
    this.graph.fromJSON(pop)
  }

  isUndoDisabled = () => {
    // if editMode, fist undo is init graph, so can not be undo
    const { undoList } = this.state
    return this.editMode
      ? undoList.length <= 1
      : undoList.length === 0
  }

  render() {
    const { form, templateDetail } = this.props
    const { getFieldDecorator } = form
    const {
      yamlDockSize, yamlDockVisible, paperScale, yamlEditorTabKey,
      saveStackModal, saveStackBtnLoading, redoList,
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
      >
        <Hotkeys
          keyName="delete,backspace,ctrl+z,command+z,ctrl+shift+z,command+shift+z,ctrl+s,command+s"
          onKeyDown={this.onKeyDown}
          key="hotkeys-wrapper"
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
                  <Button
                    icon="undo"
                    disabled={this.isUndoDisabled()}
                    onClick={this.undo}
                  />
                  <Button
                    icon="redo"
                    disabled={redoList.length === 0}
                    onClick={this.redo}
                  />
                </Button.Group>
                <Button icon="delete" onClick={this.clearGraph}>
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
                  {
                    this.editMode ? '保存更新' : '保存并提交'
                  }
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
                  onLoad={editor => {
                    editor.$blockScrolling = Infinity
                    this.yarmlEditor = editor
                  }}
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
                  onLoad={editor => {
                    editor.$blockScrolling = Infinity
                    this.yarmlEditor = editor
                  }}
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
                label="堆栈描述"
              >
                {getFieldDecorator('description', {
                  initialValue: templateDetail && templateDetail.description,
                })(
                  <Input.TextArea placeholder="请输入堆栈描述" />
                )}
              </FormItem>
            </Form>
          </Modal>
        </Hotkeys>
      </QueueAnim>
    )
  }
}
