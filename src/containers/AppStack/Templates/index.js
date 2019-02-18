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
import { Card, Button, Menu, Dropdown, Icon, notification, Tooltip, Input, Pagination } from 'antd'
import { connect } from 'dva'
import UnifiedLink from '../../../components/UnifiedLink'
import styles from './style/index.less'
import Loader from '@tenx-ui/loader'
import Ellipsis from '@tenx-ui/ellipsis'
import * as modal from '@tenx-ui/modal'
import { StackTemplate as StackTemplateIcon } from '@tenx-ui/icon'
import { calcuDate, formatDate } from '../../../utils/helper'
import stackTemplate from '../../../assets/img/AppStack/stackTemplate.png'

const Search = Input.Search;

@connect(state => {
  const { appStack, loading } = state
  return { appStack, loading }
})
class Templates extends React.Component {
  state = {
    keyWord: '',
    pSize: 12,
    currentPage: 1,
  }
  componentDidMount() {
    this.loadData()
  }
  componentDidCatch(error, info) {
    console.warn('Templates componentDidCatch', error, info)
  }
  getTemplates = async query => {
    const { dispatch } = this.props
    try {
      await dispatch({
        type: 'appStack/fetchAppStackTemplate',
        payload: { query },
      })
    } catch (e) {
      notification.warn({ message: '获取堆栈模板列表失败', description: '' })
    }
  }
  menu = name => <Menu>
    <Menu.Item onClick={() => { this.delTemplate(name) }
    }>
      <span>删除</span>
    </Menu.Item>
  </Menu>
  delTemplate = name => {
    modal.confirm({
      modalTitle: '删除堆栈模板',
      title: '确认删除该堆栈模板吗？',
      content: '',
      okText: '确认删除',
      onOk: async () => {
        const { dispatch } = this.props
        try {
          const res = await dispatch({
            type: 'appStack/fetchAppStackTemplateDelete',
            payload: { name },
          })
          if (res && res.code === 200) {
            const query = {
              from: 0,
              size: this.state.pSize,
            }
            this.getTemplates(query)
            notification.success({ message: '删除成功' })
          } else {
            notification.warn({ message: '删除失败' })
          }

        } catch (e) {
          notification.warn({ message: '删除失败' })
        }
      },
      onCancel() {
      },
    })
  }
  searchTemplate = keyWord => {
    this.setState({ keyWord })
    const { pSize } = this.state
    const query = {
      from: 0,
      size: pSize,
      filter: `name,${keyWord}`,
    }
    this.getTemplates(query)
  }
  changePage = (page, pageSize) => {
    const query = {
      from: (page - 1) * pageSize,
      size: pageSize,
    }
    this.getTemplates(query)
  }
  loadData = () => {
    const query = {
      from: 0,
      size: this.state.pSize,
    }
    this.getTemplates(query)
  }
  render() {
    const { loading, appStack } = this.props
    const { keyWord, pSize } = this.state
    const templateLoading = loading.effects['appStack/fetchAppStackTemplate']
    const { template } = appStack
    let appStackTemps = []
    let total = 0
    if (template) {
      appStackTemps = template.list
      total = template.total
    }
    return <QueueAnim
      id="stackTemplate"
    >
      <div>
        <div className={styles.templateTop}>
          <div>
            <UnifiedLink to="/app-stack/designer">
              <Button icon="plus" type="primary">设计堆栈</Button>
            </UnifiedLink>
            <Button type="default" icon="reload" key="reload" onClick={this.loadData}>刷新</Button>
            <Search
              placeholder="输入模板名称进行搜索"
              onSearch={value => this.searchTemplate(value)}
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
                  <div className={styles.noData}>
                    <div className={styles.noDataInner}>
                      <img src={stackTemplate} alt=""/>
                      {
                        keyWord ?
                          <p>暂无数据</p>
                          :
                          <p>
                            您还没有堆栈模板，设计一个吧！
                            <UnifiedLink to="/app-stack/designer">
                              <Button type="primary" key="no-data-button">设计堆栈</Button>
                            </UnifiedLink>
                          </p>
                      }
                    </div>
                  </div>
                  :
                  appStackTemps.map(v => <Card hoverable key={v.name} className={styles.listItem}>
                    <div className={styles.itemTag}>堆栈模板</div>
                    <div className={styles.setting}>
                      <Dropdown overlay={this.menu(v.name)}>
                        <span>
                          <Icon type="setting" style={{ fontSize: 18 }}/>
                        </span>
                      </Dropdown>
                    </div>
                    <div className={styles.itemTop}>
                      <div className={styles.itemImg}>
                        <StackTemplateIcon className={styles.stackIcon}/>
                      </div>
                      <div className={styles.itemInfo}>
                        <h2>
                          <Ellipsis lines={1}>
                            {v.name}
                          </Ellipsis>
                        </h2>
                        <div className={styles.description}>
                          <Ellipsis lines={2}>
                            {v.description || '--'}
                          </Ellipsis>
                        </div>
                      </div>
                    </div>
                    <div className={styles.itemBottom}>
                      <div className={styles.updateIcon}>
                        <Tooltip title={`更新于${formatDate(v.last_update_time)}`}>
                          <Icon type="clock-circle" /> {calcuDate(v.last_update_time)}
                        </Tooltip>
                      </div>
                      <div>
                        <UnifiedLink to={`/app-stack/designer/${v.name}/edit`}>
                          <Button style={{ marginRight: 8 }}>设计</Button>
                        </UnifiedLink>
                        <span>
                          <UnifiedLink to={`/app-stack/templates/${v.name}/deploy`}>
                            <Button type="primary">部署</Button>
                          </UnifiedLink>
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
