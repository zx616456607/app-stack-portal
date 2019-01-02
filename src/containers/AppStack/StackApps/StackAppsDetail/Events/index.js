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
import {
  notification, Button, Timeline, Row, Col, Collapse,
  message as antMsg,
} from 'antd'
import TimeHover from '@tenx-ui/time-hover'
import Ellipsis from '@tenx-ui/ellipsis'
import cloneDeep from 'lodash/cloneDeep'

const Panel = Collapse.Panel

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
    this.loadTimmer = setInterval(this.loadEvents, 30000);
  }

  componentWillUnmount() {
    clearInterval(this.loadTimmer)
  }

  loadEvents = async () => {
    const { dispatch, cluster } = this.props
    const clear = antMsg.loading('加载事件中')
    try {
      await dispatch({
        type: 'appStack/fetchAppStackEvents',
        payload: { cluster, name: this.name },
      })
    } catch (error) {
      notification.warn({
        antMsg: '获取事件失败',
      })
    }
    clear()
  }

  render() {
    const { appStackEvents } = this.props
    return <div className={styles.stackEvents}>
      <div className={styles.operation}>
        <Button icon="sync" onClick={this.loadEvents}>刷新</Button>
      </div>
      {
        Object.keys(appStackEvents).length > 0
          ? <Collapse
            bordered={false}
            className={styles.events}
            defaultActiveKey={Object.keys(appStackEvents)}
          >
            {
              Object.entries(appStackEvents).map(([ key, events ]) => (
                <Panel header={key} key={key}>
                  {/* <pre>{JSON.stringify(events)}</pre>
                  <pre>{JSON.stringify(events.reverse())}</pre> */}
                  <Timeline>
                    {
                      cloneDeep(events).reverse().map(({
                        metadata: { uid }, reason, message, firstTimestamp,
                      }) => (
                        <Timeline.Item key={uid}>
                          <Row className={styles.line}>
                            <Col span={4} className={styles.reason}>
                              <Ellipsis>
                                {reason}
                              </Ellipsis>
                            </Col>
                            <Col span={17}>
                              <Ellipsis>
                                {message}
                              </Ellipsis>
                            </Col>
                            <Col span={3} className={styles.time}>
                              <TimeHover time={firstTimestamp} />
                            </Col>
                          </Row>
                        </Timeline.Item>
                      ))
                    }
                  </Timeline>
                </Panel>
              ))
            }
          </Collapse>
          : <i>暂无事件</i>
      }
    </div>
  }
}
