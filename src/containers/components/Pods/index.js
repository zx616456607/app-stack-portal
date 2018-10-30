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

export default class JobList extends React.PureComponent {
  _renderColumn = history => [{
    title: '容器名称',
    width: '20%',
    key: 'name',
    render: () => (
      <Link to={'/Job/3'} style={{ whiteSpace: 'pre' }}>
        test1
      </Link>
    ),
  }, {
    title: '状态',
    width: '10%',
    key: 'status',
    render: () => <div>正在启动</div>,
  }, {
    title: '所属应用',
    width: '15%',
    key: 'belong',
    render: () => <div>hello-world</div>,
  }, {
    title: '镜像',
    width: '15%',
    key: 'image',
    render: () => <div>192.168.1.52/public/hello-wo</div>,
  }, {
    title: '访问地址',
    width: '10%',
    key: 'address',
    render: () => <div>172.31.0.85</div>,
  }, {
    title: '创建时间',
    width: '10%',
    key: 'time',
    render: () => <div>4小时前</div>,
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
              total={0}
              showTotal={_total => `共计${_total}条`}
              pageSize={10}
              defaultCurrent={1}
              current={1}
              size={'small'}
            />
          </div>
          <Table
            rowKey={'id'}
            key={'table'}
            dataSource={[{ id: '1' }]}
            columns={this._renderColumn(history)}
            pagination={false}
          />
        </Queue>
      </Page>
    )
  }
}
