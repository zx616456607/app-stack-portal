/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 *
 *
 * @author Songsz
 * @date 2018-11-06
 *
*/

import React from 'react'
import styles from './style/index.less'
import { Divider } from 'antd'

class Config extends React.PureComponent {
  getDataSource = () => {
    const res = [{
      header: '基本信息',
      content: [{
        title: '名称',
        value: 'dssdsdsd',
      }, {
        title: '镜像',
        value: 'dssdsdsd',
      }, {
        title: '所属节点',
        value: 'dssdsdsd',
      }],
    }, {
      header: '资源配置',
      content: [{
        title: 'CPU',
        value: 'dssdsdsd',
      }, {
        title: '内存',
        value: 'dssdsdsd',
      }, {
        title: '系统盘',
        value: <div>333</div>,
      }],
    }, {
      header: '环境变量',
      content: [{
        title: '变量名',
        value: [ 'DD_NAME', 'XXX_NAME' ],
      }, {
        title: '变量值',
        value: [ '132', 'hello_world' ],
      }],
    }, {
      header: '存储',
      content: [{
        title: '存储类型',
        value: undefined,
      }, {
        title: '存储',
        value: undefined,
      }, {
        title: '容器目录',
        value: '333322',
      }],
    }, {
      header: '服务配置',
      content: [{
        title: '配置组',
        value: undefined,
      }, {
        title: '配置文件',
        value: undefined,
      }, {
        title: '挂载点',
        value: '333322',
      }],
    }]
    return res
  }
  renderContent = content => content.map((cell, i) => (
    <div className={styles.cell} key={i}>
      <div className={styles.title}>{cell.title}</div>
      {
        Array.isArray(cell.value)
          ? cell.value.map((c, j) => (
            <div key={j} className={styles.text}>{c}</div>
          ))
          : <div className={styles.text}>{cell.value}</div>
      }
    </div>
  ))
  render() {
    const data = this.getDataSource()
    return (
      <div className={styles.container}>
        {
          data.map((item, index) => (
            <div className={styles.row} key={index}>
              <div className={styles.header}>
                {item.header}
              </div>
              <div className={styles.content}>
                {this.renderContent(item.content || [])}
              </div>
              <Divider/>
            </div>
          ))
        }
      </div>
    )
  }
}

export default Config
