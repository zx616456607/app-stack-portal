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
import { Card, Button, Menu, Dropdown, Icon, Modal, notification, Tooltip } from 'antd'
import { connect } from 'dva'
import { Link } from 'react-router-dom'
import styles from './style/index.less'
import Loader from '@tenx-ui/loader'
import Ellipsis from '@tenx-ui/ellipsis'
import { StackTemplate as StackTemplateIcon } from '@tenx-ui/icon'
import { calcuDate } from '../../../utils/helper';

@connect(state => {
  const { appStack, loading } = state
  return { appStack, loading }
}, dispatch => ({
  getAppStackTemplate: query => dispatch({
    type: 'appStack/fetchAppStackTemplate',
    payload: { query },
  }),
  deleteAppStackTemplate: name => dispatch({
    type: 'appStack/fetchAppStackTemplateDelete',
    payload: { name },
  }),
}))
class Templates extends React.Component {
  state = {
    delModal: false,
    stackName: '',
  }
  componentDidMount() {
    const { getAppStackTemplate } = this.props
    const query = {
      from: 0,
      size: 0,
    }
    getAppStackTemplate(query)
  }
  menu = name => <Menu>
    <Menu.Item onClick={() => {
      this.setState({
        delModal: true,
        stackName: name,
      })
    }
    }>
      <span>删除</span>
    </Menu.Item>
  </Menu>
  delTemplate = async () => {
    const { deleteAppStackTemplate, getAppStackTemplate } = this.props
    const { stackName } = this.state
    const res = await deleteAppStackTemplate(stackName)
    if (res.code === 200) {
      const query = {
        from: 0,
        size: 0,
      }
      getAppStackTemplate(query)
    } else {
      notification.error({
        message: '删除失败',
      })
    }
    this.setState({
      delModal: false,
    })
  }
  render() {
    const { loading, appStack } = this.props
    const { delModal } = this.state
    const templateLoading = loading.effects['appStack/fetchAppStackTemplate']
    const delLoading = loading.effects['appStack/fetchAppStackTemplateDelete']
    const { templateList } = appStack
    let appStackTemps = []
    if (templateList) appStackTemps = templateList
    return <QueueAnim
      id="stackTemplate"
    >
      <div>
        <Link to="/app-stack/designer">
          <Button icon="plus" type="primary">设计堆栈</Button>
        </Link>
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
                        <Ellipsis lines={2}>
                          {v.description || '--'}
                        </Ellipsis>
                      </div>
                    </div>
                    <div className={styles.itemBottom}>
                      <div className={styles.updateIcon}>
                        <Tooltip title={`更新于${calcuDate(v.create_time)}`}>
                          <Icon type="clock-circle" /> {calcuDate(v.create_time)}
                        </Tooltip>
                      </div>
                      <div>
                        <Link to={`/app-stack/designer/${v.name}/edit`}>
                          <Button style={{ marginRight: 8 }}>设计</Button>
                        </Link>
                        <span>
                          <Link to={`/app-stack/tempStackDetail/${v.name}`}>
                            <Button type="primary">部署</Button>
                          </Link>
                        </span>
                      </div>
                    </div>
                  </Card>)
              }
            </div>
        }
      </div>
      <Modal
        title="删除堆栈模板"
        visible={delModal}
        onCancel={() => this.setState({ delModal: false })}
        onOk={this.delTemplate}
        confirmLoading={delLoading}
      >
        确定删除堆栈模板吗？
      </Modal>
    </QueueAnim>
  }
}

export default Templates
