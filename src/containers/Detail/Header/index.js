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
import { Button, Popover } from 'antd'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { getDeepValue } from '../../../utils/helper'
import moment from 'moment'
import { DEFAULT_TIME_FORMAT } from '../../../utils/constants'
import queryString from 'query-string'
import { getStatefulSetStatus } from '../../../utils/status_identify'
import NativeStatus from '../../../components/NativeStatus'
import classnames from 'classnames'
import Ellipsis from '@tenx-ui/ellipsis'
import CronJobIcon from '../../../assets/img/detailHeaderIcon/CronJob.png'
import JobIcon from '../../../assets/img/detailHeaderIcon/Job.png'
import StatefulSetIcon from '../../../assets/img/detailHeaderIcon/StatefulSet.png'

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

const popoverContent = (rules, title) => (
  <div className={styles['popover-content']}>
    <span className={styles.title}>{title}</span>
    {
      (rules.length ? rules : [ '暂无' ]).map((rule, i) => (
        <span className={styles.rule} key={i}>
          <Ellipsis>{rule}</Ellipsis>
        </span>
      ))
    }
  </div>
)

const popoverItem = (data = {}, title) => {
  const rules = []
  for (const [ k, v ] of Object.entries(data)) {
    rules.push(`${k}: ${v}`)
  }
  return (
    <Popover content={popoverContent(rules, title)} placement="right">
      <div className={styles.longLabel}>
        <Ellipsis tooltip={false}>{`${title}: ${rules.join(',') || '--'}`}</Ellipsis>
      </div>
    </Popover>
  )
}

const getLeftIcon = type => {
  let icon = CronJobIcon
  if (type === 'StatefulSet') {
    icon = StatefulSetIcon
  }
  if (type === 'Job') {
    icon = JobIcon
  }
  return <img alt="detailHeaderIcon" src={icon} className={styles.leftIcon}/>
}

class DetailHeader extends React.PureComponent {
  render() {
    const { data, dispatch, name, type } = this.props
    if (!data.metadata) return <div/>
    return (
      <div className={classnames({
        [styles.container]: true,
        [styles.cronJob]: type === 'CronJob',
      })}>
        <div className={styles.left}>
          {getLeftIcon(type)}
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
              type === 'Deployment' &&
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
              type === 'Pod' &&
              <React.Fragment>
                <div className={styles.normal}>状态:&nbsp;&nbsp; {
                  nativeStatus(getStatefulSetStatus(data))
                }</div>
                <div className={styles.normal}>重启策略: {
                  getDeepValue(data, 'spec.restartPolicy') || '--'
                }
                </div>
                <div className={styles.normal}>地址: {
                  getDeepValue(data, 'status.podIP') || '--'
                }</div>
                <div className={styles.normal}>创建时间: {
                  moment(getDeepValue(data, 'metadata.creationTimestamp')).format(DEFAULT_TIME_FORMAT)
                }</div>
              </React.Fragment>
            }
            {
              type === 'Job' &&
              <React.Fragment>
                <div className={styles.normal}>重启策略: {
                  getDeepValue(data, 'spec.template.spec.restartPolicy') || '--'
                }</div>
                <div className={styles.normal}>{
                  popoverItem(getDeepValue(data, 'metadata.annotations') || {}, '注释')
                }</div>
                <div className={styles.normal}>{
                  popoverItem(getDeepValue(data, 'metadata.labels'), '标签')
                }</div>
                <div className={styles.normal}>创建时间: {
                  moment(getDeepValue(data, 'metadata.creationTimestamp')).format(DEFAULT_TIME_FORMAT)
                }</div>
              </React.Fragment>
            }
            {
              type === 'CronJob' &&
              <React.Fragment>
                <div className={styles.normal}>正在进行任务数: {
                  getDeepValue(data, 'status.active') ? getDeepValue(data, 'status.active').length : 0
                }</div>
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
              <div className={styles.normal}>{
                popoverItem(getDeepValue(data, 'metadata.annotations') || {}, '注释')
              }</div>
              <div className={styles.normal}>{
                popoverItem(getDeepValue(data, 'metadata.labels'), '标签')
              }</div>
              <div className={styles.normal}>{
                popoverItem(getDeepValue(data, 'spec.selector.matchLabels') || {}, 'pod selector')
              }</div>
              <div className={styles.normal}>{
                popoverItem(getDeepValue(data, 'spec.template.spec.nodeSelector') || {}, 'node selector')
              }</div>
            </React.Fragment>
            }
            {
              type === 'Deployment' &&
              <React.Fragment>
                <div className={styles.normal}>{
                  popoverItem(getDeepValue(data, 'metadata.annotations') || {}, '注释')
                }</div>
                <div className={styles.normal}>{
                  popoverItem(getDeepValue(data, 'metadata.labels'), '标签')
                }</div>
                <div className={styles.normal}>{
                  popoverItem(getDeepValue(data, 'spec.selector.matchLabels') || {}, 'pod selector')
                }</div>
                <div className={styles.normal}>{
                  popoverItem(getDeepValue(data, 'spec.template.spec.nodeSelector') || {}, 'node selector')
                }</div>

              </React.Fragment>
            }
            {
              type === 'Pod' &&
              <React.Fragment>
                <div className={styles.normal}>owner: {
                  (
                    (getDeepValue(data, 'metadata.ownerReferences') || []).map(item => item.name)
                  ).join(',')
                }
                </div>
                <div className={styles.normal}>{
                  popoverItem(getDeepValue(data, 'metadata.annotations') || {}, '注释')
                }</div>
                <div className={styles.normal}>{
                  popoverItem(getDeepValue(data, 'metadata.labels'), '标签')
                }</div>
                <div className={styles.normal}>{
                  popoverItem(getDeepValue(data, 'spec.nodeSelector') || {}, 'node selector')
                }</div>

              </React.Fragment>
            }
            {
              type === 'Job' &&
              <React.Fragment>
                <div className={styles.normal}>运行: {
                  getDeepValue(data, 'status.active') || 0
                }</div>
                <div className={styles.normal}>并行: {getDeepValue(data, 'spec.parallelism') || 0}</div>
                <div className={styles.normal}>完成: {getDeepValue(data, 'status.succeeded') || 0}</div>
                <div className={styles.normal}>失败: {getDeepValue(data, 'status.failed') || 0}</div>
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
        <div className={styles.rightButtons}>
          {
            type === 'Pod' &&
            <Button
              onClick={() => toYamlEditor(dispatch, name, type)}
              className={styles.loginTerminal}>登录终端</Button>
          }
          <Button onClick={() => toYamlEditor(dispatch, name, type)} type="primary"> 编辑 Yaml</Button>
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ nativeDetail: { detailData = {}, name, type } }) => {
  return {
    data: detailData,
    name, type,
  }
}

export default connect(mapStateToProps)(DetailHeader)
