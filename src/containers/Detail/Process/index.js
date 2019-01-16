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
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import Ellipsis from '@tenx-ui/ellipsis'
import { Circle as CircleIcon } from '@tenx-ui/icon'
import moment from 'moment'
import { DEFAULT_TIME_FORMAT } from '../../../utils/constants'
import styles from './style/index.less'

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
            container: getDeepValue(podDetailRes.data, 'spec.containers.0.name'.split('.')),
          },
        },
      }).catch(() => notification.warn({ message: '获取进程失败' }))
    }
  }
  renderStatus = text => {
    let status = text
    let IconColor = '#999'
    switch (text) {
      case 'R' :
        status = 'R (运行)'
        IconColor = '#2fba66'
        break
      case 'S' :
        status = 'S (休眠)'
        IconColor = '#4cb3f7'
        break
      case 'D' :
        status = 'D (不可中断)'
        IconColor = '#666'
        break
      case 'Z' :
        status = 'Z (僵死)'
        IconColor = '#fcb25c'
        break
      case 'T' :
        status = 'T (停止或追踪停止)'
        IconColor = '#f85a59'
        break
      case 't' :
        status = 't (追踪停止)'
        IconColor = '#f85a59'
        break
      case 'W' :
        status = 'W (进入内存交换)'
        break
      case 'X' :
        status = 'X (退出)'
        IconColor = '#7272fb'
        break
      case 'x' :
        status = 'x (退出)'
        IconColor = '#7272fb'
        break
      default :
        status = '其他'
        IconColor = '#999'
        break
    }
    return (
      <div><CircleIcon style={{ color: IconColor }}/> {status}</div>
    )
  }
  _renderColumn = () => {
    return (
      [
        {
          title: '用户名',
          dataIndex: 'userName',
          key: 'userName',
          width: '7%',
        },
        {
          title: 'PID',
          dataIndex: 'pid',
          key: 'pid',
          width: '6%',
        },
        {
          title: 'CPU',
          dataIndex: 'cpuPercent',
          key: 'cpuPercent',
          width: '7%',
        },
        {
          title: '虚拟内存',
          dataIndex: 'vmSize',
          key: 'vmSize',
          width: '11%',
        },
        {
          title: '物理内存',
          dataIndex: 'vmRSS',
          key: 'vmRSS',
          width: '11%',
        },
        {
          title: '状态',
          dataIndex: 'status',
          key: 'status',
          render: this.renderStatus,
          width: '13%',
        },
        {
          title: '启动时间',
          dataIndex: 'startTime',
          key: 'startTime',
          width: '140px',
        },
        {
          title: ' CPU 时间',
          dataIndex: 'cpuTime',
          key: 'cpuTime',
          width: '12%',
        },
        {
          title: '命令行',
          dataIndex: 'cmd',
          key: 'cmd',
          width: '18%',
          render: text => <div className={styles.cmd}>
            <Ellipsis>{text}</Ellipsis>
          </div>,
        },
      ]
    )
  }
  bytesToSize = bytes => {
    if (bytes === 0) return '0 KB'
    const k = 1024
    const sizes = [ 'KB', 'MB', 'GB', 'TB' ]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i]
  }
  formatSeconds = time => {
    let h = parseInt(time / 3600)
    if (h < 10) {
      h = '0' + h
    }
    let m = parseInt((time - h * 3600) / 60)
    if (m < 10) {
      m = '0' + m
    }
    let s = parseInt((time - h * 3600) % 60)
    if (s < 10) {
      s = '0' + s
    }
    const length = h + ':' + m + ':' + s
    if (time >= 0) {
      return length
    }
    return '-'

  }
  formatDate = (timestamp, format) => {
    format = format || DEFAULT_TIME_FORMAT
    if (!timestamp || timestamp === '') {
      return moment(new Date()).format(format)
    }
    return moment(timestamp).format(format)

  }
  getDataSource = processList => {
    if (!Array.isArray(processList) || processList.length === 0) {
      return []
    }
    const items = JSON.parse(JSON.stringify(processList))
    items.map(item => {
      item.cpuPercent = item.cpuPercent / 100 + '%'
      item.memPercent = item.memPercent / 100 + '%'
      item.vmSize = this.bytesToSize(item.vmSize)
      item.vmRSS = this.bytesToSize(item.vmRSS)
      item.startTime = this.formatDate(item.startTime)
      item.cpuTime = this.formatSeconds(item.cpuTime)
      return null
    })
    return items
  }
  render() {
    const { data, loading } = this.props
    return (
      <Page>
        <Queue>
          <Table
            rowKey={(item, i) => i}
            key={'table'}
            dataSource={this.getDataSource(data)}
            columns={this._renderColumn()}
            pagination={false}
            loading={loading.effects['nativeDetail/fetchPodDetail']}
          />
        </Queue>
      </Page>
    )
  }
}

const mapStateToProps = ({ nativeDetail: { type, process }, loading }) => {
  return {
    data: process || [],
    cron: type === 'CronJob',
    loading,
  }
}

export default connect(mapStateToProps)(withRouter(ProcessContainer))
