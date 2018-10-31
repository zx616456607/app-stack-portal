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
import { Pagination, Table, Dropdown, Menu } from 'antd'
import Page from '@tenx-ui/page'
import Queue from 'rc-queue-anim'
import { Link } from 'dva/router'
import moment from 'moment'
import Ellipsis from '@tenx-ui/ellipsis'

export default class Pods extends React.PureComponent {
  state = {
    current: 1,
    size: 10,
  }
  getImages(item) {
    const images = []
    item.spec.containers.map(container => images.push(container.image))
    return images.join(', ')
  }
  onPageChange = pageNum => {
    this.setState({
      current: pageNum,
    })
  }
  _renderColumn = history => [{
    title: '容器名称',
    width: '15%',
    key: 'name',
    render: data => (
      <Link to={'/Job/3'} style={{ whiteSpace: 'pre' }}>
        <Ellipsis>{data.metadata.name}</Ellipsis>
      </Link>
    ),
  }, {
    title: '状态',
    width: '10%',
    key: 'status',
    render: data => data.status.phase,
  }, {
    title: '所属应用',
    width: '15%',
    key: 'belong',
    render: () => <div>TODO</div>,
  }, {
    title: '镜像',
    width: '15%',
    key: 'image',
    render: data => this.getImages(data),
  }, {
    title: '访问地址',
    width: '10%',
    key: 'address',
    render: data => (data.status && data.status.podIP) || '-',
  }, {
    title: '创建时间',
    width: '15%',
    key: 'time',
    render: data => moment(data.metadata.creationTimestamp).format('YYYY-MM-DD HH:mm:ss'),
  }, {
    title: '操作',
    width: '15%',
    key: 'action',
    render: () => <Dropdown.Button
      trigger={[ 'click' ]}
      overlay={
        <Menu onClick={ () => {}}>
          <Menu.Item key="delete"><div>删除</div></Menu.Item>
        </Menu>}
      onClick={() => { history.push('/id/2/update') }}
    >
      <div>查看/编辑 YAML</div>
    </Dropdown.Button>,
  }]
  render() {
    const { data = [], history } = this.props
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
            columns={this._renderColumn(history)}
            pagination={false}
          />
        </Queue>
      </Page>
    )
  }
}
