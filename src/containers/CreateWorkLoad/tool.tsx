/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * Sample.tsx page
 *
 * @author zhangtao
 * @date Monday November 26th 2018
 */
import * as React from 'react'
import styles from './styles/tool.less';
import PanelGroup from 'react-panelgroup'
import { connect, SubscriptionAPI } from 'dva'
import { notification, Select, Icon, Tooltip } from 'antd'
import queryString from 'query-string'
import { withRouter, RouteComponentProps } from 'dva/router'
import { Editor as AceEditor } from 'brace'
import { yamlString } from './editorType'
import yaml from 'js-yaml'
import compact from 'lodash/compact'
import { Hpa as HpaIcon , Cronjob as CronjobIcon, Deployment as DeploymentIcon,
  Statefulset as StatefulsetIcon, Job as JobIcon, Pod as PodIcon, Service as ServiceIcon,
  Secret as SecretIcon, Pvc as PvcIcon, Configmap as ConfigmapIcon,
} from '@tenx-ui/icon'
import { getDeepValue } from '../../utils/helper';

const Option = Select.Option;

export interface ToolProps extends SubscriptionAPI, RouteComponentProps {
  cluster: string
  aceEditor: AceEditor
  value: yamlString
  editorNode: HTMLDivElement
  collapsed: boolean
}
interface ToolState {
  sampleInfo: {
    [index: string]: Array<Node>,
  }
}
interface Node {
  id: number
  comments: string
  content: string,
  kind: string,
  opt_name: string,
  opt_type: number
}
class Tool extends React.Component<ToolProps, ToolState> {
  state = {
    sampleInfo: {} as { [index: string]: Array<Node> },
  }
  async componentDidMount() {
    const payload = { cluster: this.props.cluster }
    let res
    try {
      res = await this.props.dispatch({ type: 'createNative/loadSample', payload })
    } catch (error) {
      notification.warn({ message: '获取 Sample 信息失败', description: '' })
    }
    const { data } = res
    this.setState({ sampleInfo: data })
  }
  render() {
    return(
      <div className={styles.toolWrap}>
        <PanelGroup direction="column" borderColor="#252525">
          <Sample
            sampleInfo={this.state.sampleInfo}
            cluster={this.props.cluster}
            dispatch={this.props.dispatch}
          />
          {
            !this.props.collapsed ?
          <Preview
            aceEditor={this.props.aceEditor}
            value={this.props.value}
            editorNode={this.props.editorNode}
          /> : <div/>
          }
        </PanelGroup>
      </div>
    )
  }
};

function mapStateToProps(state) {
  const { app: { cluster = '' } = {} } = state
  return { cluster }
}
export default connect(mapStateToProps)(withRouter(Tool))

interface SampleProps extends RouteComponentProps, SubscriptionAPI {
  cluster: string
  sampleInfo: {
    [index: string]: Array<Node>,
  }
}
interface SampleState {
  value: string[],
  istioEnable: boolean
}
class SampleInner extends React.Component<SampleProps, SampleState> {
  state = {
    value : [] as string[],
    istioEnable: false,
  }
  handleChange = (value) => {
    this.setState({ value })
  }
  async componentDidMount() {
    const { location: { search }  } = this.props
    const config = queryString.parse(search)
    this.setState({ value: config.type })
    const payload = { cluster: this.props.cluster }
    const istioEnable =
     await this.props.dispatch({ type: 'createNative/checkProjectIstio', payload })
    this.setState({ istioEnable: (istioEnable as boolean) })
  }
  render() {
    const selectArray = Object.entries(this.props.sampleInfo)
    .filter(([key]) => this.state.value.includes(key))
    .map(([_, value]) => value)
    .reduce((current, next) => current.concat(next), [])
    const uniqSelectArray = uniqById(selectArray)
    return(
      <div className={styles.Sample}>
        <div className={styles.SampleHeader}>
          Yaml 辅助工具
        </div>
        <div className={styles.contentWrap}>
        {
          this.state.value &&
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="请选择资源类型"
          value={this.state.value}
          onChange={this.handleChange}
          getPopupContainer={(node) => (node as HTMLElement)}
        >
          {
            Object.keys(this.props.sampleInfo).map((value) =>
            <Option key={value} value={value}>{value}</Option>)
          }
        </Select>
        }{
          uniqSelectArray
          .map((node, index) => <SampleNode
            key={node.id}
            dataNode={node}
            index={index + 1}
            istioEnable={this.state.istioEnable}
          />)
        }
        </div>
      </div>
    )
  }
};

