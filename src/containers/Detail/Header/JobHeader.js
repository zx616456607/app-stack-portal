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

const JobHeader = ({ data }) => {
  if (!data.metadata) return <div/>
  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <StatefulSetIcon className={styles.leftIcon}/>
        <span className={styles.firstColumn}>
          <div className={styles.title}>{getDeepValue(data, 'metadata.name') || '--'}</div>
          <div className={styles.normal}>重启策略: {}</div>
          <div className={styles.normal}>注释: {
            getDeepValue(data, 'spec.updateStrategy.type') === 'RollingUpdate' ? '滚动升级' : '普通升级'
          }</div>
          <div className={styles.normal}>标签: {
            getDeepValue(data, 'spec.template.spec.terminationGracePeriodSeconds') || '--'
          }s</div>
          <div className={styles.normal}>创建时间: {
            moment(getDeepValue(data, 'metadata.creationTimestamp')).format('YYYY-MM-DD HH:mm:ss')
          }</div>
        </span>
        <span className={styles.secondColumn}>
          <div className={styles.normal}>运行: 1</div>
          <div className={styles.normal}>并行: 1</div>
          <div className={styles.normal}>完成: 1</div>
          <div className={styles.normal}>失败: 1</div>
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
