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
import { Pagination, Table, Dropdown, Menu, Button } from 'antd'
import Page from '@tenx-ui/page'
import Queue from 'rc-queue-anim'
import { Link } from 'dva/router'
import moment from 'moment'
import Ellipsis from '@tenx-ui/ellipsis'
import { getNativeResourceStatus, getJobStatus } from '../../../utils/status_identify'
import NativeStatus from '../../../components/NativeStatus'

export default class Pods extends React.PureComponent {
  state = {
    current: 1,
    size: 10,
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
  _renderColumn = (history, cron) => {
    const res = [{
      title: cron ? '普通任务名称' : '容器名称',
      width: '15%',
      key: 'name',
      render: data => (
        <Link
          to={cron ? '/Job/3' : `/Pod/${data.metadata.name}`}
          style={{ whiteSpace: 'pre' }}>
          <Ellipsis>{data.metadata.name}</Ellipsis>
        </Link>
      ),
    }, {
      title: '状态',
      width: '10%',
      key: 'status',
      render: data => {
        if (cron) {
          const { phase, availableReplicas, replicas } = getJobStatus(data)
          return <NativeStatus
            status={{ availableReplicas, replicas }}
            phase={phase}
            hidePodInfo
          />
        }
        const { phase, availableReplicas, replicas } = getNativeResourceStatus(data)
        return <NativeStatus phase={phase} status={{ availableReplicas, replicas }} hidePodInfo />
      },
    }]
    ;!cron && res.push({
      title: '镜像',
      width: '20%',
      key: 'image',
      render: data => <Ellipsis length={30}>{this.getImages(data)}</Ellipsis>,
    }, {
      title: '访问地址',
      width: '20%',
      key: 'address',
      render: data => ((data.status && data.status.podIP) ? <Ellipsis>{data.status.podIP}</Ellipsis> : '-'),
    })
    res.push({
      title: '创建时间',
      width: '15%',
      key: 'time',
      render: data => moment(data.metadata.creationTimestamp).fromNow(),
    })
    !cron && res.push({
      title: '操作',
      width: '15%',
      key: 'action',
      render: () => <Dropdown.Button
        trigger={[ 'click' ]}
        overlay={
          <Menu onClick={ () => {}}>
            <Menu.Item key="delete"><div>导出镜像</div></Menu.Item>
            <Menu.Item key="delete"><div>强制删除</div></Menu.Item>
            <Menu.Item key="delete"><div>重新分配</div></Menu.Item>
          </Menu>}
        onClick={() => {}}
      >
        <div>终端</div>
      </Dropdown.Button>,
    })
    cron && res.push({
      title: '操作',
      width: '15%',
      key: 'action',
      render: () => <Button type="primary">
        删除
      </Button>,
    })
    return res
  }
  render() {
    const { data = [], history, cron } = this.props
    const { current, size } = this.state
    return (
      <Page>
        <Queue>
          <div className="layout-content-btns" key="btns">
            {/* <Button type={'primary'} icon={'plus'} >Job</Button>
            <Button icon={'reload'} >刷新</Button>
            <Button>启动</Button>
            <Button>停止</Button>
            <Button >删除</Button>
            <Search
              className="search-style"
              placeholder={'请输入名称搜索'}
            /> */}
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
            columns={this._renderColumn(history, cron)}
            pagination={false}
          />
        </Queue>
      </Page>
    )
  }
}
