/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * Job container
 *
 * @author Songsz
 * @date 2018-10-29
 *
*/

import React from 'react'
import styles from './style/StatefulSetHeader.less'
import { Tag as StatefulSetIcon } from '@tenx-ui/icon'
import { Button } from 'antd'
import { connect } from 'dva'
import { getDeepValue } from '../../../utils/helper'
import { getNativeResourceStatus } from '../../../utils/status_identify'
import moment from 'moment'
import NativeStatus from '../../../components/NativeStatus'
import { DEFAULT_TIME_FORMAT } from '../../../utils/constants'

const nativeStatus = status => {
  const { phase, availableReplicas, replicas } = status
  return <NativeStatus
    status={{ availableReplicas, replicas }}
    phase={phase}
    hidePodInfo
  />
}

const StatefulSetHeader = ({ data }) => {
  if (!data.metadata) return <div/>
  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <StatefulSetIcon className={styles.leftIcon}/>
        <span className={styles.firstColumn}>
          <div className={styles.title}>{getDeepValue(data, 'metadata.name') || '--'}</div>
          <div className={styles.normal}>状态:&nbsp;&nbsp; {
            nativeStatus(getNativeResourceStatus(data))
          }</div>
          <div className={styles.normal}>更新策略: {
            getDeepValue(data, 'spec.updateStrategy.type') === 'RollingUpdate' ? '滚动升级' : '普通升级'
          }</div>
          <div className={styles.normal}>最小就绪时间: {
            getDeepValue(data, 'spec.template.spec.terminationGracePeriodSeconds') || '--'
          }s</div>
          <div className={styles.normal}>创建时间: {
            moment(getDeepValue(data, 'metadata.creationTimestamp')).format(DEFAULT_TIME_FORMAT)
          }</div>
        </span>
        <span className={styles.secondColumn}>
          <div className={styles.normal}>注释: aaaaaa</div>
          <div className={styles.normal}>标签: name:aaaaaa; nnn;</div>
          <div className={styles.normal}>pod selector: name:test111</div>
          <div className={styles.normal}>node selector: name:test222</div>
        </span>
      </div>
      <Button type="primary"> 编辑 Yaml</Button>
    </div>
  )
}

const mapStateToProps = ({ nativeDetail: { detailData = {} } }) => {
  return {
    data: detailData,
  }
}

export default connect(mapStateToProps)(StatefulSetHeader)
