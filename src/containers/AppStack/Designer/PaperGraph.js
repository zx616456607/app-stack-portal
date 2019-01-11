/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * AppStackDesigner - paper & graph
 *
 * @author zhangpc
 * @date 2019-01-02
 */

import React from 'react'
import PropTypes from 'prop-types'
import * as joint from 'jointjs'
import 'jointjs/dist/joint.css'
import graphlib from 'graphlib'
import { confirm } from '@tenx-ui/modal'
import { Button, Slider, Icon, Row, Col, Tooltip } from 'antd'
import classnames from 'classnames'
import { FatArrowLeft as FatArrowLeftIcon } from '@tenx-ui/icon'
import './shapes'
import Hotkeys from 'react-hot-keys'
import { getDeepValue } from '../../../utils/helper'
import './style/joint-custom.less'
import styles from './style/PaperGraph.less'
import { RESOURCE_LIST } from './shapes'

const isProd = process.env.NODE_ENV === 'production'
const SIDER_WIDTH = isProd ? 0 : 200
const PAPER_SCALE_MAX = 3
const PAPER_SCALE_MIN = 0.01
const PAPER_SCALE_STEP = 0.01
const noop = () => {}

export default class PaperGraph extends React.PureComponent {
  static propTypes = {
    readOnly: PropTypes.bool.isRequired,
    editMode: PropTypes.bool.isRequired,
    onLoad: PropTypes.func,
    onGraphChange: PropTypes.func,
    onGraphSave: PropTypes.func,
    toogleYamlDockVisible: PropTypes.func,
    children: PropTypes.node,
  }

  static defaultProps = {
    readOnly: false,
    editMode: false,
    onLoad: noop,
    onGraphChange: noop,
    onGraphSave: noop,
    toogleYamlDockVisible: noop,
  }

  embedsMap = {}
  activeElement = undefined
  _pointerX = undefined
  _pointerY = undefined

  state = {
    paperScale: 1,
    idShortIdMap: {},
    undoList: [],
    redoList: [],
    yamlBtnTipVisible: false,
    grabbing: false,
  }

