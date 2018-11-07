/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * process table
 *
 * @author Songsz
 * @date 2018-11-06
 *
*/

import React from 'react'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import { notification, Table } from 'antd'
import Queue from 'rc-queue-anim'
import Page from '@tenx-ui/page'
import { getDeepValue } from '../../../utils/helper'

class ProcessContainer extends React.PureComponent {
  async componentDidMount() {
    const { dispatch } = this.props
    const podDetailRes = await dispatch({
      type: 'nativeDetail/fetchPodDetail',
    }).catch(() => notification.warn({ message: '获取Pod详情失败' }))
    if (podDetailRes.data) {
      await dispatch({
        type: 'nativeDetail/fetchProcessList',
        payload: {
          query: {
            container: getDeepValue(podDetailRes.data, 'spec.containers.0.name'),
          },
        },
      }).catch(() => notification.warn({ message: '获取进程失败' }))
    }

  }
  _renderColumn = () => {
    return (
      [{
        title: '镜像',
        width: '20%',
        key: 'name',
        render: () => <div>3333</div>,
      }]
    )
  }
  render() {
    const { history, cron } = this.props
    // const { current, size } = this.state
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
            />
            <Pagination
              total={data.length}
              showTotal={_total => `共计${_total}条`}
              pageSize={size}
              defaultCurrent={1}
              current={current}
              onChange={this.onPageChange}
              size={'small'}
            /> */}
          </div>
          <Table
            rowKey={'name'}
            key={'table'}
            dataSource={[{
              name: '333',
            }]}
            columns={this._renderColumn(history, cron)}
            pagination={false}
          />
        </Queue>
      </Page>
    )
  }
}

const mapStateToProps = ({ nativeDetail: { type, process } }) => {
  return {
    data: process || [],
    cron: type === 'CronJob',
  }
}

export default connect(mapStateToProps)(withRouter(ProcessContainer))
