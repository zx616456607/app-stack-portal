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
import * as joint from 'jointjs'
import 'jointjs/dist/joint.css'
import graphlib from 'graphlib'
import TenxEditor from '@tenx-ui/editor'
import 'codemirror/mode/yaml/yaml'
import '@tenx-ui/editor/assets/index.css'
// import { Row, Col, List, Avatar } from 'antd'
import styles from './style/index.less'
// import * as yamls from './yamls'
import './shapes'

const RESOURCE_LIST = [
  {
    id: 'Application',
    title: '应用',
    draggable: true,
  },
  {
    id: 'Deployment',
    title: 'Deployment',
    draggable: true,
  },
  {
    id: 'Service',
    title: 'Service',
    draggable: true,
  },
  {
    id: 'ConfigMap',
    title: 'ConfigMap',
    draggable: true,
  },
  {
    id: 'service-2',
    title: '服务配置·加密配置',
  },
  {
    id: 'service-3',
    title: '存储·独享型',
  },
  {
    id: 'service-4',
    title: '存储·共享型',
  },
  {
    id: 'service-5',
    title: '存储·本地存储',
  },
  {
    id: 'service-6',
    title: '服务发现',
  },
  {
    id: 'service-7',
    title: '应用负载均衡·集群内',
  },
  {
    id: 'service-8',
    title: '应用负载均衡·集群外',
  },
  {
    id: 'service-9',
    title: '集群网络出口',
  },
  {
    id: 'service-10',
    title: '自定义资源',
  },
  {
    id: 'service-11',
    title: '安全组',
  },
]

export default class AppStack extends React.Component {
  state = {
    yamlStr: undefined,
    yamlObj: {},
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

    // this.initDemo()
  }

  /* initDemo = () => {
    const connect = (source, sourcePort, target, targetPort) => {
      const link = new joint.shapes.devs.Link({
        source: {
          id: source.id,
          port: sourcePort,
        },
        target: {
          id: target.id,
          port: targetPort,
        },
      })

      // link.addTo(this.graph).reparent()
    }

    const c1 = new joint.shapes.devs.Coupled({
      position: {
        x: 230,
        y: 50,
      },
      size: {
        width: 300,
        height: 300,
      },
    })

    c1.set('inPorts', [ 'in' ])
    c1.set('outPorts', [ 'out 1', 'out 2' ])

    const a1 = new joint.shapes.devs.Atomic({
      position: {
        x: 360,
        y: 260,
      },
      inPorts: [ 'xy' ],
      outPorts: [ 'x', 'y' ],
    })

    const a2 = new joint.shapes.devs.Atomic({
      position: {
        x: 50,
        y: 160,
      },
      outPorts: [ 'out' ],
    })

    const a3 = new joint.shapes.devs.Atomic({
      position: {
        x: 650,
        y: 50,
      },
      size: {
        width: 100,
        height: 300,
      },
      inPorts: [ 'a', 'b' ],
    })

    const atomics = [ c1, a1, a2, a3 ]

    atomics.forEach(element => {
      element.attr({
        '.body': {
          rx: 6,
          ry: 6,
        },
      })
    })

    this.graph.addCells([ c1, a1, a2, a3 ])

    c1.embed(a1)

    connect(a2, 'out', c1, 'in')
    connect(c1, 'in', a1, 'xy')
    connect(a1, 'x', c1, 'out 1')
    connect(a1, 'y', c1, 'out 2')
    connect(c1, 'out 1', a3, 'a')
    connect(c1, 'out 2', a3, 'b')

    // Interactions

    const strokeDasharrayPath = '.body/strokeDasharray'

    const toggleDelegation = element => {
      element.attr(strokeDasharrayPath, element.attr(strokeDasharrayPath) ? '' : '15,1')
    }

    this.paper.setInteractivity(elementView => {
      return {
        stopDelegation: !elementView.model.attr(strokeDasharrayPath),
      }
    })

    toggleDelegation(a1)
  } */

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

    // console.log('graph.toJSON()', JSON.stringify(this.graph.toJSON()))
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
              RESOURCE_LIST.map(({ id, title, draggable }) =>
                <div
                  draggable={draggable}
                  key={id}
                  onDragStart={ev => {
                    // Add the target element's id to the data transfer object
                    ev.dataTransfer.setData('text/plain', id)
                    ev.dropEffect = 'move'
                  }}
                >
                  <span>{title}</span>
                </div>
              )
            }
          </div>
          <div
            id="app-stack-paper"
            className={styles.graph}
            key="paper"
            onDragOver={ev => {
              ev.preventDefault();
              // Set the dropEffect to move
              ev.dataTransfer.dropEffect = 'move'
            }}
            onDrop={this.onResourceDrop}
          >
            <div className="loading">loading ...</div>
          </div>
        </div>
        <div className={styles.yaml} key="yaml">
          <TenxEditor
            title="Yaml"
            options={{ mode: 'yaml', theme: 'base16-dark' }}
            value={this.state.yamlStr}
            onChange={yamlStr => this.setState({ yamlStr })}
          />
        </div>
      </QueueAnim>
    )
  }
}
