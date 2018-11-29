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
import { AppStack1 as AppStack1Icon , Cronjob as CronjobIcon, Deployment as DeploymentIcon,
  Statefulset as StatefulsetIcon, Job as JobIcon, Pod as PodIcon, Service as ServiceIcon,
  Secret as SecretIcon, Pvc as PvcIcon, Configmap as ConfigmapIcon,
} from '@tenx-ui/icon'

const Option = Select.Option;

export interface ToolProps extends SubscriptionAPI, RouteComponentProps {
  cluster: string
  aceEditor: AceEditor
  value: yamlString
  editorNode: HTMLDivElement
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
          />
          <Preview
            aceEditor={this.props.aceEditor}
            value={this.props.value}
            editorNode={this.props.editorNode}
          />
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

interface SampleProps extends RouteComponentProps {
  sampleInfo: {
    [index: string]: Array<Node>,
  }
}
interface SampleState {
  value: string[],
}
class SampleInner extends React.Component<SampleProps, SampleState> {
  state = {
    value : [] as string[],
  }
  handleChange = (value) => {
    this.setState({ value })
  }
  componentDidMount = () => {
    const { location: { search }  } = this.props
    const config = queryString.parse(search)
    this.setState({ value: config.type })
  }
  render() {
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
          Object.entries(this.props.sampleInfo)
          .filter(([key]) => this.state.value.includes(key))
          .map(([_, value]) => value)
          .reduce((current, next) => current.concat(next), [])
          .map((node, index) => <SampleNode key={node.id} dataNode={node} index={index + 1}/>)
        }
        </div>
      </div>
    )
  }
};

const Sample = withRouter(SampleInner)

interface SampleNodeProps {
  dataNode: Node | undefined,
  index: number,
}

const SampleNode = ({
  dataNode,
  index,
}: SampleNodeProps,
) => {
  return (
    <React.Fragment>
      {
        dataNode !== undefined &&
        <div className={styles.SampleNode}>
          <div className={styles.nodeTitle}>
            <div>{`${index}. ${dataNode.opt_name}`}</div>
            {
              dataNode.opt_type === 2  &&
              <div className={styles.insert}><Icon type="form" />插入</div>
            }{
              dataNode.opt_type === 1  &&
              <div className={styles.insert}><Icon type="form" />使用</div>
            }{
              dataNode.opt_type === 0  &&
              <div className={styles.info}>( 未开启服务网格 )</div>
            }
          </div>
          <div className={styles.comments}>{dataNode.comments}</div>
        </div>
      }
    </React.Fragment>
  )
}

interface PreviewProps {
  aceEditor: AceEditor
  value: yamlString
  editorNode: HTMLDivElement
}
interface PreviewState {

}

class Preview extends React.Component<PreviewProps, PreviewState> {
  jumpTo = (row: number) => {
    const Ace = this.props.aceEditor
    Ace.gotoLine(row, 0, true)
    Ace.scrollToLine(row, true, true, () => {})
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
    const previewNodeLenght = previewNode.length
    return(
      <div className={styles.Preview}>
        <div className={styles.SampleHeader}>
          概览
        </div>
        {
          analyzeYamlPreview1(this.props.value).map((nodeInfo, index) =>
          <div
            className={styles.previewNode}
            key={nodeInfo[1]}
            onClick={() => this.onClick(index, previewNodeLenght)}
          >
            <div className={styles.resourceIcon} >
            {
              <Tooltip
                title={nodeInfo[0]}
                getPopupContainer={() => this.props.editorNode}
              >
                {selectIcon(nodeInfo[0])}
              </Tooltip>}
            </div>
            <div>{nodeInfo[1]}</div>
            {
              nodeInfo[2] &&
              <div className={styles.IconWrap}>
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
              </div>
            }
          </div>)
        }
      </div>
    )
  }
};

function analyzeYamlPreview1(value: yamlString) {
  const singaleValue = compact(value.split(`---`))
  const objValue = singaleValue
  .map((ivalue) => {
    let res = []
    try {
      res = yaml.load(ivalue)
    } catch (error) {
      console.warn(error)
    } finally {
      return res
    }
  })
  .filter((node = []) => node.length !== 0)
  .map((node) => {
    const { kind, metadata: { name = '-', labels = '-' } = {} } = node
    const manageFlag = manage(kind, labels)
    return [kind, name, manageFlag]
  })
  return objValue
}

interface Label {
  [index: string]: string
}
function manage(type: string, labels: Label[]) {
  // TODO: 这块还没做
  // switch (type) {
  //   case '':
  //     break;
  //   default:
  //     break;
  // }
  return true
}

// 渲染组件

// 根据资源类型选择不同的icon
function selectIcon(type: string = '') {
  const newtype = type.toLocaleLowerCase()
  if ( newtype === 'configmap' ) { return <ConfigmapIcon /> }
  if ( newtype === 'cronjob' ) { return <CronjobIcon /> }
  if ( newtype === 'deployment' ) { return <DeploymentIcon />}
  if ( newtype === 'job') { return <JobIcon/> }
  if ( newtype === 'pod' ) { return <PodIcon /> }
  if ( newtype === 'cronjob' ) { return <CronjobIcon /> }
  if ( newtype === 'pvc' ) { return <PvcIcon />}
  if ( newtype === 'secret') { return <SecretIcon/> }
  if ( newtype === 'service' ) { return <ServiceIcon />}
  if ( newtype === 'statefulset') { return <StatefulsetIcon/> }
  return <Icon type="question-circle" />
}
