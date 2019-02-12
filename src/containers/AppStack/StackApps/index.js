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
import { Card, Button, notification, Input, Pagination } from 'antd'
import { Stack as StackIcon } from '@tenx-ui/icon'
import { Circle as CircleIcon } from '@tenx-ui/icon'
import Loader from '@tenx-ui/loader'
import Ellipsis from '@tenx-ui/ellipsis'
import styles from './style/index.less'
import UnifiedLink from '../../../components/UnifiedLink'
import stack from '../../../assets/img/AppStack/stack.png'

const Search = Input.Search;

@connect(state => {
  const { appStack, loading, app } = state
  const { project, cluster } = app
  return { appStack, loading, project, cluster }
})
class StackApps extends React.Component {
  state = {
    pSize: 12,
  }
  componentDidMount() {
    const query = {
      from: 0,
      size: 0,
    }
    this.getAppStackList(query)
  }
  getAppStackList = query => {
    const { dispatch, cluster } = this.props
    try {
      dispatch({
        type: 'appStack/fetchAppStackList',
        payload: {
          cluster,
          query,
        },
      })
    } catch (e) {
      notification.warn({ message: '获取堆栈列表失败', description: '' })
    }
  }
  status = item => {
    let status = {
      text: '未知',
      color: '#ccc',
    }
    const { serviceCount, pending, running, stopped } = item
    if (serviceCount > running && running > 0) {
      status = {
        text: '资源未全部运行',
        color: '#ffbf00',
      }
    }
    if (serviceCount === pending) {
      status = {
        text: '堆栈启动中',
        color: '#2db7f5',
      }
    }
    if (serviceCount === running) {
      status = {
        text: '正常运行',
        color: '#5cb85c',
      }
    }
    if (serviceCount === stopped) {
      status = {
        text: '未启动',
        color: '#f85a5a',
      }
    }
    return status
  }
  changePage = (page, pageSize) => {
    const query = {
      from: (page - 1) * pageSize,
      size: pageSize,
    }
    this.getAppStackList(query)
  }
  searchAppStack = keyWord => {
    this.setState({ keyWord })
    const { pSize } = this.state
    const query = keyWord ? {
      from: 0,
      size: pSize,
      filter: `name contains ${keyWord}`,
    } : {
      from: 0,
      size: pSize,
    }
    this.getAppStackList(query)
  }

  render() {
    const { loading, appStack } = this.props
    const { pSize } = this.state
    const stacksLoading = loading.effects['appStack/fetchAppStackList']
    const { appStacks } = appStack
    let appStackList = []
    let total = 0
    if (appStacks) {
      appStackList = appStacks.list
      total = appStacks.total
    }

    return <QueueAnim
      id="appStack"
    >
      <div className={styles.appStackTop}>
        <div>
          <UnifiedLink to="/app-stack/templates">
            <Button type="primary" icon="plus" key="button">部署堆栈</Button>
          </UnifiedLink>
          <Search
            placeholder="输入模板名称进行搜索"
            onSearch={value => this.searchAppStack(value)}
            style={{ width: 200 }}
          />
        </div>
        <div className={styles.pagination}>
          <span>共计{total}条</span>
          <Pagination
            size="small"
            pageSize={pSize}
            onChange={this.changePage}
            total={total}/>
        </div>
      </div>
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
                  <div className={styles.noData}>
                    <div className={styles.noDataInner}>
                      <img src={stack} alt=""/>
                      <p>
                        您还没有堆栈，部署一个吧！
                        <UnifiedLink to="/app-stack/templates">
                          <Button type="primary" key="no-data-button">部署堆栈</Button>
                        </UnifiedLink>
                      </p>
                    </div>
                  </div>
                  :
                  appStackList.map(v => <Card hoverable key={v.name} className={styles.listItem}>
                    <UnifiedLink to={`/app-stack/appStackDetail/${v.name}`} className={styles.itemTop}>
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
                        <div className={styles.status} style={{ color: this.status(v).color }}>
                          <CircleIcon style={{ marginRight: 4 }}/>
                          {this.status(v).text}
                        </div>
                        <div className={styles.description}>
                          <Ellipsis lines={2}>
                            {v.description || '--'}
                          </Ellipsis>

                        </div>
                      </div>
                    </UnifiedLink>
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

//
export default StackApps
