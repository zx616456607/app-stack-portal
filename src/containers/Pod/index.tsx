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
import { getPodStatus } from '../../utils/status_identify'
import NativeStatus from '../../components/NativeStatus'
import ImagePopCard from '../../components/ImagePopCard'
import * as modal from '@tenx-ui/modal'
import '@tenx-ui/modal/assets/index.css'
import queryString from 'query-string'
import Ellipsis from '@tenx-ui/ellipsis'
import classnames from 'classnames'
import compact from 'lodash/compact'
import Terminal from '../Detail/Terminal'
import styles from '../Detail/style/index.less';
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
      return <Link to={`/Pod/${name}`}>
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
      const { phase, startTime, restartCountTotal } = status
      return <NativeStatus
        status={{ startTime, restartCountTotal }}
        phase={phase}
        type={'Pod'}
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
    key: 'operation',
    render: (_, record) => {
      return (
        <div className="actionBox commonData" onClick={(e) => e.stopPropagation()}>
        <Dropdown.Button
          disabled={record.status.phase === 'Succeeded'}
          overlay={
            <Menu onClick={e => self.onMenuChange(e.key, _.key, self, record)}>
              <Menu.Item key="yaml"><div>查看/编辑Yaml</div></Menu.Item>
           <Menu.Item key="delete" disabled={record.status.phase === 'Succeeded'}>
            <div>&nbsp;&nbsp;强制删除&nbsp;&nbsp;</div></Menu.Item>
           <Menu.Item key="re" disabled={record.status.phase === 'Succeeded'}>
           <div>&nbsp;&nbsp;重新分配&nbsp;&nbsp;</div></Menu.Item>
            </Menu>}
          type="ghost"
          onClick={async () => {
            self.setState({
              dockName: record.name,
              terminalContainer: record.terminalContainer,
            })
            await self.props.dispatch({
              type: 'nativeDetail/updateState',
              payload: {
                dockVisible: false,
                dockContainer: '',
                dockName: '',
              },
            })
            await self.props.dispatch({
              type: 'nativeDetail/updateState',
              payload: {
                dockVisible: true,
                dockContainer: record.terminalContainer,
                dockName: record.name,
              },
            })
          }}
        >
          终端
        </Dropdown.Button>
      </div>
      )
    },
  }];
  return columns
}

interface PodProps extends RouteComponentProps, SubscriptionAPI {
  cluster: string;
  loading: boolean;
  dockVisible: boolean;
}

