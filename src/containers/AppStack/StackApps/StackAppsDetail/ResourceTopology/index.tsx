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
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import Detail from './detail'
import { findDOMNode } from 'react-dom';
import autoFitFS from '@tenx-ui/utils/lib/autoFitFS'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'

// 当前显示的资源类型
const ELEMENT_KEY_KIND_MAP = {
  deployments: 'Deployment',
  services: 'Service',
  configMaps: 'ConfigMap',
  cronJobs: 'CronJob',
  jobs: 'Job',
  pvcs: 'PersistentVolumeClaim',
  secrets: 'Secret',
}

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
  autoFitFsH: number
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

// 'circle', 'triangle', 'square', 'pentagon', 'hexagon', 'heptagon'
// 'octagon', 'cloud', 'sheet', 'cylinder', 'dottedcylinder'
function findDefaultConfig(key: string) {
  const defaultConfig = {
    id: '',
    label: '',
    width: 50, height: 50,
    onClick: () => {},
    isAnimated: true,
    shape: 'sheet',
  }
  const defaultEdgeConfig = {
    source: '',
    target: '',
    withArrow: true,
    arrowOffset: 10,
    label: '',
    isAnimated: true,
  }
  if (key === 'edge') { return defaultEdgeConfig }
  if (key === 'app') { return Object.assign({}, defaultConfig, { shape: 'dottedcylinder' }) }
  if (key === 'deployments') { return  Object.assign({}, defaultConfig, { shape: 'cloud' }) }
  if (key === 'pod') { return  Object.assign({}, defaultConfig, { shape: 'circle' }) }
  if (key === 'configMaps') { return  Object.assign({}, defaultConfig, { shape: 'triangle' }) }
  if (key === 'cronJobs') { return  Object.assign({}, defaultConfig, { shape: 'square' }) }
  if (key === 'jobs') { return  Object.assign({}, defaultConfig, { shape: 'pentagon' }) }
  if (key === 'pvcs') { return  Object.assign({}, defaultConfig, { shape: 'hexagon' }) }
  if (key === 'secrets') { return  Object.assign({}, defaultConfig, { shape: 'octagon' }) }
  if (key === 'services') { return  Object.assign({}, defaultConfig, { shape: 'cylinder' }) }
  return defaultConfig
}

function formateEdgesAndNodes(appStack: any, onClick: (lname: string, e: any) => void, notIncludesApp): any[] {
  const edgeEdge: any[] = []
  const NodeArray: any[] = []
  // 整理deployment 数据的函数
  function formateResource(resourceObject: any, appNode?: string): void {
    for (const key in resourceObject) {
      if (resourceObject.hasOwnProperty(key)) {
        resourceObject[key].forEach(dpNode => {
          const name = getDeepValue(dpNode, ['metadata', 'name'])
          NodeArray.push(Object.assign({}, findDefaultConfig(key),
          { id: `${key}-${name}`, label: <Label kind={key} name={name}/>, onClick }))
          if (appNode) {
            edgeEdge.push(Object.assign({}, findDefaultConfig('edge'),
            { source: `app-${appNode}`, target: `${key}-${name}` }))
          }
          const podsArray = getDeepValue(dpNode, ['pods']) || []
          podsArray.forEach(pods => {
            const podsName = getDeepValue(pods, [ 'metadata', 'name' ])
            NodeArray.push(Object.assign({}, findDefaultConfig('pod'),
            { id: podsName, label: <Label kind={'pod'} name={podsName} parentKind={key}/>, onClick }))
            edgeEdge.push(Object.assign({}, findDefaultConfig('edge'),
            { source: `${key}-${name}`, target: podsName }))
          });
          const cmArray = getDeepValue(dpNode, ['configMap']) || {}
          Object.keys(cmArray).forEach((cmName) => {
            NodeArray.push(Object.assign({},  findDefaultConfig('configMaps'),
            { id: cmName, label: <Label kind={'configMap'} name={cmName}/> }))
            edgeEdge.push(Object.assign({}, findDefaultConfig('edge'),
            { source: `${key}-${name}`, target: cmName }))
          })
        });
      }
    }
  }
  Object.entries(appStack).forEach(([appNode, resourceObject]) => {
    NodeArray.push(Object.assign({}, findDefaultConfig('app'),
      { id: `app-${appNode}`,
        label: <Label kind={'stack'} name={appNode}/> }))
    formateResource(resourceObject as any, appNode)
  })
  formateResource(notIncludesApp)
  return [edgeEdge, NodeArray]
}

// parentKind 是用来存储数据的
function Label({ kind, name, parentKind = '' }) {
  return (
    <div>
      <div>
        <strong>{kind}</strong>
      </div>
      <div>{name}</div>
    </div>
  )
}
@autoFitFS(50)
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
    const appStackDetail = this.props.appStackDetail || {}
    const newAppStackDetail = {}
    Object.keys(ELEMENT_KEY_KIND_MAP).forEach((key) => {
      if (appStackDetail[key]) {
        newAppStackDetail[key] = appStackDetail[key]
      }
    })
    const appStack: any = {}
    let appArray: string[] = []
    const notIncludesApp: any[] = [] // 用于存放没有app的dp
    for (const key in newAppStackDetail) {
      if (newAppStackDetail.hasOwnProperty(key)) {
        newAppStackDetail[key].forEach(node => {
          const appName: string = get(node, ['metadata', 'labels', 'system/appstack'])
          if (appName) {
            if (!appArray.includes(appName)) {
              appArray.push(appName)
              if (!appStack[appName]) {
                appStack[appName] = { [key]: [node] }
              } else {
                appStack[appName] = Object.assign(appStack[appName], { [key]: [node] })
              }
            } else {
              appStack[appName][key].push(node)
            }
          } else {
            notIncludesApp.push(node)
          }
        });
        appArray = []
      }
    }
    const [ edgesArray, nodeArray] =
    formateEdgesAndNodes(appStack, this.onNodeClick, notIncludesApp)
    this.setState({ nodeArray, edgesArray })
  }
  findPods(nameinfo: any): any {
    const name = nameinfo.name
    const kind = nameinfo.kind
    const newKind = kind === 'pod' ? nameinfo.parentKind : kind
    const deployments: any[] = getDeepValue(this.props.appStackDetail, [newKind]) || []
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
    const lname = nodeInfo.label.props.name
    const nameInfo = nodeInfo.label.props
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
    const Pods = this.findPods(nameInfo)
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
        SvgHeight={this.props.autoFitFsH}
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
