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
import { routerRedux, Link } from 'dva/router'
import { getDeepValue } from '../../../utils/helper'
import moment from 'moment'
import { DEFAULT_TIME_FORMAT } from '../../../utils/constants'
import queryString from 'query-string'
import { getStatus } from '../../../utils/status_identify'
import NativeStatus from '../../../components/NativeStatus'
import classnames from 'classnames'
import Ellipsis from '@tenx-ui/ellipsis'
import CronJobIcon from '../../../assets/img/detailHeaderIcon/CronJob.png'
import JobIcon from '../../../assets/img/detailHeaderIcon/Job.png'
import StatefulSetIcon from '../../../assets/img/detailHeaderIcon/StatefulSet.png'

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
  componentDidMount() {
    if (window.parent.appStackIframeCallBack) {
      this.iframeCallback = window.parent.appStackIframeCallBack
    }
  }
  iframeCb = pathname => {
    this.iframeCallback && this.iframeCallback('redirect', { pathname })
  }
  renderPodOwner = data => {
    const replicaset = ((getDeepValue(data, 'metadata.ownerReferences'.split('.')) || []).map(item => item.name)).join(',')
    const resourceOwner = getDeepValue(data, 'metadata.annotations.createController'.split('.'))
    let type
    let name
    if (resourceOwner && typeof resourceOwner === 'string') {
      const json = JSON.parse(resourceOwner)
      type = json.kind
      name = json.name
    }
    return (
      <span className={styles.upResource}>
        <span>上级资源: &nbsp;</span>
        {type && name && (
          <React.Fragment>
            <Link
              onClick={() => this.iframeCb(`/app-stack/${type}`)}
              to={`/${type}/${name}`}>
              <Ellipsis length={15}>{name}</Ellipsis>
            </Link>
            <span>/</span>
          </React.Fragment>
        )}
        <Ellipsis length={15}>{replicaset}</Ellipsis>
      </span>
    )
  }
  nativeStatus = () => {
    const { data, type } = this.props
    const { phase, availableReplicas, replicas } = getStatus(data, type)
    return <NativeStatus
      status={{ availableReplicas, replicas }}
      phase={phase}
      type={type}
      hidePodInfo
    />
  }
  renderJobActive = data => { // 可能取出 object, 防止页面崩溃
    const act = getDeepValue(data, 'status.active'.split('.')) || 0
    return typeof act === 'object' ? '--' : act
  }
  loginTerminal = async () => {
    const { data } = this.props
    await this.props.dispatch({
      type: 'nativeDetail/updateState',
      payload: {
        dockVisible: false,
        dockContainer: '',
        dockName: '',
      },
    })
    await this.props.dispatch({
      type: 'nativeDetail/updateState',
      payload: {
        dockVisible: true,
        dockContainer: getDeepValue(data, 'spec.containers.0.name'.split('.')),
        dockName: getDeepValue(data, 'metadata.name'.split('.')),
      },
    })
  }
  render() {
    const { data, dispatch, name, type } = this.props
    if (!data.metadata) return <div/>
    return (
      <div className={classnames({
        [styles.container]: true,
        [styles.cronJob]: type === 'CronJob',
      })}>
        {getLeftIcon(type)}
        <div className={styles.left}>
          <div className={styles.name}>
            <Ellipsis length={50}>{getDeepValue(data, 'metadata.name'.split('.')) || '--'}</Ellipsis>
          </div>
          <div className={styles.content}>
            <span className={styles.firstColumn}>
              {
                type === 'StatefulSet' &&
                <React.Fragment>
                  <div className={styles.normal}>状态:&nbsp;&nbsp; {
                    this.nativeStatus()
                  }</div>
                  <div className={styles.normal}>更新策略: {
                    getDeepValue(data, 'spec.updateStrategy.type'.split('.')) === 'RollingUpdate' ? '滚动升级' : '普通升级'
                  }</div>
                  <div className={styles.normal}>最小就绪时间: {
                    getDeepValue(data, 'spec.template.spec.terminationGracePeriodSeconds'.split('.')) || '--'
                  }s</div>
                  <div className={styles.normal}>创建时间: {
                    moment(getDeepValue(data, 'metadata.creationTimestamp'.split('.'))).format(DEFAULT_TIME_FORMAT)
                  }</div>
                </React.Fragment>
              }
              {
                type === 'Deployment' &&
                  <React.Fragment>
                    <div className={styles.normal}>状态:&nbsp;&nbsp; {
                      this.nativeStatus()
                    }</div>
                    <div className={styles.normal}>更新策略: {
                      getDeepValue(data, 'spec.updateStrategy.type'.split('.')) === 'RollingUpdate' ? '滚动升级' : '普通升级'
                    }</div>
                    <div className={styles.normal}>最小就绪时间: {
                      getDeepValue(data, 'spec.template.spec.terminationGracePeriodSeconds'.split('.')) || '--'
                    }s</div>
                    <div className={styles.normal}>创建时间: {
                      moment(getDeepValue(data, 'metadata.creationTimestamp'.split('.'))).format(DEFAULT_TIME_FORMAT)
                    }</div>
                  </React.Fragment>
              }
              {
                type === 'Pod' &&
                  <React.Fragment>
                    <div className={styles.normal}>状态:&nbsp;&nbsp; {
                      this.nativeStatus()
                    }</div>
                    <div className={styles.normal}>重启策略: {
                      getDeepValue(data, 'spec.restartPolicy'.split('.')) || '--'
                    }
                    </div>
                    <div className={styles.normal}>地址: {
                      getDeepValue(data, 'status.podIP'.split('.')) || '--'
                    }</div>
                    <div className={styles.normal}>创建时间: {
                      moment(getDeepValue(data, 'metadata.creationTimestamp'.split('.'))).format(DEFAULT_TIME_FORMAT)
                    }</div>
                  </React.Fragment>
              }
              {
                type === 'Job' &&
                  <React.Fragment>
                    <div className={styles.normal}>重启策略: {
                      getDeepValue(data, 'spec.template.spec.restartPolicy'.split('.')) || '--'
                    }</div>
                    <div className={styles.normal}>{
                      popoverItem(getDeepValue(data, 'metadata.annotations'.split('.')) || {}, '注释')
                    }</div>
                    <div className={styles.normal}>{
                      popoverItem(getDeepValue(data, 'metadata.labels'.split('.')) || {}, '标签')
                    }</div>
                    <div className={styles.normal}>创建时间: {
                      moment(getDeepValue(data, 'metadata.creationTimestamp'.split('.'))).format(DEFAULT_TIME_FORMAT)
                    }</div>
                  </React.Fragment>
              }
              {
                type === 'CronJob' &&
                  <React.Fragment>
                    <div className={styles.normal}>正在进行任务数: {
                      getDeepValue(data, 'status.active'.split('.')) ? getDeepValue(data, 'status.active'.split('.')).length : 0
                    }</div>
                    <div className={styles.normal}>任务成功历史限制数: {
                      getDeepValue(data, 'spec.successfulJobsHistoryLimit'.split('.')) || '--'
                    }</div>
                    <div className={styles.normal}>任务失败历史限制数: {
                      getDeepValue(data, 'spec.failedJobsHistoryLimit'.split('.')) || '--'
                    }</div>
                  </React.Fragment>
              }
              {
                type === 'Service' &&
                  <React.Fragment>
                    <div className={styles.normal}>集群IP: {
                      getDeepValue(data, 'spec.clusterIP'.split('.')) || '--'
                    }</div>
                    <div className={styles.normal}>{
                      popoverItem(getDeepValue(data, 'metadata.annotations'.split('.')) || {}, '注释')
                    }</div>
                    <div className={styles.normal}>标签选择器: {getDeepValue(data, 'spec.schedule'.split('.')) || '--'}</div>
                  </React.Fragment>
              }
            </span>
            <span className={styles.secondColumn}>
              {
                type === 'StatefulSet' &&
                <React.Fragment>
                  <div className={styles.normal}>{
                    popoverItem(getDeepValue(data, 'metadata.annotations'.split('.')) || {}, '注释')
                  }</div>
                  <div className={styles.normal}>{
                    popoverItem(getDeepValue(data, 'metadata.labels'.split('.')) || {}, '标签')
                  }</div>
                  <div className={styles.normal}>{
                    popoverItem(getDeepValue(data, 'spec.selector.matchLabels'.split('.')) || {}, '实例选择器')
                  }</div>
                  <div className={styles.normal}>{
                    popoverItem(getDeepValue(data, 'spec.template.spec.nodeSelector'.split('.')) || {}, '节点选择器')
                  }</div>
                </React.Fragment>
              }
              {
                type === 'Deployment' &&
                <React.Fragment>
                  <div className={styles.normal}>{
                    popoverItem(getDeepValue(data, 'metadata.annotations'.split('.')) || {}, '注释')
                  }</div>
                  <div className={styles.normal}>{
                    popoverItem(getDeepValue(data, 'metadata.labels'.split('.')) || {}, '标签')
                  }</div>
                  <div className={styles.normal}>{
                    popoverItem(getDeepValue(data, 'spec.selector.matchLabels'.split('.')) || {}, '实例选择器')
                  }</div>
                  <div className={styles.normal}>{
                    popoverItem(getDeepValue(data, 'spec.template.spec.nodeSelector'.split('.')) || {}, '节点选择器')
                  }</div>

                </React.Fragment>
              }
              {
                type === 'Pod' &&
                <React.Fragment>
                  <div className={styles.normal}>{ this.renderPodOwner(data) }
                  </div>
                  <div className={styles.normal}>{
                    popoverItem(getDeepValue(data, 'metadata.annotations'.split('.')) || {}, '注释')
                  }</div>
                  <div className={styles.normal}>{
                    popoverItem(getDeepValue(data, 'metadata.labels'.split('.')) || {}, '标签')
                  }</div>
                  <div className={styles.normal}>{
                    popoverItem(getDeepValue(data, 'spec.nodeSelector'.split('.')) || {}, '节点选择器')
                  }</div>

                </React.Fragment>
              }
              {
                type === 'Job' &&
                <React.Fragment>
                  <div className={styles.normal}>运行: {
                    this.renderJobActive(data)
                  }</div>
                  <div className={styles.normal}>并行: {getDeepValue(data, 'spec.parallelism'.split('.')) || 0}</div>
                  <div className={styles.normal}>完成: {getDeepValue(data, 'status.succeeded'.split('.')) || 0}</div>
                  <div className={styles.normal}>失败: {getDeepValue(data, 'status.failed'.split('.')) || 0}</div>
                </React.Fragment>
              }
              {
                type === 'CronJob' &&
                <React.Fragment>
                  <div className={styles.normal}>触发规则: {getDeepValue(data, 'spec.schedule'.split('.')) || '--'}</div>
                  <div className={styles.normal}>创建时间: {
                    moment(getDeepValue(data, 'metadata.creationTimestamp'.split('.'))).format(DEFAULT_TIME_FORMAT)
                  }</div>
                </React.Fragment>
              }
              {
                type === 'Service' &&
                <React.Fragment>
                  <div className={styles.normal}>{
                    popoverItem(getDeepValue(data, 'metadata.labels'.split('.')) || {}, '标签')
                  }
                  </div>
                  <div className={styles.normal}>创建时间: {
                    moment(getDeepValue(data, 'metadata.creationTimestamp'.split('.'))).format(DEFAULT_TIME_FORMAT)
                  }</div>
                </React.Fragment>
              }
            </span>
          </div>
        </div>
        <div className={styles.rightButtons}>
          {
            type === 'Pod' &&
            <Button
              onClick={() => this.loginTerminal()}
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