interface PodListNode {
  name: string;
  createTime: string;
  status: any;
  imageArray: string[];
}
interface SortedInfo {
  columnKey: string;
  order: string;
}
interface PodState {
  PodListState: PodListNode[];
  selectedRowKeys: Array<string> ;
  filter: string;
  currentPage: number;
  sortedInfo: SortedInfo;
  dockName: string;
  terminalContainer: string;
}
class Pod extends React.Component<PodProps, PodState> {
  state = {
    PodListState: [] as PodListNode[],
    selectedRowKeys: [] as Array<string>,
    filter: '',
    currentPage: 1,
    sortedInfo: {
      columnKey: 'createTime',
      order: 'descend',
    },
    dockName: '',
    terminalContainer: '',
  }
  componentDidMount() {
    this.reload();
  }
  redistributionPod = (name, force) => {
    const text = force ? '强制删除' : '重新分配'
    const self = this
    modal.confirm({
      modalTitle: `${text}操作`,
      title: `您是否确定要${text} ${name}?`,
      async onOk() {
        const { dispatch } = self.props
        const res = await dispatch({
          type: 'NativeResourceList/redistributionPod',
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
        self.reload()
      },
      onCancel() {},
    })
  }
  onMenuChange = async (key, name, self, record) => {
    if (key === 'delete') {
      this.redistributionPod(name, 'true')
    }
    if (key === 're') {
      this.redistributionPod(name)
    }
    if (key === 'yaml') {
      self.props.history.push(`/createWorkLoad?${queryString.stringify(
        { edit: true, type: 'Pod', name: record.name })}`)
    }
  }
  reload = async () => {
    try {
      const payload = { cluster: this.props.cluster , type: 'Pod' }
      const res =
      await this.props.dispatch({ type: 'NativeResourceList/getNativeResourceList', payload })
      const { data = [] } = ( res as any)
      const PodList = data.map((PodNode) => {
        const containerTemplateArray = getDeepValue(PodNode,
          ['spec', 'template', 'spec', 'containers']) || [];
        const containersForD = getDeepValue(PodNode, ['spec', 'containers']) || []
        const containersForS = getDeepValue(PodNode, ['spec', 'initContainers']) || []
        const newContainerTemplateArray =
        [].concat(containerTemplateArray, containersForD, containersForS)
        const imageArray = newContainerTemplateArray.map(({ image }) => image)
        return {
          key: PodNode.metadata.name,
          name: PodNode.metadata.name,
          createTime: PodNode.metadata.creationTimestamp,
          status: getPodStatus(PodNode),
          image: imageArray,
          terminalContainer: getDeepValue(PodNode, 'spec.containers.0.name'.split('.')), // 登录终端用
        }
      }).sort(( a, b ) => { return new Date(b.createTime).valueOf() - new Date(a.createTime).valueOf() })
      this.setState({ PodListState: PodList, currentPage: 1,
        sortedInfo: { columnKey: 'createTime', order: 'descend' } })
      this.setState({ PodListState: PodList })
    } catch (e) {
      notification.warn({ message: '获取Pod列表失败', description: '' })
    }
  }
  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  }
  delete = (name) => {
    const deleteName = this.state.selectedRowKeys.join(',')
    const self = this
    let info = `您是否确定删除这${this.state.selectedRowKeys.length}个 Pod`
    let payload = { cluster: this.props.cluster, type: 'Pod', name: deleteName }
    if (typeof name === 'string') {
      info = `您是否确定删除这1个 Pod`
      payload = { cluster: this.props.cluster, type: 'Pod', name }
    }
    modal.confirm({
      modalTitle: '删除操作',
      title: info,
      content: '',
      onOk() {
        self.props.dispatch({ type: 'NativeResourceList/deleteNativeResourceList', payload })
          .then(() => self.reload())
          .then(() => {
            notification.success({ message: '删除成功', description: '' })
            self.setState({ selectedRowKeys: [] as string[] })
          })
        .catch(() => notification.warn({ message: '删除操作失败', description: '' }))
      },
      onCancel() {},
    })
  }
  start = () => {
    modal.confirm({
      modalTitle: '启动操作',
      title: `您是否确定启动这${this.state.selectedRowKeys.length}个可以启动的 Pod`,
      content: '',
      onOk() {
      },
      onCancel() {},
    })
  }
  stop = () => {
    modal.confirm({
      modalTitle: '停止操作',
      title: `您是否确定停止这${this.state.selectedRowKeys.length}个可以停止的 Pod`,
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
    return this.state.PodListState
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
    const PodListState = this.state.PodListState
    const newPodListState = [...PodListState]
    if (order === 'descend') {
      newPodListState.sort((a, b) => { return new Date(b.createTime).valueOf() - new Date(a.createTime).valueOf() })
    }
    if (order === 'ascend') {
      newPodListState.sort((a, b) => { return new Date(a.createTime).valueOf() - new Date(b.createTime).valueOf() })
    }
    this.setState({ PodListState: newPodListState,
                    currentPage: 1,
                    sortedInfo: newSortedInfo as SortedInfo })
  }
  render() {
    const { history, dockVisible } = this.props
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const self = this
    return (
    <Page>
      <QueueAnim>
        <div className="layout-content-btns" key="btns">
        {/* <Button
          type={'primary'}
          icon="plus"
          onClick={() => history.push('/createWorkLoad?type=Pod')}
        >
          Pod
        </Button> */}
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
          total={this.state.PodListState
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
      {
        dockVisible && <Terminal/>
      }
    </Page>
    )
  }
}

function mapStateToProps(state) {
  const { app: { cluster = '' } = {}, nativeDetail: { dockVisible } } = state
  const { loading: { effects = {} } = {} } = state
  const loading = effects['NativeResourceList/getNativeResourceList']
  return { cluster, loading, dockVisible }
}

export default withRouter(connect(mapStateToProps)(Pod))
