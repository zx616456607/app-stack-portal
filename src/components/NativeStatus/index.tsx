/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * NativeStatus.ts page
 *
 * @author zhangtao
 * @date Tuesday October 30th 2018
 */

 // 显示k8s原生资源的状态
import * as React from 'react'
import { Circle as CircleIcon } from '@tenx-ui/icon'
import styles from './styles/NativeStatus.less'
import { Progress } from 'antd'
import Ellipsis from '@tenx-ui/ellipsis'

export interface Status {
  availableReplicas: number
  replicas: number
  failureReason?: string | undefined
}

export interface NativeStatusProps {
  type?: string | undefined;
  phase: string;
  status: Status;
  hidePodInfo?: boolean;
}

function SwitchToStatus(phase: string) {
  const status = {
    color: 'black',
    text: '未定义',
  }
  if (phase === 'Pending') { status.color = styles.blue; status.text = '正在启动'; }
  if (phase === 'Running') { status.color = styles.green; status.text = '运行中'; }
  if (phase === 'Stopping') { status.color = styles.red; status.text = '停止中'; }
  if (phase === 'Stopped') { status.color = styles.red; status.text = '已停止'; }
  if (phase === 'Failure') { status.color = styles.red; status.text = '执行失败'; }
  if (phase === 'Finish') { status.color = styles.green; status.text = '执行完成'; }
  if (phase === 'Doing') { status.color = styles.blue; status.text = '执行中'; }
  return status
}

const IconHidden = [ 'Pending' ] // 当处于这些状态的时候, 不显示最前面的icon
export default class NativeStatus extends React.Component<NativeStatusProps, {}> {
  render() {
    const { phase, hidePodInfo = false } = this.props
    const phaseInfo = SwitchToStatus(phase)
    return(
      <div className="NativeStatus">
        <div className={phaseInfo.color}>
        {
          !IconHidden.includes(phase) && <CircleIcon/>
        }
          <span className={styles.phaseInfoText}>{phaseInfo.text}</span>
        </div>
        {
          !hidePodInfo && this.props.type === undefined &&
          <PodsStatus status={this.props.status}/>
        }{
          !hidePodInfo && this.props.type === 'Job' &&
          <JobPodsStatus status={this.props.status} phase={phase}/>
        }
      </div>
    )
  }
 }

function PodsStatus({
  status = {} as Status,
}) {
  const { availableReplicas = 0, replicas = 0 } = status
  let info = '-'
  if (availableReplicas === 0) {
      info = '全部停止'
    }
  if (availableReplicas !== 0 && availableReplicas !== replicas) {
      info = '部分运行'
    }
  if (availableReplicas !== 0 && availableReplicas === replicas) {
      info = '全部运行'
    }
  return (
    <div className={styles.podInfo}>
    <span>{`${availableReplicas}/${replicas}`}</span>
    <span className={styles.podInfoText}>
      {info}
    </span>
    </div>
  )
}

interface JobPodsStatusProps {
  status: Status;
  phase: string;
  failureReason?: string | undefined
}

interface JobPodsStatusState {
  percent: number
}
class JobPodsStatus extends React.Component<JobPodsStatusProps, JobPodsStatusState> {
  timer: any
  state = {
    percent: 0 as number,
  }
  componentDidMount() {
    this.timer = setInterval(() => {
      const { percent: innerPercent } = this.state
      if (innerPercent < 85) {
       return this.setState({ percent: (innerPercent + 5) })
      }
      clearInterval(this.timer)
    }, 100)
  }
  componentWillUnmount() {
    clearInterval(this.timer)
  }
  render () {
    const { availableReplicas = 0, replicas = 0, failureReason } = this.props.status
    if (this.props.phase === 'Pending') {
      return <Progress
        percent={this.state.percent}
        strokeColor={'#2db7f5'}
        strokeWidth={5}
        showInfo={false}
      />
    }
    if (this.props.phase === 'Failure') {
      return  <div className={styles.gray}>
        <Ellipsis length={20} title={failureReason}>
          {failureReason}
        </Ellipsis>
      </div>
    }
    const info = '已完成 Pod'
    return (
      <div className={styles.podInfo}>
      <span>{`${availableReplicas}/${replicas}`}</span>
      <span className={styles.podInfoText}>
        {info}
      </span>
      </div>
    )
  }
}