  componentDidMount() {
    const { onGraphChange, readOnly } = this.props
    this.initDesigner()
    this.initNavigator()
    this.graph.initGraph = this.initGraph
    this.graph.idShort = this.idShort
    this.props.onLoad(this.paper, this.graph)
    // window._paper = this.paper
    // window._graph = this.graph
    if (readOnly) {
      return
    }
    // ~ add undo/redo support
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
    // ~ add application resize support
    this.graph.on('change:embeds', (element, newEmbeds) => {
      const { id } = element
      const fitEmbeds = () => {
        const currentElement = this.graph.getCell(id)
        if (currentElement) {
          currentElement.fitEmbeds({
            deep: true,
            padding: {
              left: 40,
              top: 36,
              right: 40,
              bottom: 36,
            },
          })
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
      onGraphChange(this.graph.toJSON)
      if (newEmbeds && newEmbeds.length <= currentOldEmbeds.length) {
        this.fitEmbedsTimeout = setTimeout(fitEmbeds, 5000)
      } else {
        fitEmbeds()
      }
      this.embedsMap[id] = newEmbeds
    })
    // add link tools
    /* this.paper.on('link:mouseenter', linkView => {
      const tools = new joint.dia.ToolsView({
        tools: [
          new joint.linkTools.Vertices(),
          new joint.linkTools.Segments({
            focusOpacity: 0.5,
            redundancyRemoval: false,
            segmentLengthThreshold: 50,
            snapHandle: false,
            snapRadius: 10,
          }),
          new joint.linkTools.SourceArrowhead(),
          new joint.linkTools.TargetArrowhead(),
          new joint.linkTools.SourceAnchor(),
          new joint.linkTools.TargetAnchor(),
          new joint.linkTools.Boundary(),
          new joint.linkTools.Remove(),
        ],
      })
      linkView.addTools(tools)
    })
    this.paper.on('link:mouseleave', linkView => {
      linkView.removeTools()
    }) */
  }

  initDesigner = () => {
    // 进场动画结束后再显示 tooltip，否则会有位移
    setTimeout(() => {
      this.setState({
        yamlBtnTipVisible: true,
      })
    }, 300)
    this.paperDom = document.getElementById('app-stack-paper')
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
      drawGrid: { name: 'fixedDot' },
      snapLinks: true,
      linkPinning: false,
      // http://resources.jointjs.com/docs/jointjs/v2.2/joint.html#dia.Paper.prototype.options.embeddingMode
      embeddingMode: true,
      // when number of mousemove events exceeds the clickThreshold there is
      // no pointerclick event triggered after mouseup. It defaults to 0.
      clickThreshold: 5,
      defaultConnectionPoint: { name: 'boundary' },
      defaultAnchor: { name: 'center' },
      // defaultLink: new joint.shapes.standard.Link({
      defaultLink: new joint.dia.Link({
        connector: { name: 'rounded' },
        smooth: true,
      }),
      defaultRouter: { name: 'manhattan' },
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
      interactive: this.props.readOnly ? false : { arrowheadMove: false },
      allowLink(linkView, paper) {
        const graph = paper.model
        const { source: { id: sourceId }, target: { id: targetId } } = linkView.model.attributes
        const isFindCycles = graphlib.alg.findCycles(graph.toGraphLib()).length > 0;
        if (isFindCycles) {
          return false
        }
        const source = graph.getCell(sourceId)
        const target = graph.getCell(targetId)
        const isAllowLink = source.attributes._link_rules.types.indexOf(target.attributes.type) > -1
        if (isAllowLink) {
          const link = new joint.dia.Link({
            source: { id: sourceId },
            target: { id: targetId },
            connector: { name: 'rounded' },
            smooth: true,
          })
          graph.addCells([ link ])
        }
        return false
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

    // ~ 元素 active 状态支持
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


    // ~ 画布平移
    this.paper.on('blank:pointerdown', (e, x, y) => {
      this._pointerX = x
      this._pointerY = y
      this.setState({ grabbing: true })
    })
    this.paper.on('blank:pointermove', (e, x, y) => {
      // graph 中无元素则不平移，否则鹰眼视图会有偏移
      if (!this.graph.getBBox()) {
        return
      }
      const tx = x - this._pointerX
      const ty = y - this._pointerY
      this.graph.translate(tx, ty)
      this._pointerX = x
      this._pointerY = y
    })
    this.paper.on('blank:pointerup', () => {
      this.setState({ grabbing: false })
    })
  }

  scalePaper = paperScale => {
    this.paper.scale(paperScale)
    this.setState({ paperScale })
    if (this.navigatorPaper) {
      this.navigatorPaper.scale(paperScale * 0.1)
    }
  }

  initNavigator = () => {
    // @Todo: 可以用来做鹰眼视图
    this.navigatorDom = document.getElementById('app-stack-paper-navigator')
    this.navigatorPaper = new joint.dia.Paper({
      // an HTML element into which the paper will be rendered
      el: this.navigatorDom,
      // a Graph model we want to render into the paper
      model: this.graph,
      // the dimensions of the rendered paper (in pixels)
      width: 200,
      height: 150,
      // the size of the grid to which elements are aligned.
      // affects the granularity of element movement
      gridSize: 1,
      interactive: false,
    })
    this.navigatorPaper.scale(0.1, 0.1)
  }

  addLabelId = cell => {
    const _shortId = this.state.idShortIdMap[cell.id]
    if (cell.attributes.type === 'devs.Application') {
      cell.attributes._app_stack_input.app_name.label = `应用-${_shortId}`
    }
    cell.attributes.attrs['label-id'] = { text: _shortId }
    this.paper.findViewByModel(cell).update()
  }

  initGraph = graph => {
    const { onGraphChange } = this.props
    this.graph.fromJSON(graph)
    // add init graph to undoList
    if (this.state.undoList.length === 0 && graph.cells.length > 0) {
      this.setState({ undoList: [ graph ] })
    }
    const { idShortIdMap } = this.state
    this.graph.getCells().forEach(cell => {
      const _shortId = this.idShort(cell.id)
      cell._shortId = this.idShort(cell.id)
      idShortIdMap[_shortId] = cell.id
      idShortIdMap[cell.id] = _shortId
      this.addLabelId(cell)
    })
    this.setState({ idShortIdMap }, () => onGraphChange(graph))
    // [embed-label-handle-part-1] init embeds map
    graph.cells.forEach(({ id, embeds }) => {
      if (embeds && embeds.length > 0) {
        this.embedsMap[id] = embeds
      }
    })
  }

  onResourceDrop = ev => {
    ev.preventDefault()
    // Get the id of the target and add the moved element to the target's DOM
    const id = ev.dataTransfer.getData('text')
    const ResourceShape = joint.shapes.devs[id]
    if (!ResourceShape) {
      console.warn(`'${id}' resource shape not found.`)
      return
    }
    const { tx, ty } = this.paper.translate()
    const { paperScale } = this.state

    const options = {
      position: {
        x: ev.clientX - this.paperDom.offsetLeft - SIDER_WIDTH - 16,
        y: ev.clientY - this.paperDom.offsetParent.offsetTop,
      },
    }

    const {
      size = { width: 40, height: 40 },
    } = ResourceShape.options || {}

    // 减去元素大小的一半
    options.position.x -= size.width / 2
    options.position.y -= size.height / 2
    // 算上位移
    options.position.x -= tx
    options.position.y -= ty
    // 除以放缩比
    options.position.x /= paperScale
    options.position.y /= paperScale

    const resource = new ResourceShape(options)
    this.graph.addCells([ resource ])

    const { idShortIdMap } = this.state
    const _shortId = this.idShort(resource.id)
    resource._shortId = _shortId
    idShortIdMap[_shortId] = resource.id
    idShortIdMap[resource.id] = _shortId
    this.setState({ idShortIdMap })
    this.addLabelId(resource)
    // handle embed when dropped
    if (id !== 'Application') {
      this.graph.getElements().forEach(element => {
        if (resource.getBBox().intersect(element.getBBox())) {
          if (element instanceof joint.shapes.devs.Application) {
            // now embed the new element into the existing one
            element.embed(resource);
          }
        }
      })
    }

    this.props.onGraphChange(this.graph.toJSON())
  }

  idShort = id => id.split('-')[0]

  onKeyDown = (keyName, e) => {
    const { readOnly, onGraphSave, onGraphChange } = this.props
    if (readOnly) {
      return
    }
    switch (keyName) {
      case 'delete':
      case 'backspace':
        this.activeElement && this.activeElement.remove()
        onGraphChange(this.graph.toJSON())
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
        onGraphSave(this.graph.toJSON())
        break
      default:
        break
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
    this.scalePaper(paperScale)
  }

  clearGraph = () => {
    const self = this
    confirm({
      modalTitle: '确认操作',
      title: '您是否要清除当前模板设计？',
      width: 420,
      onOk() {
        self.graph.clear()
        self.props.onGraphChange(self.graph.toJSON())
      },
      onCancel() {},
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

  undo = () => {
    const { undoList, redoList } = this.state
    if (undoList.length === 0) {
      return
    }
    const pop = undoList.pop()
    redoList.push(pop)
    this.setState({ undoList, redoList })
    const current = undoList[undoList.length - 1] || { cells: [] }
    this.initGraph(current)
    this.props.onGraphChange(current)
  }

  redo = () => {
    const { undoList, redoList } = this.state
    if (redoList.length === 0) {
      return
    }
    const pop = redoList.pop()
    undoList.push(pop)
    this.setState({ undoList, redoList })
    this.initGraph(pop)
    this.props.onGraphChange(pop)
  }

  isUndoDisabled = () => {
    // if editMode, fist undo is init graph, so can not be undo
    const { undoList } = this.state
    const { editMode } = this.props
    return editMode
      ? undoList.length <= 1
      : undoList.length === 0
  }

  toogleYamlDockVisible = () => {
    this.props.toogleYamlDockVisible()
    this.setState({
      yamlBtnTipVisible: false,
    })
  }

  render() {
    const { paperScale, redoList, yamlBtnTipVisible, grabbing } = this.state
    const { onGraphSave, editMode, readOnly } = this.props
    return (
      <Hotkeys
        keyName="delete,backspace,ctrl+z,command+z,ctrl+shift+z,command+shift+z,ctrl+s,command+s"
        onKeyDown={this.onKeyDown}
        key="hotkeys-wrapper"
        tabIndex="0"
      >
        <div key="designer" className={styles.designer}>
          {
            !readOnly &&
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
          }
          <div className={classnames(styles.graph, { [styles.grabbing]: grabbing })}>
            {
              !readOnly &&
              <div className={styles.toolBtns}>
                <Button.Group>
                  <Button
                    disabled={this.isUndoDisabled()}
                    onClick={this.undo}
                    className={styles.undo}
                  >
                    <FatArrowLeftIcon />
                  </Button>
                  <Button
                    disabled={redoList.length === 0}
                    onClick={this.redo}
                    className={styles.redo}
                  >
                    <FatArrowLeftIcon />
                  </Button>
                </Button.Group>
                <Button icon="delete" onClick={this.clearGraph}>
                  清空设计
                </Button>
                {/* <Button icon="layout" onClick={this.layout} disabled>
                  自动布局
                </Button> */}
                <Button
                  icon="gateway"
                  onClick={() => {
                    this.paper.scaleContentToFit({
                      padding: 200,
                      maxScale: 1.5,
                      minScale: PAPER_SCALE_MIN,
                    })
                    const { sx } = this.paper.scale()
                    this.scalePaper(sx)
                    // @Todo: 位置需要居中
                  }}
                >
                  适应屏幕
                </Button>
                <Button icon="save" onClick={() => onGraphSave(this.graph.toJSON())}>
                  {
                    editMode ? '保存更新' : '保存并提交'
                  }
                </Button>
                <Tooltip
                  title="请完善堆栈，确保与画布设计表示一致"
                  placement="right"
                  visible={yamlBtnTipVisible}
                >
                  <Button icon="deployment-unit" onClick={this.toogleYamlDockVisible}>
                    完善堆栈
                  </Button>
                </Tooltip>
              </div>
            }
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
                onChange={this.scalePaper}
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
      </Hotkeys>
    )
  }
}