const Sample = withRouter(SampleInner)

interface SampleNodeProps extends SubscriptionAPI {
  dataNode: Node | undefined,
  index: number,
  istioEnable: boolean
  YamlString: yamlString
}

class SampleNodeInner extends React.Component<SampleNodeProps, any> {
  checkAppManageType = (yamlJson: any[], type = 'Deployment'):
  { DMatchIndex: number, SMathIndex: number } | boolean  => {
    const deploymentIndex = [] as number[]
    const serviceIndex = [] as number[]
    const deploymentNameArray = [] as string[]
    const serviceNameArray = [] as string[]
    yamlJson.forEach((node, index) => {
      const { kind } = node
      const name = getDeepValue(node, [ 'metadata', 'name' ])
      if ( kind === type ) {
        deploymentIndex.push(index)
        deploymentNameArray.push(name)
      }
      if ( kind === 'Service') {
        serviceIndex.push(index)
        serviceNameArray.push(name)
      }
    })
    if (serviceIndex.length === 0) {
      notification.warn({ message: '插入失败, 不存在可用的service',  description: '' })
      return false
    }
    if (deploymentIndex.length === 0) {
      notification.warn({ message: `插入失败, 不存在可用的${type.toLocaleLowerCase()}`,  description: '' })
      return false
    }
    let matchDeploymentIndex: number | undefined = undefined
    let matchServiceIndex: number | undefined = undefined
    deploymentNameArray.some((name, index) => { // 这段代码只适用于 只有一对deployment和service出现的情况
       return serviceNameArray.some((sName, sIndex) => {
        if (name === sName) {
          matchDeploymentIndex = index
          matchServiceIndex = sIndex
          return true
        }
        return false
      })
    })
    if (matchDeploymentIndex === undefined || matchServiceIndex === undefined) {
      notification.warn({ message: '插入失败, 没有同名的deployment 和 service 资源',
      description: '' })
      return false
    }
    return { DMatchIndex: deploymentIndex[matchDeploymentIndex],
            SMathIndex: serviceIndex[matchServiceIndex] }
  }
  dumpArray = (yamlJson: any[]): yamlString => {
    const yamlStringArray = yamlJson.map(( node ) => {
      return yaml.dump(node)
    })
    return yamlStringArray.join(`---\n`)
  }
  checkManagePvc = (yamlJson: any[]): boolean | number[] => {
    const mathPVCArray: number[] = []
    yamlJson.forEach(({ kind }, index) => {
      if (kind === 'PersistentVolumeClaim') {
        mathPVCArray.push(index)
      }
    })
    if ( mathPVCArray.length === 0 ) {
      notification.warn({ message: '插入失败, 没有可插入的 PVC 资源', description: '' })
      return false
    }
    return mathPVCArray
  }
  onClickNode = (dataNodeOne: Node) => {
    const { id, content } = dataNodeOne
    const yamlJson = analyzeYamlBase(this.props.YamlString) as any[]
    if (id === 1) {
      const resIndex = this.checkAppManageType(yamlJson)
      if (resIndex === false) {
        return
      }
      const { DMatchIndex  } = resIndex as { DMatchIndex: number, SMathIndex: number }
      const { metadata = {} } = yamlJson[DMatchIndex]
      const { labels = {}, name } = metadata
      const insertLables = {
        'system/appName': '',
        'system/svcName': name,
      }
      const newLabels = Object.assign( {}, labels, insertLables)
      metadata.labels = newLabels
      const newPayload = { yamlValue: this.dumpArray(yamlJson) }
      this.props.dispatch({ type: 'createNative/updateYamlValue', payload: newPayload })
    }
    if (id === 2) { // 共享存储纳管pvc
      const resIndexArray = this.checkManagePvc(yamlJson)
      if ( resIndexArray === false) {
        return
      }
      yamlJson.forEach((node, index) => {
        if ((resIndexArray as number[] ).includes(index)) {
          const { labels = {} } = node.metadata
          const contentObj = yaml.load(content)
          const newLabels = Object.assign({}, labels, contentObj.metadata.labels)
          node.metadata.labels = newLabels
        }
      })
      const newPayload = { yamlValue: this.dumpArray(yamlJson) }
      this.props.dispatch({ type: 'createNative/updateYamlValue', payload: newPayload })
    }
    if (id === 4) {
      const resIndex = this.checkAppManageType(yamlJson)
      if (resIndex === false) {
        return
      }
      const { DMatchIndex  } = resIndex as { DMatchIndex: number, SMathIndex: number }
    }
  }
  render() {
    const dataNode = this.props.dataNode || {} as Node
    const { istioEnable, index }  = this.props
    let inserNodeFlage = false
    let explainFlage = false
    if (dataNode.opt_type === 2) {
      if (dataNode.id !== 5) {
        inserNodeFlage = true
      }
      if (dataNode.id === 5 && istioEnable) {
        inserNodeFlage = true
      }
      if (dataNode.id === 5 && !istioEnable) {
        explainFlage = true
      }
    }
    return (
      <React.Fragment>
        {
          dataNode !== undefined &&
          <div className={styles.SampleNode}>
            <div className={styles.nodeTitle}>
              <div>{`${index}. ${dataNode.opt_name}`}</div>
              <div onClick={() => this.onClickNode(dataNode)}>
              {
                inserNodeFlage &&
                <div className={styles.insert}><Icon type="form" />插入</div>
              }{
                explainFlage &&
                <div className={styles.info}>（未开启服务网格）</div>
              }
              </div>
            </div>
            <div className={styles.comments}>{dataNode.comments}</div>
          </div>
        }
      </React.Fragment>
    )
  }
}

