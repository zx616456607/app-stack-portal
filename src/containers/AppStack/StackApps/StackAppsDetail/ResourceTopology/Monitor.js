/**
 *
 * Job container
 *
 * @author Songsz
 * @date 2018-10-29
 *
*/

import React from 'react'
import { connect } from 'dva'
import { Spin } from 'antd'
import cloneDeep from 'lodash/cloneDeep'
import isEmpty from 'lodash/isEmpty'
import Metric from '@tenx-ui/monitorChart'
import '@tenx-ui/monitorChart/assets/index.css'
import {
  METRICS_CPU, METRICS_MEMORY, METRICS_NETWORK_RECEIVED,
  METRICS_NETWORK_TRANSMITTED, METRICS_DISK_READ, METRICS_DISK_WRITE,
  UPDATE_INTERVAL, FRESH_FREQUENCY, REALTIME_INTERVAL,
} from '../../../../../utils/constants'
import styles from './styles/Monitor.less'

const sourceTypeArray = [
  METRICS_CPU, METRICS_MEMORY, METRICS_NETWORK_TRANSMITTED,
  METRICS_NETWORK_RECEIVED, METRICS_DISK_READ, METRICS_DISK_WRITE,
]

const mapStateToProps = ({
  app: { cluster },
  nativeDetail: { monitor, realTimeMonitor },
}) => {
  return {
    cluster,
    monitor,
    realTimeMonitor,
    // type,
    // pods,
  }
}

@connect(mapStateToProps)
class Monitor extends React.PureComponent {
  state = {
    currentValue: '1',
    freshInterval: '1分钟',
    loading: true,
    realTimeLoading: {},
    realTimeChecked: {},
  }

  componentWillUnmount() {
    clearInterval(this.metricsInterval)
    sourceTypeArray.forEach(item => {
      clearInterval(this[`${item}RealTimeInterval`])
    })
    this.props.dispatch({
      type: 'nativeDetail/updateState',
      payload: {
        monitor: {},
      },
    })
  }

  componentDidMount() {
    this.intervalLoadMetrics()
  }

  intervalLoadMetrics = () => {
    clearInterval(this.metricsInterval)
    this.loadInstanceAllMetrics()
    this.metricsInterval = setInterval(() => {
      this.loadInstanceAllMetrics()
    }, UPDATE_INTERVAL)
  }

  loadInstanceAllMetrics = async () => {
    const promiseArray = sourceTypeArray.map(item => this.getInstanceMetricsByType(item))
    this.setState({
      loading: true,
    })
    await Promise.all(promiseArray)
    this.setState({
      loading: false,
    })
  }

  concatPodNames = () => {
    const { pods } = this.props
    if (isEmpty(pods)) {
      return ''
    }
    const name = []
    pods.forEach(pod => {
      name.push(pod.metadata.name)
    })
    return name.join()
  }

  getInstanceMetricsByType = type => {
    const { dispatch, cluster } = this.props
    const { currentValue } = this.state
    const name = this.concatPodNames()
    // if (monitorType === 'Pod') {
    //   const { id } = match.params
    //   name = id
    // }
    if (!name) {
      return
    }
    const query = {
      type,
      ...this.formatTimeRange(currentValue),
    }
    return dispatch({
      type: 'nativeDetail/fetchMonitor',
      payload: {
        cluster,
        name,
        query,
      },
    })
  }

  changeTime = hours => {
    const d = new Date()
    d.setHours(d.getHours() - hours)
    return d.toISOString()
  }

  handleTimeChange = e => {
    const { value } = e.target
    const { freshInterval } = FRESH_FREQUENCY[value]
    this.setState({
      freshInterval,
      currentValue: value,
    }, () => {
      this.intervalLoadMetrics()
    })
  }

  realTimeMonitorFunc = async query => {
    const { dispatch, cluster } = this.props
    const name = this.concatPodNames()
    // if (monitorType === 'Pod') {
    //   const { id } = match.params
    //   name = id
    // }
    if (!name) {
      return
    }
    return dispatch({
      type: 'nativeDetail/fetchRealTimeMonitor',
      payload: {
        cluster,
        name,
        query,
        // type: monitorType,
      },
    })
  }

  formatTimeRange = range => {
    return {
      start: this.changeTime(range),
      end: new Date().toISOString(),
    }
  }

  getNetworkMonitor = async () => {
    const receivedQuery = {
      type: METRICS_NETWORK_RECEIVED,
      ...this.formatTimeRange(1),
    }
    const metricsQuery = {
      type: METRICS_NETWORK_TRANSMITTED,
      ...this.formatTimeRange(1),
    }
    const networkPromiseArray = [
      this.realTimeMonitorFunc(receivedQuery),
      this.realTimeMonitorFunc(metricsQuery),
    ]
    await Promise.all(networkPromiseArray)
  }

  getDiskMonitor = async () => {
    const readQuery = {
      type: METRICS_DISK_READ,
      ...this.formatTimeRange(1),
    }
    const writeQuery = {
      type: METRICS_DISK_WRITE,
      ...this.formatTimeRange(1),
    }
    const diskPromiseArray = [
      this.realTimeMonitorFunc(readQuery),
      this.realTimeMonitorFunc(writeQuery),
    ]
    await Promise.all(diskPromiseArray)
  }

  getMonitor = async type => {
    switch (type) {
      case 'cpu':
        await this.realTimeMonitorFunc({
          type: METRICS_CPU,
          ...this.formatTimeRange(1),
        })
        break
      case 'memory':
        await this.realTimeMonitorFunc({
          type: METRICS_MEMORY,
          ...this.formatTimeRange(1),
        })
        break
      case 'network':
        await this.getNetworkMonitor()
        break
      case 'disk':
        await this.getDiskMonitor()
        break
      default:
        break
    }
    const realTimeLoading = cloneDeep(this.state.realTimeLoading)
    realTimeLoading[type] = false
    this.setState({
      realTimeLoading,
    })
  }

  realTimeMonitor = async type => {
    const realTimeLoading = cloneDeep(this.state.realTimeLoading)
    realTimeLoading[type] = true
    this.setState({
      realTimeLoading,
    })
    clearInterval(this[`${type}RealTimeInterval`])
    await this.getMonitor(type)
    this[`${type}RealTimeInterval`] = setInterval(this.getMonitor.bind(this, type), REALTIME_INTERVAL)
  }

  handleSwitch = async (checked, type) => {
    const realTimeChecked = cloneDeep(this.state.realTimeChecked)
    realTimeChecked[type] = checked
    if (checked) {
      await this.realTimeMonitor(type)
    } else {
      clearInterval(this[`${type}RealTimeInterval`])
    }
    this.setState({
      realTimeChecked,
    })
  }

  render() {
    const { loading, currentValue, freshInterval, realTimeChecked, realTimeLoading } = this.state
    const { monitor, realTimeMonitor } = this.props
    if (loading) {
      return <div className="loading">
        <Spin size={'large'}/>
      </div>
    }
    return (
      <div className={styles.serviceMonitor}>
        {
          isEmpty(monitor) || isEmpty(monitor[METRICS_CPU]) ?
            <div className="empty-text" style={{ textAlign: 'center' }}>暂无数据</div>
            :
            <Metric
              value={currentValue}
              onChange={this.handleTimeChange}
              dataSource={monitor}
              realTimeDataSource={realTimeMonitor}
              handleSwitch={this.handleSwitch}
              {...{ loading, freshInterval, realTimeChecked, realTimeLoading }}
            />
        }
      </div>
    )
  }
}

export default Monitor
