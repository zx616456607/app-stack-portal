/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Stack Topology
 *
 * @author zhangpc
 * @date 2018-12-12
 */
import React from 'react'
import { connect } from 'dva'
import * as joint from 'jointjs'
import 'jointjs/dist/joint.css'
import '../../../Designer/shapes'
import '../../../Designer/style/joint-custom.less'

@connect(state => {
  const { appStack } = state
  let { appStacksDetail } = appStack
  if (appStacksDetail) {
    appStacksDetail.templateObj = JSON.parse(appStacksDetail.appStack.spec.content)
  } else {
    appStacksDetail = {}
  }
  return { appStacksDetail }
})
export default class StackTopology extends React.Component {
  state = {
    paperScale: 1,
  }

  componentDidMount() {
    this.paperDom = document.getElementById('app-stack-paper')
    this.graph = new joint.dia.Graph()
    this.paper = new joint.dia.Paper({
      el: this.paperDom,
      model: this.graph,
      width: '100%',
      height: 800,
      gridSize: 16,
      drawGrid: {
        name: 'fixedDot',
      },
      snapLinks: true,
      linkPinning: false,
      embeddingMode: true,
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
      interactive: false,
    })
    this.graph.fromJSON(this.props.appStacksDetail.templateObj._graph)
  }

  render() {
    return <div>
      <div id="app-stack-paper">
      loading...
      </div>
    </div>
  }
}
