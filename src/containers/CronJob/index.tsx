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
import { getCronJobStatue } from '../../utils/status_identify'
import NativeStatus from '../../components/NativeStatus'
import * as modal from '@tenx-ui/modal'
import '@tenx-ui/modal/assets/index.css'
import queryString from 'query-string'
import Ellipsis from '@tenx-ui/ellipsis'
import classnames from 'classnames'
import compact from 'lodash/compact'
// import styles from './styles/index.less'
const Search = Input.Search

function getColumns(self): Array<any> {
  const { history } = self.props
  const sortedInfo = self.state.sortedInfo
  const columns = [{
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    render: (name) => {
      return <Link to={`/CronJob/${name}`}>
      <Ellipsis title={name}>
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
        hidePodInfo
      />
    },
  }, {
    title: '触发规则',
    dataIndex: 'rule',
    key: 'rule',
    render: (rule)　=> <span>{rule}</span>,
  }, {
    title: '正在运行任务数',
    dataIndex: 'podNumber',
    key: 'podNumber',
    render: (podNumber)　=> <span>{podNumber}</span>,
  }, {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    sorter: true,
    sortOrder: sortedInfo.columnKey === 'createTime' && sortedInfo.order,
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
          {/* <Menu.Item key="0" >
            <span ><i className="fa fa-refresh" /> 水平扩展</span>
          </Menu.Item> */}
          <Menu.Item key="1" >
            <span onClick={() => self.delete(record.name)}>
              <i className="fa fa-trash-o" />删除</span>
          </Menu.Item>
          <Menu.Item key="1" >
            <span onClick={() => self.start(record.name)}>
              <i className="fa fa-trash-o" />启动</span>
          </Menu.Item>
          <Menu.Item key="1" >
            <span onClick={() => self.stop(record.name)}>
              <i className="fa fa-trash-o" />停止</span>
          </Menu.Item>
        </Menu>
      );
      return (
        <div className="actionBox commonData" onClick={(e) => e.stopPropagation()}>
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
  cluster: string;
  loading: boolean;
}

interface CronJobListNode {
  name: string;
  createTime: string;
  status: any;
  imageArray: string[];
}
interface SortedInfo {
  columnKey: string;
  order: string;
}
interface CronJobState {
  CronJobListState: CronJobListNode[];
  selectedRowKeys: string[];
  filter: string;
  currentPage: number;
  sortedInfo: SortedInfo;
}
class CronJob extends React.Component<CronJobProps, CronJobState> {
  state = {
    CronJobListState: [] as CronJobListNode[],
    selectedRowKeys: [] as string[],
    filter: '',
    currentPage: 1,
    sortedInfo: {
      columnKey: 'createTime',
      order: 'descend',
    },
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
        // const containerTemplateArray = getDeepValue(CronJobNode,
        //   ['spec', 'template', 'spec', 'containers']) || [];
        // const imageArray = containerTemplateArray.map(({ image }) => image)
        return {
          key: CronJobNode.metadata.name,
          name: CronJobNode.metadata.name,
          createTime: CronJobNode.metadata.creationTimestamp,
          status: getCronJobStatue(CronJobNode),
          rule: CronJobNode.spec.schedule,
          podNumber: (getDeepValue(CronJobNode, [ 'status', 'active' ]) || []).length,
        }
      }).sort(( a, b ) => { return new Date(b.createTime).valueOf() - new Date(a.createTime).valueOf() })
      this.setState({ CronJobListState: CronJobList, currentPage: 1,
        sortedInfo: { columnKey: 'createTime', order: 'descend' } })
    } catch (e) {
      notification.warn({ message: '获取CronJob列表失败', description: '' })
    }
  }
  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  }
  delete = (name) => {
    const deleteName = this.state.selectedRowKeys.join(',')
    const self = this
    let info = `您是否确定删除这${this.state.selectedRowKeys.length}个 CronJob`
    let payload = { cluster: this.props.cluster, type: 'CronJob', name: deleteName }
    if (typeof name === 'string') {
      info = `您是否确定删除这1个 CronJob`
      payload = { cluster: this.props.cluster, type: 'CronJob', name }
    }
    modal.confirm({
      modalTitle: '删除操作',
      title: info,
      content: '',
      onOk() {
        self.props.dispatch({ type: 'NativeResourceList/deleteNativeResourceList', payload })
          .then(() => self.reload())
          .then(() => {
            notification.success({ message: '删除操作成功', description: '' })
            self.setState({ selectedRowKeys: [] as string[] })
          })
        .catch(() => notification.warn({ message: '删除操作失败', description: '' }))
      },
      onCancel() {},
    })
  }
  start = (name) => {
    const self = this
    const options =
    `spec:
      suspend: false`
    const payload = { cluster: this.props.cluster, type: 'CronJob', name, options }
    modal.confirm({
      modalTitle: '启动操作',
      title: `您是否确定启动这1个可以启动的 CronJob`,
      content: '',
      onOk() {
        self.props.dispatch({ type: 'NativeResourceList/operationNativeResource', payload })
          .then(() => self.reload())
          .then(() => notification.success({ message: '启动操作成功', description: '' }))
        .catch(() => notification.warn({ message: '启动操作失败', description: '' }))
      },
      onCancel() {},
    })
  }
  stop = (name) => {
    const self = this
    const options =
    `spec:
      suspend: true`
    const payload = { cluster: this.props.cluster, type: 'CronJob', name, options }
    modal.confirm({
      modalTitle: '停止操作',
      title: `您是否确定停止这1个可以停止的 CronJob`,
      content: '',
      onOk() {
        self.props.dispatch({ type: 'NativeResourceList/operationNativeResource', payload })
          .then(() => self.reload())
          .then(() => notification.success({ message: '停止操作成功', description: '' }))
        .catch(() => notification.error({ message: '停止操作失败', description: '' }))
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
  onRowClick = (record) => {
    const currentRowKeys = [...this.state.selectedRowKeys]
    const index = currentRowKeys.findIndex((keys) => keys === record.name)
    if (index > -1) {
      delete currentRowKeys[index]
      return this.setState({ selectedRowKeys: compact(currentRowKeys) })
    }
    this.setState({ selectedRowKeys: [...currentRowKeys, record.name] })
  }
  sort = (_, __, value) => {
    const { order = 'descend' } = value
    const sortedInfo = this.state.sortedInfo
    const newSortedInfo = { ...sortedInfo }
    newSortedInfo.order = order
    const CronJobListState = this.state.CronJobListState
    const newCronJobListState = [...CronJobListState]
    if (order === 'descend') {
      newCronJobListState.sort((a, b) => { return new Date(b.createTime).valueOf() - new Date(a.createTime).valueOf() })
    }
    if (order === 'ascend') {
      newCronJobListState.sort((a, b) => { return new Date(a.createTime).valueOf() - new Date(b.createTime).valueOf() })
    }
    this.setState({ CronJobListState: newCronJobListState,
                    currentPage: 1,
                    sortedInfo: newSortedInfo as SortedInfo })
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
          onClick={() => history.push(`/createWorkLoad?type=CronJob`)}
        >
          CronJob
        </Button>
        <Button icon="reload" onClick={this.reload} >刷新</Button>
        <Button
          onClick={this.delete}
          disabled={this.state.selectedRowKeys.length === 0}
          icon="delete"
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
          total={this.state.CronJobListState
            .filter(({ name }) => name.includes(this.state.filter))
            .length}
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
            loading={this.props.loading}
            pagination={false}
            dataSource={this.selectData()}
            columns={getColumns(self)}
            rowSelection={rowSelection}
            onRow={(record, index) => {
              return {
                onClick: () => this.onRowClick(record),     // 点击行
              };
            }}
            className="table-flex"
            onChange={this.sort}
          />
        </Card>
      </QueueAnim>
    </Page>
    )
  }
}

function mapStateToProps(state) {
  const { app: { cluster = '' } = {} } = state
  const { loading: { effects = {} } = {} } = state
  const loading = effects['NativeResourceList/getNativeResourceList']
  return { cluster, loading }
}

export default withRouter(connect(mapStateToProps)(CronJob))
