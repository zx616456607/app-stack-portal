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
import { Button, Input, Card, Table, Menu, Dropdown, Pagination, notification, Tooltip,
 } from 'antd'
import Page from '@tenx-ui/page'
import '@tenx-ui/page/assets/index.css'
import QueueAnim from 'rc-queue-anim'
import { withRouter, RouteComponentProps } from 'dva/router'
import { connect, SubscriptionAPI } from 'dva'
import moment from 'moment'
import {
  formatDate, getDeepValue,
} from '../../utils/helper'
import { getNativeResourceStatus } from '../../utils/status_identify'
import NativeStatus from '../../components/NativeStatus'
import ImagePopCard from '../../components/ImagePopCard'
// import styles from './styles/index.less'
const Search = Input.Search

const columns = [{
  title: '名称',
  dataIndex: 'name',
  key: 'name',
}, {
  title: '状态',
  dataIndex: 'status',
  key: 'status',
  render: (status) => {
    const { phase, availableReplicas, replicas } = status
    return <NativeStatus
      status={{ availableReplicas, replicas }}
      phase={phase}
    />
  },
}, {
  title: '镜像',
  dataIndex: 'image',
  key: 'image',
  render: (image) => {
    return <ImagePopCard addressList={image}/>
  },
}, {
  title: '创建时间',
  dataIndex: 'createTime',
  key: 'createTime',
  render: time => {
  if (!time) { return <div>-</div> }
  return (
    <Tooltip
      title={formatDate(time, undefined)}
    >
      {moment(time).fromNow()}
    </Tooltip>
  )
  },
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

interface StatefulSetProps extends RouteComponentProps, SubscriptionAPI {
  cluster: string
}

interface StatefulSetListNode {
  name: string;
  createTime: string;
  status: any;
  imageArray: string[];
}
interface StatefulSetState {
  StatefulSetListState: StatefulSetListNode[];
}
class StatefulSet extends React.Component<StatefulSetProps, StatefulSetState> {
  state = {
    StatefulSetListState: [],
  }
  componentDidMount() {
    this.reload();
  }
  reload = async () => {
    try {
      const payload = { cluster: this.props.cluster , type: 'StatefulSet' }
      const res =
      await this.props.dispatch({ type: 'NativeResourceList/getNativeResourceList', payload })
      const { data = [] } = ( res as any)
      const StatefulSetList = data.map((StatefulSetNode) => {
        const containerTemplateArray = getDeepValue(StatefulSetNode,
          ['spec', 'template', 'spec', 'containers']) || [];
        const imageArray = containerTemplateArray.map(({ image }) => image)
        return {
          name: StatefulSetNode.metadata.name,
          createTime: StatefulSetNode.metadata.creationTimestamp,
          status: getNativeResourceStatus(StatefulSetNode),
          image: imageArray,
        }
      })
      this.setState({ StatefulSetListState: StatefulSetList })
    } catch (e) {
      notification.error({ message: '获取StatefulSet列表失败', description: '' })
    }
  }
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
        <Button icon="reload" onClick={this.reload} >刷新</Button>
        <Button >启动</Button>
        <Button >停止</Button>
        <Button >删除</Button>
        <Search
          placeholder="搜索"
          onSearch={value => {}}
          style={{ width: 200 }}
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
        <Card key="body">
          <Table
            pagination={false}
            dataSource={this.state.StatefulSetListState}
            columns={columns}
            rowSelection={rowSelection}
          />
        </Card>
      </QueueAnim>
    </Page>
    )
  }
}

function mapStateToProps(state) {
  const { app: { cluster = '' } = {} } = state
  return { cluster }
}

export default withRouter(connect(mapStateToProps)(StatefulSet))
