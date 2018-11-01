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
import { withRouter, RouteComponentProps, Link } from 'dva/router'
import { connect, SubscriptionAPI } from 'dva'
import moment from 'moment'
import {
  formatDate, getDeepValue,
} from '../../utils/helper'
import { getNativeResourceStatus } from '../../utils/status_identify'
import NativeStatus from '../../components/NativeStatus'
// import ImagePopCard from '../../components/ImagePopCard'
import * as modal from '@tenx-ui/modal'
import '@tenx-ui/modal/assets/index.css'
import queryString from 'query-string'
import Ellipsis from '@tenx-ui/ellipsis'
// import styles from './styles/index.less'
const Search = Input.Search

function getColumns(self) {
  const { history } = self.props
  const columns = [{
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    render: (name) => {
      return <Link to={`/CronJob/${name}`}>
      <Ellipsis length={8} title={name}>
      {name}
    </Ellipsis>
    </Link>
    },
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
    title: '触发规则',
    dataIndex: 'rule',
    key: 'rule',
  }, {
    title: '正在运行任务数',
    dataIndex: 'podNumber',
    key: 'podNumber',
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
    render: (_, record) => {
      const dropdown = (
        <Menu className="Moreoperations">
          <Menu.Item key="0" >
            <span ><i className="fa fa-refresh" /> 水平扩展</span>
          </Menu.Item>
          <Menu.Item key="1" >
            <span onClick={() => self.delete(record.name)}>
              <i className="fa fa-trash-o" />删除</span>
          </Menu.Item>
        </Menu>
      );
      return (
        <div className="actionBox commonData">
        <Dropdown.Button
          overlay={dropdown}
          type="ghost"
          onClick={() =>
            history.push(`/createWorkLoad?${queryString.stringify(
              { edit: true, type: 'CronJob', name: record.name })}`)}
        >
          查看/编辑Yaml
        </Dropdown.Button>
      </div>
      )
    },
  }];
  return columns
}

interface CronJobProps extends RouteComponentProps, SubscriptionAPI {
  cluster: string
}

interface CronJobListNode {
  name: string;
  createTime: string;
  status: any;
  imageArray: string[];
}
interface CronJobState {
  CronJobListState: CronJobListNode[];
  selectedRowKeys: number[];
  filter: string;
  currentPage: number;
}
class CronJob extends React.Component<CronJobProps, CronJobState> {
  state = {
    CronJobListState: [],
    selectedRowKeys: [],
    filter: '',
    currentPage: 1,
  }
  componentDidMount() {
    this.reload();
  }
  reload = async () => {
    try {
      const payload = { cluster: this.props.cluster , type: 'CronJob' }
      const res =
      await this.props.dispatch({ type: 'NativeResourceList/getNativeResourceList', payload })
      const { data = [] } = ( res as any)
      const CronJobList = data.map((CronJobNode) => {
        const containerTemplateArray = getDeepValue(CronJobNode,
          ['spec', 'template', 'spec', 'containers']) || [];
        const imageArray = containerTemplateArray.map(({ image }) => image)
        return {
          key: CronJobNode.metadata.name,
          name: CronJobNode.metadata.name,
          createTime: CronJobNode.metadata.creationTimestamp,
          status: getNativeResourceStatus(CronJobNode),
          rule: CronJobNode.spec.schedule,
          podNumber: (getDeepValue(CronJobNode, [ 'status', 'active' ]) || []).length,
        }
      })
      this.setState({ CronJobListState: CronJobList })
    } catch (e) {
      notification.error({ message: '获取CronJob列表失败', description: '' })
    }
  }
  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  }
  delete = (name) => {
    const self = this
    let info = `您是否确定删除这${this.state.selectedRowKeys.length}个可以删除的 CronJob`
    const payload = { cluster: this.props.cluster, type: 'CronJob', name }
    if (name) {
      info = `您是否确定删除这1个可以删除的 CronJob`
    }
    modal.confirm({
      modalTitle: '删除操作',
      title: info,
      content: '',
      onOk() {
        self.props.dispatch({ type: 'NativeResourceList/deleteNativeResourceList', payload })
          .then(() => self.reload())
          .then(() => notification.success({ message: '删除成功', description: '' ))
        .catch(() => notification.error({ message: '删除操作失败', description: '' })
      },
      onCancel() {},
    })
  }
  start = () => {
    modal.confirm({
      modalTitle: '启动操作',
      title: `您是否确定启动这${this.state.selectedRowKeys.length}个可以启动的 CronJob`,
      content: '',
      onOk() {
      },
      onCancel() {},
    })
  }
  stop = () => {
    modal.confirm({
      modalTitle: '停止操作',
      title: `您是否确定停止这${this.state.selectedRowKeys.length}个可以停止的 CronJob`,
      content: '',
      onOk() {
      },
      onCancel() {},
    })
  }
  onChange = (page) => {
    this.setState({ currentPage: page })
  }
  selectData = () => {
    return this.state.CronJobListState
    .filter(({ name }) => name.includes(this.state.filter))
    .filter((_, index) =>
    (this.state.currentPage - 1) * 10 <= index &&
    index < (this.state.currentPage) * 10)
  }
  onSelect = (e) => {
    if (this.state.currentPage !== 1) { this.setState({ currentPage: 1 }) }
    this.setState({ filter: e.target.value })
  }
render() {
  const { history } = this.props
  const rowSelection = {
    selectedRowKeys: this.state.selectedRowKeys,
    onChange: this.onSelectChange,
  };
  const self = this
  return (
    <Page>
      <QueueAnim>
        <div className="layout-content-btns" key="btns">
        <Button
          type={'primary'}
          icon="plus"
          onClick={() => history.push('/createWorkLoad')}
        >
          CronJob
        </Button>
        <Button icon="reload" onClick={this.reload} >刷新</Button>
        <Button
          disabled={this.state.selectedRowKeys.length === 0}
          onClick={this.start}
        >
          启动
        </Button>
        <Button
          disabled={this.state.selectedRowKeys.length === 0}
          onClick={this.stop}
        >
          停止
        </Button>
        <Button
          onClick={this.delete}
          disabled={this.state.selectedRowKeys.length === 0}
        >
          删除
        </Button>
        <Search
          placeholder="搜索"
          onSearch={value => {}}
          style={{ width: 200 }}
          onChange={this.onSelect}
        />
        <Pagination
          total={this.state.CronJobListState.length}
          showTotal={_total => `共计${_total}条`}
          pageSize={10}
          // defaultCurrent={t}
          current={this.state.currentPage}
          size={'small'}
          onChange={this.onChange}
        />
        </div>
        <Card key="body">
          <Table
            pagination={false}
            dataSource={this.selectData()}
            columns={getColumns(self)}
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

export default withRouter(connect(mapStateToProps)(CronJob))
