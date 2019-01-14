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
import { Pagination, Table, Dropdown, Menu, Button, notification } from 'antd'
import Page from '@tenx-ui/page'
import Queue from 'rc-queue-anim'
import { Link } from 'dva/router'
import moment from 'moment'
import Ellipsis from '@tenx-ui/ellipsis'
import { getStatus } from '../../../utils/status_identify'
import NativeStatus from '../../../components/NativeStatus'
import { confirm } from '@tenx-ui/modal'
import { getDeepValue } from '../../../utils/helper'
import styles from '../../Pod/styles/index.less'
import classnames from 'classnames'

export default class Pods extends React.PureComponent {
  state = {
    current: 1,
    size: 10,
  }
  componentDidMount() {
    if (window.parent.appStackIframeCallBack) {
      this.iframeCallback = window.parent.appStackIframeCallBack
    }
  }
  redistributionPod = (name, force) => {
    const text = force ? '强制删除' : '重新分配'
    const self = this
    confirm({
      modalTitle: `${text}操作`,
      title: `您是否确定要${text} ${name}?`,
      async onOk() {
        const { dispatch, refreshPodList } = self.props
        const res = await dispatch({
          type: 'nativeDetail/redistributionPod',
          payload: {
            body: {
              instances: [ name ],
            },
            force,
          },
        }).catch(() => notification.warn({ message: `${text}失败` }))
        if (res && res.status === 'Success') {
          notification.success({ message: `${text}成功` })
        }
        refreshPodList && refreshPodList()
      },
      onCancel() {},
    })
  }
  onMenuChange = async (key, name) => {
    if (key === 'delete') {
      this.redistributionPod(name, 'true')
    }
    if (key === 're') {
      this.redistributionPod(name)
    }
  }
  onDeleteCronJob = data => {
    const _this = this
    const name = getDeepValue(data, 'metadata.name'.split('.'))
    if (!name) return
    confirm({
      modalTitle: '删除操作',
      title: `您是否确定删除 ${name}`,
      content: '',
      async onOk() {
        const res = await _this.props
          .dispatch({
            type: 'nativeDetail/deleteNativeResourceList',
            payload: {
              cluster: _this.props.cluster,
              type: 'Job',
              name,
            },
          }).catch(() => notification.warn({ message: '删除操作失败', description: '' }))
        if (res && res.status === 'Success') {
          notification.success({ message: '删除成功' })
          _this.props.refreshPodList()
        }
      },
      onCancel() {},
    })
  }
  getImages(item) {
    const images = []
    item.spec.containers && item.spec.containers.map(container => images.push(container.image))
    return images.join(', ')
  }
  onPageChange = pageNum => {
    this.setState({
      current: pageNum,
    })
  }
  _renderColumn = (history, cron, cb) => {
    const res = [{
      title: cron ? '普通任务名称' : '容器名称',
      key: 'name',
      render: data => (
        <Link
          onClick={() => cb(`/app-stack/${cron ? 'Job' : 'Pod'}`)}
          to={`/${cron ? 'Job' : 'Pod'}/${data.metadata.name}`}
          style={{ whiteSpace: 'pre' }}>
          <Ellipsis>{data.metadata.name}</Ellipsis>
        </Link>
      ),
    }, {
      title: '状态',
      key: 'status',
      render: data => {
        const { phase, availableReplicas, replicas } = getStatus(data, cron ? 'Job' : 'Pod')
        return <NativeStatus type={'Pod'} phase={phase} status={{ availableReplicas, replicas }} hidePodInfo />
      },
    }]
    ;!cron && res.push({
      title: '镜像',
      key: 'image',
      render: data => <Ellipsis length={30}>{this.getImages(data)}</Ellipsis>,
    }, {
      title: '访问地址',
      key: 'address',
      render: data => ((data.status && data.status.podIP) ? <Ellipsis>{data.status.podIP}</Ellipsis> : '-'),
    })
    res.push({
      title: '创建时间',
      key: 'time',
      render: data => moment(data.metadata.creationTimestamp).fromNow(),
    })
    !cron && res.push({
      title: '操作',
      key: 'action',
      render: data => {
        const { phase } = getStatus(data, cron ? 'Job' : 'Pod')
        return (
          <div className={classnames({
            actionBox: true,
            commonData: true,
            [styles.DropdownDisbale]: phase === 'Succeeded',
          })} onClick={e => e.stopPropagation()}>
            <Dropdown.Button
              trigger={[ 'click' ]}
              overlay={
                <Menu onClick={ e => this.onMenuChange(e.key, data.metadata.name)}>
                  <Menu.Item key="delete"><div>&nbsp;&nbsp;强制删除&nbsp;&nbsp;</div></Menu.Item>
                  <Menu.Item key="re" disabled={phase === 'Succeeded'}><div>&nbsp;&nbsp;重新分配&nbsp;&nbsp;</div></Menu.Item>
                </Menu>}
              onClick={async () => {
                if (phase === 'Succeeded') return
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
              }}
            >
              <div>终端</div>
            </Dropdown.Button>
          </div>
        )
      },
    })
    cron && res.push({
      title: '操作',
      width: '15%',
      key: 'action',
      render: data => <Button type="primary" onClick={() => this.onDeleteCronJob(data)}>
        删除
      </Button>,
    })
    return res
  }
  iframeCb = pathname => {
    this.iframeCallback && this.iframeCallback('redirect', { pathname })
  }
  render() {
    const { data = [], history, cron, refreshPodList, loading } = this.props
    const { current, size } = this.state
    return (
      <Page>
        <Queue>
          <div className="layout-content-btns" key="btns">
            <Button type="primary" icon="reload" onClick={refreshPodList}>刷新</Button>
            <Pagination
              total={data.length}
              showTotal={_total => `共计${_total}条`}
              pageSize={size}
              defaultCurrent={1}
              current={current}
              onChange={this.onPageChange}
              size={'small'}
            />
          </div>
          <Table
            rowKey={item => item.metadata.name}
            key={'table'}
            dataSource={data.filter(
              (item, index) => index < (current * size) && index >= ((current - 1) * size)
            )}
            columns={this._renderColumn(history, cron, this.iframeCb)}
            pagination={false}
            loading={loading.effects['nativeDetail/fetchPodsList']}
            className="table-flex"
          />
        </Queue>
      </Page>
    )
  }
}
