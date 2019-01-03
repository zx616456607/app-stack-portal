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
import Detail from './detail'
import { findDOMNode } from 'react-dom';

const config = {
  rankdir: 'LR',
  nodesep: 160,
  edgesep: 160,
  ranksep: 160,
  marginx: 40,
  marginy: 40,
} // 默认relation-chart 配置

interface RTProps {
  appStackDetail: any;
}

interface RTState {
  nodeArray: any[],
  edgesArray: any[],
  isVisible: boolean,
  pods: any[],
}

function mapStateToProps(state) {
  const appStackDetail = getDeepValue(state, [ 'appStack', 'appStacksDetail' ])
  return { appStackDetail  }
}

const defaultAppConfig = {
  id: '',
  label: '',
  width: 50, height: 50,
  onClick: () => {},
  isAnimated: true,
  shape: 'dottedcylinder',
}

const defaultDpConfig = {
  id: '',
  label: '',
  width: 50, height: 50,
  onClick: () => {},
  isAnimated: true,
  shape: 'cloud',
}

const defaultPodConfig = {
  id: '',
  label: '',
  width: 50, height: 50,
  onClick: () => {},
  isAnimated: true,
  shape: 'circle',
}

const defaultcMConfig = {
  id: '',
  label: '',
  width: 50, height: 50,
  onClick: () => {},
  isAnimated: true,
  shape: 'triangle',
}

const defaultEdgeConfig = {
  source: '',
  target: '',
  withArrow: true,
  arrowOffset: 10,
  label: '',
  isAnimated: true,
}

function formateEdgesAndNodes(appStack: any, onClick: (lname: string, e: any) => void): any[] {
  const edgeEdge: any[] = []
  const NodeArray: any[] = []
  Object.entries(appStack).forEach(([appNode, dpNodeArray]) => {
    NodeArray.push(Object.assign({}, defaultAppConfig, { id: `app-${appNode}`, label: appNode }))
    dpNodeArray.forEach(dpNode => {
      const name = getDeepValue(dpNode, ['metadata', 'name'])
      NodeArray.push(Object.assign({}, defaultDpConfig, { id: `deployment-${name}`, label: name, onClick }))
      edgeEdge.push(Object.assign({}, defaultEdgeConfig, { source: `app-${appNode}`, target: `deployment-${name}` }))
      const podsArray = getDeepValue(dpNode, ['pods']) || []
      podsArray.forEach(pods => {
        const podsName = getDeepValue(pods, [ 'metadata', 'name' ])
        NodeArray.push(Object.assign({}, defaultPodConfig, { id: podsName, label: podsName, onClick }))
        edgeEdge.push(Object.assign({}, defaultEdgeConfig, { source: `deployment-${name}`, target: podsName }))
      });
      const cmArray = getDeepValue(dpNode, ['configMap']) || {}
      Object.keys(cmArray).forEach((cmName) => {
        NodeArray.push(Object.assign({}, defaultcMConfig, { id: cmName, label: cmName }))
        edgeEdge.push(Object.assign({}, defaultEdgeConfig, { source: `deployment-${name}`, target: cmName }))
      })
    });
  })
  return [edgeEdge, NodeArray]
}

@connect(mapStateToProps)
export default class ResourceTopology extends React.Component<RTProps, RTState> {
  relationChart: React.ReactDOM
  fullScreen: boolean
  state = {
    nodeArray: [],
    edgesArray: [],
    isVisible: false,
    pods: [],
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
    this.setState({ nodeArray, edgesArray })
  }
  findPods(name: string): any {
    const deployments: any[] = getDeepValue(this.props.appStackDetail, ['deployments']) || []
    const choiceDp = deployments.filter((dp) => {
      const lname = dp.metadata.name
      return lname === name
    })[0]
    if (choiceDp !== undefined ) {
      return choiceDp.pods
    }
    const podsArray = deployments.map(({ pods }) => pods)
    .reduce((current, next) => current.concat(next) , [])
    .filter((pods) => { return pods.metadata.name === name })
    return podsArray
  }
  onNodeClick = (_, e, nodeInfo: any): void => {
    const lname = nodeInfo.label
    e.stopPropagation();
    const { nodeArray } = this.state;
    const newNodes = [...nodeArray]
    newNodes.forEach(n => {
      if (n.active !== undefined) {
        delete n.active;
      }
      if (n.id === lname) {
        n.active = true;
      }
    })
    const Pods = this.findPods(lname)
    // return
    this.setState({ pods: Pods },
    () => this.setState({ nodeArray: newNodes, isVisible: true  }))
  }
  onRelationChartClick = () => {
    const { nodeArray } = this.state
    const newNodes = [...nodeArray]
    newNodes.forEach(n => {
      if (n.active !== undefined) {
        delete n.active
      }
    })
    this.setState({ nodeArray: newNodes, isVisible: false })
  }
  cancelDock = () => {
    this.setState({ isVisible: false })
    this.onRelationChartClick()
  }
  render() {
    return(
      <RelationChart
        graphConfigs={config}
        nodes={this.state.nodeArray}
        edges={this.state.edgesArray}
        SvgHeight={'800px'}
        onSvgClick={this.onRelationChartClick}
        ref={(node) => this.relationChart = node}
        fullScreenMode={(full) => this.fullScreen = full}
      >
      { !this.fullScreen &&
        <Detail
          isVisible={this.state.isVisible}
          cancelDock={this.cancelDock}
          pods={this.state.pods}
        />
      }{
        this.fullScreen &&
        <Detail
          isVisible={this.state.isVisible}
          cancelDock={this.cancelDock}
          pods={this.state.pods}
          getContainer={findDOMNode(this.relationChart)}
        />
      }
      </RelationChart>
    )
  }
}
// const ResourceTopology = () => <h1>ResourceTopology</h1>

// export default ResourceTopology
