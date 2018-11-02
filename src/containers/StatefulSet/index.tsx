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
import { getStatefulSetStatus } from '../../utils/status_identify'
import NativeStatus from '../../components/NativeStatus'
import ImagePopCard from '../../components/ImagePopCard'
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
      return <Link to={`/StatefulSet/${name}`}>
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
      const { phase, currentReplicas: availableReplicas, replicas } = status
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
              { edit: true, type: 'StatefulSet', name: record.name })}`)}
        >
          查看/编辑Yaml
        </Dropdown.Button>
      </div>
      )
    },
  }];
  return columns
}

interface StatefulSetProps extends RouteComponentProps, SubscriptionAPI {
  cluster: string;
  loading: boolean;
}

interface StatefulSetListNode {
  name: string;
  createTime: string;
  status: any;
  imageArray: string[];
}
interface StatefulSetState {
  StatefulSetListState: StatefulSetListNode[];
  selectedRowKeys: number[];
  filter: string;
  currentPage: number;
}
class StatefulSet extends React.Component<StatefulSetProps, StatefulSetState> {
  state = {
    StatefulSetListState: [],
    selectedRowKeys: [],
    filter: '',
    currentPage: 1,
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
          key: StatefulSetNode.metadata.name,
          name: StatefulSetNode.metadata.name,
          createTime: StatefulSetNode.metadata.creationTimestamp,
          status: getStatefulSetStatus(StatefulSetNode),
          image: imageArray,
        }
      })
      this.setState({ StatefulSetListState: StatefulSetList })
    } catch (e) {
      notification.error({ message: '获取StatefulSet列表失败', description: '' })
    }
  }
  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  }
  delete = (name) => {
    const self = this
    let info = `您是否确定删除这${this.state.selectedRowKeys.length}个可以删除的 StatefulSet`
    const payload = { cluster: this.props.cluster, type: 'StatefulSet', name }
    if (name) {
      info = `您是否确定删除这1个可以删除的 StatefulSet`
    }
    modal.confirm({
      modalTitle: '删除操作',
      title: info,
      content: '',
      onOk() {
        self.props.dispatch({ type: 'NativeResourceList/deleteNativeResourceList', payload })
          .then(() => self.reload())
          .then(() => notification.success({ message: '删除成功', description: '' }))
        .catch(() => notification.error({ message: '删除操作失败', description: '' }))
      },
      onCancel() {},
    })
  }
  start = () => {
    modal.confirm({
      modalTitle: '启动操作',
      title: `您是否确定启动这${this.state.selectedRowKeys.length}个可以启动的 StatefulSet`,
      content: '',
      onOk() {
      },
      onCancel() {},
    })
  }
  stop = () => {
    modal.confirm({
      modalTitle: '停止操作',
      title: `您是否确定停止这${this.state.selectedRowKeys.length}个可以停止的 StatefulSet`,
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
    return this.state.StatefulSetListState
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
          StatefulSet
        </Button>
        <Button icon="reload" onClick={this.reload} >刷新</Button>
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
          total={this.state.StatefulSetListState.length}
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

export default withRouter(connect(mapStateToProps)(StatefulSet))
