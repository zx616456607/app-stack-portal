/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Templates
 *
 * @author zhouhaitao
 * @date 2018-11-22
 */

import React from 'react'
import QueueAnim from 'rc-queue-anim'
import { Card, Button } from 'antd'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import styles from './style/index.less'
import Loader from '@tenx-ui/loader'
import Ellipsis from '@tenx-ui/ellipsis'
import { Stack as StackIcon } from '@tenx-ui/icon'
@connect(state => {
  const { appStack, loading } = state
  return { appStack, loading }
}, dispatch => ({
  getAppStackTemplate: () => dispatch({
    type: 'appStack/fetchAppStackTemplate',
    payload: {
      from: 0,
      size: 100,
    },
  }),
}))
class Templates extends React.Component {
  componentDidMount() {
    const { getAppStackTemplate } = this.props
    getAppStackTemplate()
  }
  render() {
    const { loading, appStack } = this.props
    const templateLoading = loading.effects['appStack/fetchAppStackTemplate']
    const { templateList } = appStack
    let appStackTemps = []
    if (templateList) appStackTemps = templateList
    return <QueueAnim
      id="stackTemplate"
    >
      <div key="stackTemplate">
        <Button icon="plus" type="primary">设计堆栈</Button>
        {
          templateLoading ?
            <Loader
              spinning={!!templateLoading}
              fullScreen={true}
            />
            :
            <div className={styles.templateList}>
              {
                appStackTemps.length === 0 ?
                  <div className={styles.noData}>暂无数据</div>
                  :
                  appStackTemps.map(v => <Card hoverable key={v.name} className={styles.listItem}>
                    <div className={styles.itemTag}>堆栈模板</div>
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
                        <Button style={{ marginRight: 8 }}>设计</Button>
                        <Link to={`/app-stack/tempStackDetail/${v.name}`}>
                          <Button type="primary">部署</Button>
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

export default Templates
