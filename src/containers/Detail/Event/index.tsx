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
import { notification, Icon } from 'antd'
import styles from './style/index.less'
import classnames from 'classnames'
import Ellipsis from '@tenx-ui/ellipsis'
import moment from 'moment'

interface EventProps extends SubscriptionAPI {
  cluster: string;
  name: string;
  events: any[];
}

class Event extends React.Component<EventProps, {}> {
  async componentDidMount() {
    const { dispatch, name, cluster } = this.props
    const payload = { cluster, name }
    await dispatch({ type: 'nativeDetail/fetchPodEvent', payload })
      .catch(() => notification.warn({ message: '获取事件出错' }))
  }
  renderItem = events => {
    if (!events.length) { return <div>暂无事件</div> }
    return events.map((e, index) => {
      const success = e.type === 'Normal'
      return (
        <div
          key={index}
          className={styles.item}
        >
          <div
            className={classnames(styles.event, {
              [styles.eventError]: !success,
            })}
          >
            <Icon
              className={styles.eventIcon}
              type={success ? 'check-circle' : 'close-circle'}
              theme="filled"
            />
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
      )
    })
  }
  render() {
    const { events } = this.props
    return(
      <div className={styles.container}>
        {
          !!events.length &&
            <React.Fragment>
              <div className={styles.leftLine} />
              <Icon className={styles.leftCheckIcon} type="check-circle" theme="filled" />
            </React.Fragment>
        }
        <div className={styles.right}>
          {
            this.renderItem(events)
          }
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const { app: { cluster = '' } = {} } = state
  const { nativeDetail: { name = '', events = [] } = {} } = state
  return { cluster, name, events }
}
export default connect(mapStateToProps)(Event)
