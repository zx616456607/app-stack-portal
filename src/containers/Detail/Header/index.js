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
import { routerRedux } from 'dva/router'
import { getDeepValue } from '../../../utils/helper'
import moment from 'moment'
import { DEFAULT_TIME_FORMAT } from '../../../utils/constants'
import queryString from 'query-string'
import { getStatefulSetStatus } from '../../../utils/status_identify'
import NativeStatus from '../../../components/NativeStatus'
import classnames from 'classnames'

const nativeStatus = status => {
  const { phase, availableReplicas, replicas } = status
  return <NativeStatus
    status={{ availableReplicas, replicas }}
    phase={phase}
    hidePodInfo
  />
}

const toYamlEditor = (dispatch, name, type) => {
  dispatch(routerRedux.push({
    pathname: '/createWorkLoad',
    search: queryString.stringify({
      edit: true,
      name,
      type,
    }),
  }))
}

const DetailHeader = ({ data, dispatch, name, type }) => {
  if (!data.metadata) return <div/>
  return (
    <div className={classnames({
      [styles.container]: true,
      [styles.cronJob]: type === 'CronJob',
    })}>
      <div className={styles.left}>
        <StatefulSetIcon className={styles.leftIcon}/>
        <span className={styles.firstColumn}>
          <div className={styles.title}>{getDeepValue(data, 'metadata.name') || '--'}</div>
          {
            type === 'StatefulSet' &&
              <React.Fragment>
                <div className={styles.normal}>状态:&nbsp;&nbsp; {
                  nativeStatus(getStatefulSetStatus(data))
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
              </React.Fragment>
          }
          {
            type === 'Job' &&
            <React.Fragment>
              <div className={styles.normal}>重启策略: TODO</div>
              <div className={styles.normal}>注释: TODO</div>
              <div className={styles.normal}>标签: TODO</div>
              <div className={styles.normal}>创建时间: {
                moment(getDeepValue(data, 'metadata.creationTimestamp')).format(DEFAULT_TIME_FORMAT)
              }</div>
            </React.Fragment>
          }
          {
            type === 'CronJob' &&
            <React.Fragment>
              <div className={styles.normal}>正在进行任务数: TODO</div>
              <div className={styles.normal}>任务成功历史限制数: {
                getDeepValue(data, 'spec.successfulJobsHistoryLimit') || '--'
              }</div>
              <div className={styles.normal}>任务失败历史限制数: {
                getDeepValue(data, 'spec.failedJobsHistoryLimit') || '--'
              }</div>
            </React.Fragment>
          }
        </span>
        <span className={styles.secondColumn}>
          {
            type === 'StatefulSet' &&
              <React.Fragment>
                <div className={styles.normal}>注释: TODO</div>
                <div className={styles.normal}>标签: TODO</div>
                <div className={styles.normal}>pod selector: TODO</div>
                <div className={styles.normal}>node selector: TODO</div>
              </React.Fragment>
          }
          {
            type === 'Job' &&
            <React.Fragment>
              <div className={styles.normal}>运行: TODO</div>
              <div className={styles.normal}>并行: {getDeepValue(data, 'spec.parallelism')}</div>
              <div className={styles.normal}>完成: {getDeepValue(data, 'spec.completions')}</div>
              <div className={styles.normal}>失败: TODO</div>
            </React.Fragment>
          }
          {
            type === 'CronJob' &&
            <React.Fragment>
              <div className={styles.normal}>触发规则: {getDeepValue(data, 'spec.schedule') || '--'}</div>
              <div className={styles.normal}>创建时间: {
                moment(getDeepValue(data, 'metadata.creationTimestamp')).format(DEFAULT_TIME_FORMAT)
              }</div>
            </React.Fragment>
          }
        </span>
      </div>
      <Button onClick={() => toYamlEditor(dispatch, name, type)} type="primary"> 编辑 Yaml</Button>
    </div>
  )
}

const mapStateToProps = ({ nativeDetail: { detailData = {}, name, type } }) => {
  return {
    data: detailData,
    name, type,
  }
}

export default connect(mapStateToProps)(DetailHeader)
