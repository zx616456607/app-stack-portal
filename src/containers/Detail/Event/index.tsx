/**
 *
 * Job container
 *
 * @author Songsz
 * @date 2018-10-29
 *
*/

import * as React from 'react'
import { connect, SubscriptionAPI } from 'dva'
import { notification, Icon, Timeline } from 'antd'
import styles from './style/index.less'
import classnames from 'classnames'
import Ellipsis from '@tenx-ui/ellipsis'
import moment from 'moment'

interface EventProps extends SubscriptionAPI {
  cluster: string;
  name: string;
  type: string;
  events: any[];
}

class Event extends React.Component<EventProps, {}> {
  async componentDidMount() {
    const { dispatch, name, cluster, type } = this.props
    const payload = { cluster, name }
    if (type === 'Pod')  {
      await dispatch({ type: 'nativeDetail/fetchPodEvent', payload })
        .catch(() => notification.warn({ message: '获取事件出错' }))
      return
    }
    await dispatch({ type: 'nativeDetail/fetchServiceEvent', payload })
      .catch(() => notification.warn({ message: '获取事件出错' }))
  }
  renderDot = success => (
    <Icon
      className={classnames(styles.eventIcon, {
        [styles.successColor]: success,
        [styles.errorColor]: !success,
      })}
      type={success ? 'check-circle' : 'close-circle'}
      theme="filled"
    />
  )
  renderItem = events => {
    if (!events.length) { return <div>暂无事件</div> }
    return events.map((e, index) => {
      const success = e.type === 'Normal'
      return (
        <Timeline.Item key={index} dot={this.renderDot(success)}>
          <div className={styles.row}>
            <div
              key={index}
              className={styles.item}
            >
              <div
                className={classnames(styles.event, {
                  [styles.eventError]: !success,
                })}
              >
                <div className={styles.reason}>
                  <Ellipsis>{e.reason}</Ellipsis>
                </div>
              </div>
              <div className={styles.eventMsg}>
                {e.message}
              </div>
              <div className={styles.eventTime}>
                {moment(e.firstSeen).fromNow()}
              </div>
            </div>
          </div>
        </Timeline.Item>
      )
    })
  }
  render() {
    const { events } = this.props
    return (
      <Timeline>
        {this.renderItem(events)}
      </Timeline>
    )
  }
}

function mapStateToProps(state) {
  const { app: { cluster = '' } = {} } = state
  const { nativeDetail: { name = '', events = [], type } = {} } = state
  return { cluster, name, events, type }
}
export default connect(mapStateToProps)(Event)
