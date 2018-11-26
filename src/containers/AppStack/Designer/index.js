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
import { Button, notification, Slider, Icon, Row, Col } from 'antd'
import classnames from 'classnames'
// import $ from 'jquery'
import Dock from 'react-dock'
import styles from './style/index.less'
import * as yamls from './yamls'
import './shapes'

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
const DOCK_DEFAULT_HEADER_SIZE = 32

const mapStateToProps = state => {
  const { app: { cluster = '' } = {} } = state
  return { cluster }
}
@connect(mapStateToProps)
export default class AppStack extends React.Component {
  state = {
    yamlStr: undefined,
    yamlObj: {},
    createBtnLoading: false,
    paperScale: 1,
    yamlDockVisible: false,
    yamlDockSize: 340,
  }

  newEmbeds = []

  activeElement = undefined

  initDesigner = () => {
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
      height: 600,
      // the size of the grid to which elements are aligned.
      // affects the granularity of element movement
      gridSize: 8,
      snapLinks: true,
      linkPinning: false,
      // http://resources.jointjs.com/docs/jointjs/v2.2/joint.html#dia.Paper.prototype.options.embeddingMode
      embeddingMode: true,
      // when number of mousemove events exceeds the clickThreshold there is
      // no pointerclick event triggered after mouseup. It defaults to 0.
      clickThreshold: 5,
      defaultConnectionPoint: { name: 'boundary' },
      drawGrid: {
        name: 'fixedDot',
        // args: [
        //   { color: 'red', thickness: 1 }, // settings for the primary mesh
        //   { color: 'green', scaleFactor: 5, thickness: 5 } //settings for the secondary mesh
        // ],
      },
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
    // test
    window._paper = this.paper

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
  }

  editYaml = () => {
    //
  }

  onKeyDown = e => {
    // console.log('e.key', e.key)
    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        this.activeElement && this.activeElement.remove()
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
    // console.warn('ev.clientX', ev.clientX)
    // console.warn('ev.clientY', ev.clientY)
    // console.warn('ev.movementX', ev.movementX)
    // console.warn('ev.movementY', ev.movementY)
    // console.warn('ev.target', ev.target)
    // console.warn('ev.target offset', $(ev.target).offset())
    // console.warn('ev.target.offsetHeight', ev.target.offsetHeight)
    // console.warn('ev.target.offsetY', ev.target.offsetY)
    // Get the id of the target and add the moved element to the target's DOM
    const id = ev.dataTransfer.getData('text');
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
    // test only ---begin
    const { yamlObj } = this.state
    if (!yamlObj[id] && yamls[id]) {
      yamlObj[id] = yamls[id]
      const yamlStr = Object.keys(yamlObj).map(key => yamlObj[key]).join(yamls.YAML_SEPARATOR)
      this.setState({ yamlObj, yamlStr })
    }
    // test only ---end

    // console.log('graph.toJSON()', JSON.stringify(this.graph.toJSON()))
  }

  deployTest = async () => {
    const { yamlStr, yamlObj } = this.state
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
            k8sManifest: yamlStr,
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

  render() {
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
              <Button icon="layout" onClick={this.layout}>
              自动布局
              </Button>
              <Button
                icon="gateway"
                onClick={() => {
                  console.warn('this.paper', this.paper)
                  console.warn(this.graph.getCells()[0])
                  const scaleContentToFit = this.paper.scaleContentToFit({ maxScale: 2 })
                  console.warn('scaleContentToFit', scaleContentToFit)
                  console.warn(this.graph.getCells()[0])
                }}
              >
              适应屏幕
              </Button>
              <Button icon="save">保存并提交</Button>
              <Button
                icon="deployment-unit"
                onClick={() => this.setState({ yamlDockVisible: true })}
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
                value={this.state.paperScale}
                min={PAPER_SCALE_MIN}
                max={PAPER_SCALE_MAX}
                step={PAPER_SCALE_STEP}
                marks={{ 1: '1x' }}
                onChange={paperScale => {
                  this.paper.scale(paperScale, paperScale)
                  this.setState({ paperScale })
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
                // Set the dropEffect to move
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
                ev.dataTransfer.dropEffect = 'move'
              }}
              onDrop={this.onResourceDrop}
            >
              <div className="loading">loading ...</div>
            </div>
          </div>
        </div>
        <Dock
          fluid={false}
          size={this.state.yamlDockSize}
          isVisible={this.state.yamlDockVisible}
          position="bottom"
          dimMode="none"
          onSizeChange={yamlDockSize => {
            if (yamlDockSize < DOCK_DEFAULT_HEADER_SIZE) return
            this.setState({ yamlDockSize })
          }}
        >
          <div className={styles.yaml}>
            <TenxEditor
              value={this.state.yamlStr}
              onChange={yamlStr => this.setState({ yamlStr })}
            />
          </div>
        </Dock>
      </QueueAnim>
    )
  }
}