function mapStateToPropsNode(state) {
  const YamlString = getDeepValue(state, [ 'createNative', 'yamlValue' ])
  return { YamlString }
}
const SampleNode = connect(mapStateToPropsNode)(SampleNodeInner)
interface PreviewProps {
  aceEditor: AceEditor
  value: yamlString
  editorNode: HTMLDivElement
}
interface PreviewState {

}

class Preview extends React.Component<PreviewProps, PreviewState> {
  timer: any
  jumpTo = (row: number) => {
    const Ace = this.props.aceEditor
    Ace.gotoLine(row, 0, true)
    Ace.scrollToLine(row, true, true, () => {})
  }
  shouldComponentUpdate() { // 连续提交不断刷新组件的问题
    if (this.timer) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(() => {
      this.forceUpdate()
    }, 800);
    return false
  }
  onClick = (index, length) => {
    this.props.aceEditor.gotoLine(1, 0, true)
    const placeArray = [] as any[]
    for (let i = 0; i <= length; i++) {
      const place = this.props.aceEditor.find(`---`, { wholeWord: true } )
      placeArray.push(place)
    }
    const { start: { row = 0 } = {} } = placeArray[0] || {}
    if (row < 4 ) {
      if (index === 0) {
        return this.jumpTo(row + 2)
      }
      if (index !== 0) {
        return this.jumpTo(placeArray[index].start.row + 2)
      }
    }
    if (row >= 4) {
      if (index === 0) {
        return this.jumpTo(1)
      }
      if (index !== 0) {
        const { start: { row: twoRow = 0 } = {} } = placeArray[index - 1] || {}
        return this.jumpTo(twoRow + 2)
      }
    }
  }
  render() {
    const previewNode = analyzeYamlPreview1(this.props.value)
    return(
      <div className={styles.Preview}>
        <div className={styles.SampleHeader}>
          概览
        </div>
        {
          previewNode === false &&
          <div className={styles.errorInfo}>yaml格式有错误</div>
        }
        {
          previewNode !== false &&  (previewNode as any[] ).map((nodeInfo, index) =>
          <div
            className={styles.previewNode}
            key={nodeInfo[1]}
            onClick={() => this.onClick(index, previewNode.length)}
          >
            <div className={styles.resourceIcon} >
            {
              <Tooltip
                title={nodeInfo[0]}
                getPopupContainer={() => this.props.editorNode}
              >
                {selectIcon(nodeInfo[0] || '')}
              </Tooltip>}
            </div>
            <div>{nodeInfo[1]}</div>
            <div className={styles.IconWrap}>
            { nodeInfo[2] &&
              <div className="BorderIcon">
                <Tooltip
                  title={'已被平台纳管'}
                  getPopupContainer={(node) => this.props.editorNode}
                >
                  <div>
                    管
                  </div>
                </Tooltip>
              </div>
            }
            </div>
          </div>)
        }
      </div>
    )
  }
};

