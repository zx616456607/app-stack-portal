/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Stack Events
 *
 * @author zhangpc
 * @date 2018-12-13
 */
import React from 'react'
import styles from './style/index.less'
import { connect } from 'react-redux'
import { notification, Button, Timeline, Row, Col, Collapse } from 'antd'
import TimeHover from '@tenx-ui/time-hover'

const Panel = Collapse.Panel
const customPanelStyle = {
  background: '#f7f7f7',
  borderRadius: 4,
  marginBottom: 24,
  border: 0,
  overflow: 'hidden',
}

@connect(state => {
  const { appStack, loading, app } = state
  const { cluster } = app
  const { appStackEvents = {} } = appStack
  return {
    cluster,
    loading,
    appStackEvents,
  }
})
export default class Events extends React.PureComponent {
  name = this.props.match.params.name

  componentDidMount() {
    this.loadEvents()
  }

  loadEvents = async () => {
    const { dispatch, cluster } = this.props
    try {
      await dispatch({
        type: 'appStack/fetchAppStackEvents',
        payload: { cluster, name: this.name },
      })
    } catch (error) {
      notification.warn({
        message: '获取事件失败',
      })
    }
  }

  render() {
    const { appStackEvents } = this.props
    return <div className={styles.stackEvents}>
      <div className={styles.operation}>
        <Button icon="sync" onClick={this.loadEvents}>刷新</Button>
      </div>
      <Collapse bordered={false} className={styles.events}>
        {
          Object.entries(appStackEvents).map(([ key, events ]) => (
            <Panel header={key} key={key} style={customPanelStyle}>
              <Timeline>
                {
                  events.map(({ reason, message, lastTimestamp }) => (
                    <Timeline.Item key={reason}>
                      <Row>
                        <Col span="4" className={styles.reason}>{reason}</Col>
                        <Col span="16">{message}</Col>
                        <Col span="4"><TimeHover time={lastTimestamp} /></Col>
                      </Row>
                    </Timeline.Item>
                  ))
                }
              </Timeline>
            </Panel>
          ))
        }
      </Collapse>
    </div>
  }
}
