/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * StackApps
 *
 * @author zhouhaitao
 * @date 2018-11-22
 */


import React from 'react'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'dva'
import { Card, Button } from 'antd'
import { Link } from 'react-router-dom'
import { Stack as StackIcon } from '@tenx-ui/icon'
import Loader from '@tenx-ui/loader'
import Ellipsis from '@tenx-ui/ellipsis'
import styles from './style/index.less'

@connect(state => {
  const { appStack, loading, app } = state
  const { project, cluster } = app
  return { appStack, loading, project, cluster }
}, dispatch => ({
  getAppStackList: ({ cluster, query }) => dispatch({
    type: 'appStack/fetchAppStackList',
    payload: {
      cluster,
      query,
    },
  }),
}))
class StackApps extends React.Component {
  state = {}
  componentDidMount() {
    const { getAppStackList, cluster } = this.props
    const query = {
      from: 0,
      size: 0,
    }
    getAppStackList({ cluster, query })
  }
  render() {
    const { loading, appStack } = this.props
    const stacksLoading = loading.effects['appStack/fetchAppStackList']
    const { appStacks } = appStack
    let appStackList = []
    if (appStacks) appStackList = appStacks
    return <QueueAnim
      id="appStack"
    >
      <Link to="app-stack/templates">
        <Button type="primary" icon="plus" key="button">部署堆栈</Button>
      </Link>
      <div className={styles.appStackContent}>
        {
          stacksLoading ?
            <Loader
              spinning={!!appStackList}
              fullScreen={true}
            />
            :
            <div className={styles.templateList}>
              {
                appStackList.length === 0 ?
                  <div className={styles.noData}>暂无数据</div>
                  :
                  appStackList.map(v => <Card hoverable key={v.name} className={styles.listItem}>
                    <Link to={`/app-stack/appStackDetail/${v.name}`} className={styles.itemTop}>
                      <div className={styles.itemImg}>
                        <StackIcon className={styles.stackIcon}/>
                      </div>
                      <div className={styles.itemInfo}>
                        <div className={styles.itemName}>
                          <h2>
                            <Ellipsis lines={1}>
                              {v.name}
                            </Ellipsis>
                          </h2>
                        </div>
                        <div className={styles.description}>
                          <Ellipsis lines={2}>
                            {v.description || '--'}
                          </Ellipsis>

                        </div>
                      </div>
                    </Link>
                    <div className={styles.itemBottom}>
                      <div>
                        <h5>应用</h5>
                        <span className={styles.itemCount}>
                          <Ellipsis>
                            {`${v.appCount}`}
                          </Ellipsis>
                        </span>
                      </div>
                      <div>
                        <h5>服务</h5>
                        <span className={styles.itemCount}>
                          <Ellipsis>
                            {`${v.serviceCount}`}
                          </Ellipsis>
                        </span>
                      </div>
                      <div>
                        <h5>容器</h5>
                        <span className={styles.itemCount}>
                          <Ellipsis>
                            {`${v.containerCount}`}
                          </Ellipsis>
                        </span>
                      </div>
                    </div>
                  </Card>)
              }
            </div>
        }

      </div>
    </QueueAnim>
  }
}

export default StackApps
