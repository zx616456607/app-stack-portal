/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * exportComposeFile page
 *
 * @author zhangtao
 * @date Tuesday November 20th 2018
 */
import * as React from 'react'
import { Modal, Form, Input, Radio, notification } from 'antd'
import { FormComponentProps } from 'antd/es/form'
import { SubscriptionAPI } from 'dva'
import { appNameCheck } from '../../../src/utils/helper'
const FormItem = Form.Item
const { TextArea } = Input

interface FileProps extends FormComponentProps, SubscriptionAPI {
  visible: boolean;
  setVisible: (value: boolean) => void;
  yamlValue: string;
  getContainer: (instance: React.ReactInstance) => HTMLElement;
}
interface FileState {
  loading: boolean;
}

const formItemLayout = {
  labelCol: {
   span: 6,
  },
  wrapperCol: {
    span: 16,
  },
};

class ExportComposeFile extends React.Component<FileProps, FileState> {
  state = {
    loading: false,
  }
  onCancel = () => {
    this.props.setVisible(false)
  }
  onOk = async () => {
    this.props.form.validateFields(async (errors, values) => {
      if (errors) {
        return
      }
      this.setState({ loading: true })
      const obj = {
        is_public: values.modifier === 'private' ? 2 : 1,
        content: this.props.yamlValue,
        name: values.title,
        description: values.describe,
      }
      try {
        await this.props.dispatch({ type: 'createNative/createStack', payload: { obj } })
      } catch (e) {
        return notification.warn({ message: '创建失败', description: '' })
      }
      notification.success({ message: '创建成功', description: '' })
      this.props.setVisible(false)
      this.setState({ loading: false })
    })
  }
  composeFileNameCheck(rule, value, callback) {
    const errorMsg = appNameCheck(value, '编排名称');
    if (errorMsg === 'success') {
      callback()
    } else {
      callback([new Error(errorMsg)])
    }
  }
  render() {
    const { getFieldDecorator } = this.props.form
    return (
      <Modal
        title="保存为编排文件"
        visible={this.props.visible}
        confirmLoading={this.state.loading}
        onCancel={this.onCancel}
        onOk={this.onOk}
        getContainer={this.props.getContainer}
      >
        <Form >
            <FormItem
              label="编排属性"
              colon={false}
              {...formItemLayout}
            >
              {getFieldDecorator('modifier', {
                initialValue: 'private',
              })(
                <Radio.Group>
                  <Radio value="private">私有</Radio>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<Radio value="public">公有</Radio>
                </Radio.Group>)}
            </FormItem>
            <FormItem label="编排名称" {...formItemLayout} colon={false} hasFeedback>
              {getFieldDecorator('title', {
                rules: [
                  { message: '编排名称' },
                  { validator: this.composeFileNameCheck },
                ],
              })(
                <Input/>)}
            </FormItem>
            <FormItem label="描述信息" {...formItemLayout} colon={false}>
              {getFieldDecorator('describe')(
                <TextArea rows={4}/>)}
            </FormItem>
          </Form>
      </Modal>
    )
  }
}

export default Form.create()(ExportComposeFile)
