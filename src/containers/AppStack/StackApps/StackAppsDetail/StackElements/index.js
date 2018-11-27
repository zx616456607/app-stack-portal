/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * StackElements
 *
 * @author zhouhaitao
 * @date 2018-11-26
 */

import React from 'react'
import { Button, Table, Input, Pagination } from 'antd'
import styles from './style/index.less'
import { connect } from 'react-redux'
import { formatDate } from '../../../../../utils/helper';

const Search = Input.Search
@connect(state => {
  return state
}, null)
class StackElements extends React.Component {
  state = {
    columns: [
      {
        title: '元素类型',
        dataIndex: 'elementType',
      },
      {
        title: '资源名称',
        dataIndex: 'resourceName',
      },
      {
        title: '规格',
        dataIndex: 'standards',
      },
      {
        title: '创建时间',
        dataIndex: 'creationTime',
        render: text => formatDate(text),
      },
    ],
  }
  search = () => {
    // console.log(val);
  }
  render() {
    const { columns } = this.state
    const mockData = [
      {
        elementType: '1',
        resourceName: '测试名称',
        standards: '123',
        creationTime: '2018-11-23T07:33:41Z',
      },
      {
        elementType: '1',
        resourceName: '测试名称',
        standards: '123',
        creationTime: '2018-11-23T07:33:41Z',
      },
      {
        elementType: '1',
        resourceName: '测试名称',
        standards: '123',
        creationTime: '2018-11-23T07:33:41Z',
      },
    ]
    return <div id="stackElements">
      <div className={styles.operation}>
        <div className={styles.operationLeft}>
          <Button icon="sync">刷新</Button>
          <Search onSearch={this.search} style={{ width: 200 }}/>
        </div>
        <div className={styles.operationRight}>
          共计 {3} 条
          <Pagination
            total={20}
            pageSize={10}
            simple
          />
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={mockData}
      />
    </div>
  }
}
export default StackElements
