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
import { ELEMENT_KEY_KIND_MAP } from '../../../../../utils/constants'

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

const MappingShape = {
  edge: defaultEdgeConfig,
  app: Object.assign({}, defaultConfig, { shape: 'dottedcylinder' }),
  deployments: Object.assign({}, defaultConfig, { shape: 'cloud' }),
  pod: Object.assign({}, defaultConfig, { shape: 'circle' }),
  configMaps: Object.assign({}, defaultConfig, { shape: 'triangle' }),
  cronJobs: Object.assign({}, defaultConfig, { shape: 'square' }),
  jobs: Object.assign({}, defaultConfig, { shape: 'pentagon' }),
  pvcs: Object.assign({}, defaultConfig, { shape: 'hexagon' }),
  secrets: Object.assign({}, defaultConfig, { shape: 'octagon' }),
  services: Object.assign({}, defaultConfig, { shape: 'cylinder' }),
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

function findDefaultConfig(key: string) {
  return MappingShape[key] || defaultConfig
}

function formateKind(kind = '') {
  const kindArray = kind.split('')
  if (kindArray[kindArray.length - 1] === 's') {
    kindArray.pop()
  }
  kindArray[0] = kindArray[0].toUpperCase()
  return kindArray.join('')
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
          { id: `${key}-${name}`, label: <Label kind={key} name={name} showKind={formateKind(key)}/>, onClick }))
          if (appNode) {
            edgeEdge.push(Object.assign({}, findDefaultConfig('edge'),
            { source: `app-${appNode}`, target: `${key}-${name}` }))
          }
          const podsArray = getDeepValue(dpNode, ['pods']) || []
          podsArray.forEach(pods => {
            const podsName = getDeepValue(pods, [ 'metadata', 'name' ])
            NodeArray.push(Object.assign({}, findDefaultConfig('pod'),
            { id: podsName, label: <Label kind={'pod'} name={podsName} parentKind={key} showKind={'Pod'}/>, onClick }))
            edgeEdge.push(Object.assign({}, findDefaultConfig('edge'),
            { source: `${key}-${name}`, target: podsName }))
          });
          const cmArray = getDeepValue(dpNode, ['configMap']) || {}
          Object.keys(cmArray).forEach((cmName) => {
            NodeArray.push(Object.assign({},  findDefaultConfig('configMaps'),
            { id: cmName, label: <Label kind={'configMap'} name={cmName} showKind={'ConfigMap'}/>, onClick }))
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
        label: <Label kind={'stack'} showKind={'Stack'} name={appNode}/>, onClick }))
    formateResource(resourceObject as any, appNode)
  })
  formateResource(notIncludesApp)
  return [edgeEdge, NodeArray]
}

// parentKind 是用来存储数据的
function Label({ kind, name, parentKind = '', showKind }) {
  return (
    <div>
      <div>
        <strong>{showKind}</strong>
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
    const kind = nodeInfo.label.props.kind
    const nameInfo = nodeInfo.label.props
    const filterArray = [ 'deployments', 'pod', 'statefulSets' ]
    e.stopPropagation();
    const { nodeArray } = this.state;
    const newNodes = [...nodeArray]
    newNodes.forEach(n => {
      if (n.active !== undefined) {
        delete n.active;
      }
      if (n.label.props.name === lname && n.label.props.kind === kind) {
        n.active = true;
      }
    })
    if (!filterArray.includes(nameInfo.kind)) { return this.setState({ nodeArray: newNodes }) }
    const Pods = this.findPods(nameInfo)
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
