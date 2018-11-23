/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * TempStackDetail
 *
 * @author zhouhaitao
 * @date 2018-11-23
 */

import React from 'react'
import QueueAnim from 'rc-queue-anim'
import { Card, Form, Input, Collapse, Table } from 'antd'
import styles from './style/index.less'
const FormItem = Form.Item
const { TextArea } = Input
const Panel = Collapse.Panel
const formItemLayout = {
  labelCol: {
    sm: { span: 8, pull: 5 },
  },
  wrapperCol: {
    sm: { span: 16, pull: 5 },
  },
}
const panelStyle = {
  background: '#f7f7f7',
  marginBottom: 24,
  border: 0,
  overflow: 'hidden',
};
class TempStackDetail extends React.Component {
  state = {
    column: [
      {
        title: '参数名称',
        dataIndex: 'name',
      },
      {
        title: '参数类型',
        dataIndex: 'type',
      },
      {
        title: '参数值',
        dataIndex: 'value',
        render: () => {
          return <Input style={{ width: 100 }}/>
        },
      },
      {
        title: '参数描述',
        dataIndex: 'description',
      },
    ],
  }
  render() {
    const mockData = [
      {
        name: 'canshuming',
        type: 'ttgdgfgfd.madsa',
        value: '',
        description: '决赛oh hi反对放得开了几分打算拉框',
      },
    ]
    const { match } = this.props
    const { column } = this.state
    return <QueueAnim
      id="tempStackDetail"
    >
      <Card key="tempStackDetail">
        <Form>
          <div className={styles.stackInfo}>
            <h2>堆栈信息</h2>
            <div className={styles.content}>
              <FormItem
                {...formItemLayout}
                label="使用模板"
              >
                <div>{match.params.name}</div>
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="堆栈名称"
              >
                <Input placeholder="请输入堆栈名称"/>
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="描述"
              >
                <TextArea placeholder=""/>
              </FormItem>
            </div>
          </div>
          <span className={styles.splitLine}></span>
          <div className={styles.config}>
            <h2>参数配置</h2>
            <div className={styles.configContent}>
              <Collapse bordered={false} defaultActiveKey={[ '1' ]}>
                <Panel header="标签" key="1" style={panelStyle}>
                  <Table
                    columns={column}
                    dataSource={mockData}
                    pagination={false}
                  />
                </Panel>
                <Panel header="标签" key="2" style={panelStyle}>
                  <p>{45654654}</p>
                </Panel>
                <Panel header="标签" key="3" style={panelStyle}>
                  <p>{45645312312}</p>
                </Panel>
              </Collapse>
            </div>
          </div>
        </Form>
      </Card>
    </QueueAnim>
  }
}

export default TempStackDetail

