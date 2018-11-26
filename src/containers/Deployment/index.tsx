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
import { getDeploymentStatus } from '../../utils/status_identify'
import NativeStatus from '../../components/NativeStatus'
import ImagePopCard from '../../components/ImagePopCard'
import * as modal from '@tenx-ui/modal'
import '@tenx-ui/modal/assets/index.css'
import queryString from 'query-string'
import Ellipsis from '@tenx-ui/ellipsis'
import styles from './styles/index.less';
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
    render: (name, record) => {
      return <div className={styles.nameWrap}>
      <Link to={`/Deployment/${name}`}>
      <Ellipsis title={name}>
      {name}
    </Ellipsis>
    </Link>
    {
      record.joinTenxPass === true ?
      <div>
        <Tooltip title={'已加入应用管理'}>
        <div className={styles.icon}>
        <div>管</div>
        </div>
        </Tooltip>
      </div> : <div>
        <Tooltip title={'原生创建, 未加入应用管理'}>
        <div className={styles.NativeIcon}>
        <div>原</div>
        </div>
        </Tooltip>
      </div>
    }
    </div>
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
    sorter: () => {},
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
          {/* <Menu.Item key="2" >
            <span onClick={() => self.start(record.name)} >
              <i className="fa fa-trash-o" />启动</span>
          </Menu.Item>
          <Menu.Item key="3" >
            <span onClick={() => self.stop(record.name)} >
              <i className="fa fa-trash-o" />停止</span>
          </Menu.Item> */}
        </Menu>
      );
      return (
        <div className="actionBox commonData">
        <Dropdown.Button
          overlay={dropdown}
          type="ghost"
          onClick={() =>
            history.push(`/createWorkLoad?${queryString.stringify(
              { edit: true, type: 'Deployment', name: record.name })}`)}
        >
          查看/编辑Yaml
        </Dropdown.Button>
      </div>
      )
    },
  }];
  return columns
}

interface DeploymentProps extends RouteComponentProps, SubscriptionAPI {
  cluster: string;
  loading: boolean;
}

interface DeploymentListNode {
  name: string;
  createTime: string;
  status: any;
  imageArray: string[];
}
interface SortedInfo {
  columnKey: string;
  order: string;
}
interface DeploymentState {
  DeploymentListState: DeploymentListNode[];
  selectedRowKeys: Array<string> ;
  filter: string;
  currentPage: number;
  sortedInfo: SortedInfo;
}
class Deployment extends React.Component<DeploymentProps, DeploymentState> {
  state = {
    DeploymentListState: [] as DeploymentListNode[],
    selectedRowKeys: [] as Array<string>,
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
    const filterString = [ 'system/appName', 'system/svcName' ]
    try {
      const payload = { cluster: this.props.cluster , type: 'Deployment' }
      const res =
      await this.props.dispatch({ type: 'NativeResourceList/getNativeResourceList', payload })
      const { data = [] } = ( res as any)
      const DeploymentList = data.map((DeploymentNode) => {
        const containerTemplateArray = getDeepValue(DeploymentNode,
          ['spec', 'template', 'spec', 'containers']) || [];
        const tenxPaas = getDeepValue(DeploymentNode,
          ['metadata', 'labels' ]) || {};
        let joinTenxPass = false
        if (tenxPaas[filterString[0]] !== undefined && tenxPaas[filterString[1]] !== undefined) {
          joinTenxPass = true
        }
        const imageArray = containerTemplateArray.map(({ image }) => image)
        return {
          key: DeploymentNode.metadata.name,
          name: DeploymentNode.metadata.name,
          createTime: DeploymentNode.metadata.creationTimestamp,
          status: getDeploymentStatus(DeploymentNode),
          image: imageArray,
          joinTenxPass,
        }
      }).sort(( a, b ) => { return new Date(b.createTime).valueOf() - new Date(a.createTime).valueOf() })
      this.setState({ DeploymentListState: DeploymentList,
        sortedInfo: { columnKey: 'createTime', order: 'descend' },
      currentPage: 1 })
    } catch (e) {
      notification.warn({ message: '获取Deployment列表失败', description: '' })
    }
  }
  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  }
  delete = (name) => {
    const deleteName = this.state.selectedRowKeys.join(',')
    const self = this
    let info = `您是否确定删除这${this.state.selectedRowKeys.length}个 Deployment`
    let payload = { cluster: this.props.cluster, type: 'Deployment', name: deleteName }
    if (typeof name === 'string') {
      info = `您是否确定删除这1个 Deployment`
      payload = { cluster: this.props.cluster, type: 'Deployment', name }
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
        .catch(() => {
        notification.warn({ message: '删除操作失败', description: '' })})
      },
      onCancel() {},
    })
  }
  start = () => {
    modal.confirm({
      modalTitle: '启动操作',
      title: `您是否确定启动这${this.state.selectedRowKeys.length}个可以启动的 Deployment`,
      content: '',
      onOk() {
      },
      onCancel() {},
    })
  }
  stop = () => {
    modal.confirm({
      modalTitle: '停止操作',
      title: `您是否确定停止这${this.state.selectedRowKeys.length}个可以停止的 Deployment`,
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
    return this.state.DeploymentListState
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
    const DeploymentListState = this.state.DeploymentListState
    const newDeploymentListState = [...DeploymentListState]
    if (order === 'descend') {
      newDeploymentListState.sort((a, b) => {
         return new Date(b.createTime).valueOf() - new Date(a.createTime).valueOf() })
    }
    if (order === 'ascend') {
      newDeploymentListState.sort((a, b) => {
        return new Date(a.createTime).valueOf() - new Date(b.createTime).valueOf() })
    }
    this.setState({ DeploymentListState: newDeploymentListState,
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
          onClick={() => history.push('/createWorkLoad?type=Deployment')}
        >
          Deployment
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
          total={this.state.DeploymentListState
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
            onChange={this.sort}
            className="table-flex"
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

export default withRouter(connect(mapStateToProps)(Deployment))
