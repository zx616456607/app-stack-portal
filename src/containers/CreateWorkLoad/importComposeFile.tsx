/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * importComposeFile.tsx page
 *
 * @author zhangtao
 * @date Tuesday November 20th 2018
 */
import * as React from 'react'
import { Modal, Form, Radio, notification, Select } from 'antd'
import { FormComponentProps } from 'antd/es/form'
import { yamlString } from './editorType'
import { SubscriptionAPI } from 'dva'
import { getDeepValue } from '../../utils/helper';
import debounce from 'lodash/debounce'

const Option = Select.Option
const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
   span: 6,
  },
  wrapperCol: {
    span: 16,
  },
};

interface FileProps extends FormComponentProps, SubscriptionAPI {
  visible: boolean;
  setVisible: (value: boolean) => void;
  setYamlValue: ( yamlValue: yamlString ) => void;
  getContainer: (instance: React.ReactInstance) => HTMLElement;
}
interface FileState {
  loading: boolean;
  optionArray: Array<any>;
  buttonDisables: boolean;
  yamlValue: yamlString;
}

class ImportComposeFile extends React.Component<FileProps, FileState> {
  state = {
    loading: false,
    optionArray: [] as Array<any>,
    buttonDisables: true,
    yamlValue: '',
  }
  size = 10
  onCancel = () => {
    this.props.setVisible(false)
  }
  onOk =  () => {
    this.props.setYamlValue(this.state.yamlValue)
    this.props.setVisible(false)
  }
  handleChange = async (value) => {
    const payload = { id: value  }
    let res
    try {
      res = await this.props.dispatch({ type: 'createNative/loadStackDetail', payload })
    } catch (e) {
      return notification.warn({ message: '加载编排文件详情失败', description: '' })
    }
    const content = getDeepValue(res, [ 'data', 'content' ])
    this.setState({ yamlValue: content, buttonDisables: false })
  }
  componentDidMount() {
    this.reloadOptionArray()
  }
  reloadOptionArray = async (composekind?: string) => {
    composekind = composekind === undefined ?
    this.props.form.getFieldValue('modifier') : composekind
    const filter = composekind === 'private' ? 'owned' : 'public'
    const payload = { from: 0, size: this.size, filter }
    let res
    try {
     res = await this.props.dispatch({ type: 'createNative/loadStackList', payload })
    } catch (e) {
      notification.warn({ message: '加载编排文件失败', description: '' })
    }
    const templates =  getDeepValue(res, ['data', 'templates'])
    const optionArray = templates.map(({ id, name }) => ({ id, name }))
    this.setState({ optionArray })
  }
  onPopupScroll = (e) => {
    this.size = this.size + 50
    this.reloadOptionArray()
  }
  render() {
    const { getFieldDecorator } = this.props.form
    return (
      <Modal
        title="导入编排文件"
        visible={this.props.visible}
        confirmLoading={this.state.loading}
        onCancel={this.onCancel}
        onOk={this.onOk}
        getContainer={this.props.getContainer}
        okButtonProps={{
          disabled: this.state.buttonDisables,
        }}
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
              <Radio.Group
                onChange={(e) => this.reloadOptionArray(e.target.value)}
              >
                <Radio value="private">私有</Radio>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<Radio value="public">公有</Radio>
              </Radio.Group>)}
          </FormItem>
          <FormItem label="选择编排" {...formItemLayout} colon={false}>
            {getFieldDecorator('select', {
              rules: [{ required: true, message: '请选择编排' }],
            })(
            <Select
              showSearch
              onChange={this.handleChange}
              style={{ width: 280 }}
              onPopupScroll={debounce(this.onPopupScroll, 600)}
            >
              {
                this.state.optionArray
                .map(({ id, name }) => <Option value={id} key={id}>{name}</Option>)
              }
            </Select>)}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

export default Form.create()(ImportComposeFile)
