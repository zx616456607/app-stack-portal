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
import moment from 'moment'
import classnames from 'classnames'

const JobHeader = ({ data }) => {
  if (!data.metadata) return <div/>
  return (
    <div className={classnames(styles.container, styles.cronJob)} >
      <div className={styles.left}>
        <StatefulSetIcon className={styles.leftIcon}/>
        <span className={styles.firstColumn}>
          <div className={styles.title}>{getDeepValue(data, 'metadata.name') || '--'}</div>
          <div className={styles.normal}>正在进行任务书: {}</div>
          <div className={styles.normal}>已完成任务数: {
            getDeepValue(data, 'spec.updateStrategy.type') === 'RollingUpdate' ? '滚动升级' : '普通升级'
          }</div>
        </span>
        <span className={styles.secondColumn}>
          <div className={styles.normal}>触发规则: 1</div>
          <div className={styles.normal}>创建时间: {
            moment(getDeepValue(data, 'metadata.creationTimestamp')).format('YYYY-MM-DD HH:mm:ss')
          }</div>
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

export default connect(mapStateToProps)(JobHeader)
