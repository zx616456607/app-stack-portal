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
import { connect } from 'react-redux'
import { Card, Button } from 'antd'
import { Link } from 'react-router-dom'
import { Stack as StackIcon } from '@tenx-ui/icon'
import Loader from '@tenx-ui/loader'
import Ellipsis from '@tenx-ui/ellipsis'
import styles from './style/index.less'

@connect(state => {
  const { appStack, loading } = state
  return { appStack, loading }
}, dispatch => ({
  getAppStackList: () => dispatch({
    type: 'appStack/fetchAppStackList',
  }),
}))
class StackApps extends React.Component {
  state = {}
  componentDidMount() {
    const { getAppStackList } = this.props
    getAppStackList()
  }
  render() {
    const { loading, appStack } = this.props
    const stacksLoading = loading.effects['appStack/fetchAppStackList']
    const { appStacks } = appStack
    let appStackList = []
    if (appStacks) appStackList = appStacks.appStackList
    return <QueueAnim
      id="appStack"
    >
      <Button type="primary" icon="plus" key="button">部署堆栈</Button>
      <div key="appStackContent" className={styles.appStackContent}>
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
                    <div className={styles.itemTop}>
                      <div className={styles.itemImg}>
                        <StackIcon className={styles.stackIcon}/>
                      </div>
                      <div className={styles.itemInfo}>
                        <h2>
                          <Ellipsis>
                            {v.name}
                          </Ellipsis>
                        </h2>
                        <Link to={`/app-stack/tempStackDetail/${v.name}`}>
                          <Button type="primary">管理应用堆栈</Button>
                        </Link>

                      </div>
                    </div>
                    <div className={styles.itemBottom}>
                      <div>
                        <h5>应用</h5>
                        <span>
                        <Ellipsis>
                          {`${v.appCount}`}
                        </Ellipsis>
                      </span>
                      </div>
                      <div>
                        <h5>服务</h5>
                        <span>
                        <Ellipsis>
                          {`${v.serviceCount}`}
                        </Ellipsis>
                      </span>
                      </div>
                      <div>
                        <h5>容器</h5>
                        <span>
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
