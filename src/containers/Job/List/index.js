/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * Job List container
 *
 * @author Songsz
 * @date 2018-10-29
 *
*/

import React from 'react'
import { Button, Input, Pagination, Table, Card, Dropdown, Menu } from 'antd'
import Page from '@tenx-ui/page'
import Queue from 'rc-queue-anim'
import { connect } from 'dva'
import { Link } from 'dva/router'

const Search = Input.Search

const mapStateToProps = ({ loading }) => ({ loading })

@connect(mapStateToProps)
export default class JobList extends React.PureComponent {
  _renderColumn = history => [{
    title: '名称',
    width: '20%',
    key: 'name',
    render: () => (
      <Link to={'/Job/3'} style={{ whiteSpace: 'pre' }}>
        test1
      </Link>
    ),
  }, {
    title: '状态',
    width: '20%',
    key: 'status',
    render: () => <div>正在启动</div>,
  }, {
    title: '镜像',
    width: '20%',
    key: 'image',
    render: () => <div>192.168.5.4/new/hello:v1</div>,
  }, {
    title: '创建时间',
    width: '20%',
    key: 'time',
    render: () => <div>2018-01-02</div>,
  }, {
    title: '操作',
    width: '20%',
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
    const { loading } = this.props
    return (
      <Page>
        <Queue>
          <div className="layout-content-btns" key="btns">
            <Button type={'primary'} icon={'plus'} >Job</Button>
            <Button icon={'reload'} >刷新</Button>
            <Button>启动</Button>
            <Button>停止</Button>
            <Button >删除</Button>
            <Search
              className="search-style"
              placeholder={'请输入名称搜索'}
            />
            <Pagination
              total={0}
              showTotal={_total => `共计${_total}条`}
              pageSize={10}
              defaultCurrent={1}
              current={1}
              size={'small'}
            />
          </div>
          <Card key="table">
            <Table
              loading={loading.effects['pipelineList/search']}
              rowKey={'id'}
              dataSource={[{ id: '1' }]}
              columns={this._renderColumn(history)}
              pagination={false}
            />
          </Card>
        </Queue>
      </Page>
    )
  }
}
