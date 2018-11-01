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

export interface Status {
  availableReplicas: number
  replicas: number
}

export interface NativeStatusProps {
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

function PodsStatus(status: Status) {
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
  return info
}

export default class NativeStatus extends React.Component<NativeStatusProps, {}> {
  render() {
    const { phase, hidePodInfo = false, status: { availableReplicas = 0, replicas = 0 } = {} } = this.props
    const phaseInfo = SwitchToStatus(phase)
    return(
      <div className="NativeStatus">
        <div className={phaseInfo.color}>
          <CircleIcon/><span className={styles.phaseInfoText}>{phaseInfo.text}</span>
        </div>
        {
          !hidePodInfo &&
          <div className={styles.podInfo}>
            <span>{`${availableReplicas}/${replicas}`}</span>
            <span className={styles.podInfoText}>{PodsStatus(this.props.status)}</span>
          </div>
        }
      </div>
    )
  }
 }
