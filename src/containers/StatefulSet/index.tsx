/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * index.tsx page
 *
 * @author zhangtao
 * @date Monday October 29th 2018
 */
/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/
import * as React from 'react'
import { Button, Input, Icon, Card, Table, Menu, Dropdown } from 'antd'
import Page from '@tenx-ui/page'
import '@tenx-ui/page/assets/index.css'
import QueueAnim from 'rc-queue-anim'
import { withRouter, RouteComponentProps } from 'dva/router'
// import styles from './styles/index.less'
const Search = Input.Search

const dataSource = [{
  key: '1',
  name: '胡彦斌',
  status: '运行中',
  includeApp: 'fuck',
  image: 'fuck1',
  createTime: 'fuck-fuck',
}];

const columns = [{
  title: '名称',
  dataIndex: 'name',
  key: 'name',
}, {
  title: '状态',
  dataIndex: 'status',
  key: 'status',
}, {
  title: '所属应用',
  dataIndex: 'includeApp',
  key: 'includeApp',
}, {
  title: '镜像',
  dataIndex: 'image',
  key: 'image',
}, {
  title: '创建时间',
  dataIndex: 'createTime',
  key: 'createTime',
}, {
  title: '操作',
  dataIndex: 'operation',
  key: 'operation',
  render: () => {
    const dropdown = (
      <Menu className="Moreoperations">
        <Menu.Item key="0" >
          <span ><i className="fa fa-refresh" /> 水平扩展</span>
        </Menu.Item>
        <Menu.Item key="1" >
          <span ><i className="fa fa-trash-o" /> 删除</span>
        </Menu.Item>
      </Menu>
    );
    return (
      <div className="actionBox commonData">
      <Dropdown.Button
        overlay={dropdown}
        type="ghost"
      >
        查看/编辑Yaml
      </Dropdown.Button>
    </div>
    )
  },
}];

const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
  getCheckboxProps: record => ({
    disabled: record.name === 'Disabled User', // Column configuration not to be checked
    name: record.name,
  }),
};

interface StatefulSetProps extends RouteComponentProps {

}
class StatefulSet extends React.Component<StatefulSetProps, {}> {
render() {
  const { history } = this.props
  return (
    <Page>
      <QueueAnim>
        <div className="layout-content-btns" key="btns">
        <Button
          type={'primary'}
          icon="plus"
          onClick={() => history.push('/createWorkLoad')}
        >
          StatefulSet
        </Button>
        <Button icon="reload" >刷新</Button>
        <Button >启动</Button>
        <Button >停止</Button>
        <Button >删除</Button>
        <Search
          placeholder="搜索"
          onSearch={value => {}}
          style={{ width: 200 }}
        />
        </div>
        <Card key="body">
          <Table
            pagination={false}
            dataSource={dataSource}
            columns={columns}
            rowSelection={rowSelection}
          />
        </Card>
      </QueueAnim>
    </Page>
    )
  }
}

export default withRouter(StatefulSet)
