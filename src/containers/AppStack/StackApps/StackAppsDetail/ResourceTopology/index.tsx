/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * index.ts page
 *
 * @author zhangtao
 * @date Friday December 14th 2018
 */
import * as React from 'react'
import RelationChart from '@tenx-ui/relation-chart'
import { connect } from 'dva'
import { getDeepValue } from '../../../../../utils/helper'

const config = {
  rankdir: 'LR',
  nodesep: 200,
  edgesep: 200,
  // ranksep: 100,
  marginx: 100,
  marginy: 100,
} // 默认relation-chart 配置

interface RTProps {
  appStackDetail: any;
}

interface RTState {
  nodeArray: any[],
  edgesArray: any[],
}

function mapStateToProps(state) {
  const appStackDetail = getDeepValue(state, [ 'appStack', 'appStacksDetail' ])
  return { appStackDetail  }
}

const defaultAppConfig = {
  id: '',
  label: '',
  width: 0, height: 0,
  onClick: () => {},
  isAnimated: true,
  shape: 'dottedcylinder',
}

const defaultDpConfig = {
  id: '',
  label: '',
  width: 0, height: 0,
  onClick: () => {},
  isAnimated: true,
  shape: 'cloud',
}

const defaultPodConfig = {
  id: '',
  label: '',
  width: 0, height: 0,
  onClick: () => {},
  isAnimated: true,
  shape: 'circle',
}

const defaultcMConfig = {
  id: '',
  label: '',
  width: 0, height: 0,
  onClick: () => {},
  isAnimated: true,
  shape: 'triangle',
}

const defaultEdgeConfig = {
  source: '',
  target: '',
  withArrow: true,
  arrowOffset: 25,
  label: '',
  isAnimated: true,
}

function formateEdgesAndNodes(appStack: any, onClick: (lname: string, e: any) => void): any[] {
  const edgeEdge: any[] = []
  const NodeArray: any[] = []
  Object.entries(appStack).forEach(([appNode, dpNodeArray]) => {
    NodeArray.push(Object.assign({}, defaultAppConfig, { id: appNode, label: appNode, onClick }))
    dpNodeArray.forEach(dpNode => {
      const name = getDeepValue(dpNode, ['metadata', 'name'])
      NodeArray.push(Object.assign({}, defaultDpConfig, { id: name, label: name, onClick }))
      edgeEdge.push(Object.assign({}, defaultEdgeConfig, { source: appNode, target: name }))
      const podsArray = getDeepValue(dpNode, ['pods']) || []
      podsArray.forEach(pods => {
        const podsName = getDeepValue(pods, [ 'metadata', 'name' ])
        NodeArray.push(Object.assign({}, defaultPodConfig, { id: podsName, label: podsName, onClick }))
        edgeEdge.push(Object.assign({}, defaultEdgeConfig, { source: name, target: podsName }))
      });
      const cmArray = getDeepValue(dpNode, ['configMap']) || {}
      Object.keys(cmArray).forEach((cmName) => {
        NodeArray.push(Object.assign({}, defaultcMConfig, { id: cmName, label: cmName, onClick }))
        edgeEdge.push(Object.assign({}, defaultEdgeConfig, { source: name, target: cmName }))
      })
    });
  })
  return [edgeEdge, NodeArray]
}

@connect(mapStateToProps)
export default class ResourceTopology extends React.Component<RTProps, RTState> {
  state = {
    nodeArray: [],
    edgesArray: [],
  }
  componentDidMount() {
    const deployments: any[] = getDeepValue(this.props.appStackDetail, ['deployments']) || []
    const appStack: any = {}
    const appArray: string[] = []
    deployments.forEach((dp) => {
      const appName: string = getDeepValue(dp, ['metadata', 'labels', 'system/appName'])
      if (appName) {
        if (!appArray.includes(appName)) {
          appArray.push(appName)
          appStack[appName] = [dp]
        } else {
          appStack[appName].push(dp)
        }
      }
    })
    const [ edgesArray, nodeArray] = formateEdgesAndNodes(appStack, this.onNodeClick)
    this.setState({ nodeArray, edgesArray})
  }
  onNodeClick = (lname: string, e): void => {
    e.stopPropagation();
    const { nodeArray } = this.state;
    const newNodes = [...nodeArray]
    console.log('lname', lname)
    newNodes.forEach(n => {
      if (n.active !== undefined) {
        delete n.active;
      }
      if (n.id === lname) {
        n.active = true;
      }
    })
    this.setState({ nodeArray: newNodes })
  }
  onRelationChartClick = () => {
    const { nodeArray } = this.state;
    const newNodes = [...nodeArray];
    newNodes.forEach(n => {
      if (n.active !== undefined) {
        delete n.active;
      }
    })
    this.setState({ nodeArray: newNodes })
  }
  render() {
    return(
      <RelationChart
        graphConfigs={config}
        nodes={this.state.nodeArray}
        edges={this.state.edgesArray}
        SvgHeight={'420px'}
        onSvgClick={this.onRelationChartClick}
      />
    )
  }
}
// const ResourceTopology = () => <h1>ResourceTopology</h1>

// export default ResourceTopology