function analyzeYamlBase(value: yamlString): any[] | boolean {
  const singaleValue = compact(value.split(`---`))
  const objValue = singaleValue
  .map((ivalue) => {
    let res = []
    try {
      res = yaml.load(ivalue)
      return res
    } catch (error) {
      console.warn(error)
      throw error
    }
  })
  .filter((node = []) => node.length !== 0)
  return objValue
}
function analyzeYamlPreview1(value: yamlString) {
  let res
  try {
    res = analyzeYamlBase(value)
  } catch (error) {
    return false
  }
  return (res as any[])
  .map((node) => {
    const kind = getDeepValue(node, ['kind'])
    const name = getDeepValue(node, ['metadata', 'name'])
    const manageFlag = manage(kind, node)
    return [kind, name, manageFlag]
  })
}

function manage(type: string, node: any) {
  if (type === 'Deployment') {
    const labels = getDeepValue(node, [ 'metadata', 'labels' ]) || {}
    const systemAppName = labels['system/appName']
    const systemSvcName = labels['system/svcName']
    if (systemAppName !== undefined && systemSvcName !== undefined) {
      return true
    }
  }
  if (type === 'PersistentVolumeClaim') {
    const labels = getDeepValue(node, [ 'metadata', 'labels' ]) || {}
    const storageType = labels['system/storageType']
    if (storageType !== undefined) {
      return true
    }
  }
  if (type === 'HorizontalPodAutoscaler') {
    const labels = getDeepValue(node, [ 'metadata', 'labels' ]) || {}
    const strategyName = labels.strategyName
    if ( strategyName !== undefined ) {
      return true
    }
  }
  return false
}

// 渲染组件

// 根据资源类型选择不同的icon
function selectIcon(type: string = '') {
  const newtype = type.toLocaleLowerCase()
  if ( newtype === 'configmap' ) { return <ConfigmapIcon /> }
  if ( newtype === 'horizontalpodautoscaler' ) { return <HpaIcon /> }
  if ( newtype === 'cronjob' ) { return <CronjobIcon /> }
  if ( newtype === 'deployment' ) { return <DeploymentIcon />}
  if ( newtype === 'job') { return <JobIcon/> }
  if ( newtype === 'pod' ) { return <PodIcon /> }
  if ( newtype === 'cronjob' ) { return <CronjobIcon /> }
  if ( newtype === 'persistentvolumeclaim' ) { return <PvcIcon />}
  if ( newtype === 'secret') { return <SecretIcon/> }
  if ( newtype === 'service' ) { return <ServiceIcon />}
  if ( newtype === 'statefulset') { return <StatefulsetIcon/> }
  return <Icon type="question-circle" />
}

// 根据id去掉重复项
function uniqById (nodes: Node[]) {
  const idArray = [] as number[]
  const nodeArray = [] as Node[]
  nodes.forEach((node) => {
    if (!idArray.includes(node.id)) {
      idArray.push(node.id)
      nodeArray.push(node)
    }
  })
  return nodeArray
}
