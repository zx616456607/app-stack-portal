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
import { notification, Select, Icon } from 'antd'
import queryString from 'query-string'
import { withRouter, RouteComponentProps } from 'dva/router'

const Option = Select.Option;

interface ToolProps extends SubscriptionAPI, RouteComponentProps {
  cluster: string
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
          <Preview/>
        </PanelGroup>
      </div>
    )
  }
};

function mapStateToProps(state) {
  const { app: { cluster = '' } = {} } = state
  return { cluster }
}
export default withRouter(connect(mapStateToProps)(Tool))

interface SampleProps extends RouteComponentProps{
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
        }
        {
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
            <div className={styles.insert}><Icon type="form" />插入</div>
          </div>
          <div className={styles.comments}>{dataNode.comments}</div>
        </div>
      }
    </React.Fragment>
  )
}



interface PreviewProps {

}
interface PreviewState {

}
class Preview extends React.Component<PreviewProps, PreviewState> {
  render() {
    return(
      <div className={styles.Preview}>
        <div className={styles.SampleHeader}>
          概览
        </div>
      </div>
    )
  }
};
