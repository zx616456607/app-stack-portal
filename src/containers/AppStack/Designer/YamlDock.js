/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * AppStackDesigner - yaml dock
 *
 * @author zhangpc
 * @date 2018-12-27
 */

import React from 'react'
import PropTypes from 'prop-types'
import TenxEditor from '@tenx-ui/editor'
import '@tenx-ui/editor/assets/index.css'
import 'brace/mode/yaml'
import 'brace/snippets/yaml'
import 'brace/theme/chrome'
import Dock from 'react-dock'
import {
  Button, Tabs, Tooltip,
} from 'antd'
import styles from './style/YamlDock.less'

const TabPane = Tabs.TabPane
const DOCK_DEFAULT_HEADER_SIZE = 42
const noop = () => {}

export default class YamlDock extends React.PureComponent {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    onVisibleChange: PropTypes.func,
    onTabChange: PropTypes.func,
    value: PropTypes.object,
    onSizeChange: PropTypes.func,
    /**
     * yaml 编辑器输入值改变时的回调函数，注意每次只会返回一个 key
     */
    onYamlChange: PropTypes.func,
  }

  static defaultProps = {
    visible: false,
    onVisibleChange: noop,
    onTabChange: noop,
    onSizeChange: noop,
    onYamlChange: noop,
  }

  static getDerivedStateFromProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      /* const { value } = nextProps
      const stateValue = state.value
      if (value.templateYamlStr === stateValue.templateYamlStr
        && value.inputYamlStr === stateValue.inputYamlStr) {
        return null
      } */
      return {
        value: nextProps.value || {},
      }
    }
    return null
  }

  onYamlChangeTimeout = undefined

  state = {
    dockSize: 340,
    tabKey: 'template',
    value: {},
  }

  componentDidMount() {
    this.props.onSizeChange(this.state.dockSize)
  }

  onTabChange = tabKey => {
    this.setState({ tabKey })
    this.props.onTabChange(tabKey)
  }

  onYamlChange = (yamlStr, type) => {
    // console.log('yamlStr', yamlStr)
    const { value } = this.state
    value[type] = yamlStr
    // this.setState(value)
    this.props.onYamlChange({ [type]: yamlStr })
    /* clearTimeout(this.onYamlChangeTimeout)
    this.onYamlChangeTimeout = setTimeout(() => {
      this.props.onYamlChange({ [type]: yamlStr })
    }, 300) */
  }

  render() {
    const { visible, onVisibleChange, onSizeChange } = this.props
    const { dockSize, tabKey, value: { templateYamlStr, inputYamlStr } } = this.state
    return <Dock
      fluid={false}
      size={dockSize}
      isVisible={visible}
      position="bottom"
      dimMode="none"
      onSizeChange={newDockSize => {
        if (newDockSize < DOCK_DEFAULT_HEADER_SIZE || newDockSize >= window.innerHeight) {
          return
        }
        this.setState({ dockSize: newDockSize }, () => {
          this.yarmlEditor.resize()
          onSizeChange(newDockSize)
        })
      }}
    >
      <div id="yaml-dock" className={styles.yamlEditor}>
        <div className={styles.yamlEditorHeader}>
          <Tabs
            activeKey={tabKey}
            onChange={this.onTabChange}
            tabBarExtraContent={<div className={styles.yamlEditorHeaderBtns}>
              <Tooltip
                title="画布设计仅为辅助作用，您可编辑堆栈内编排字段（如修改默认值等），灵活调整画布视图，并完善编排以确保与画布表示一致"
                placement="topRight"
                getTooltipContainer={() => document.getElementById('yaml-dock')}
                arrowPointAtCenter
              >
                <Button
                  type="dashed"
                  icon="question-circle"
                  // onClick={this.handle}
                  shape="circle"
                />
              </Tooltip>
              <Button
                type="dashed"
                icon="search"
                shape="circle"
                onClick={() => { this.yarmlEditor.execCommand('find') }}
              />
              <Button
                type="dashed"
                icon="minus"
                onClick={() => onVisibleChange(false)}
                shape="circle"
              />
              {/* <Button type="dashed" icon="arrows-alt" /> */}
            </div>}
          >
            <TabPane tab="模版" key="template"></TabPane>
            <TabPane tab="输入" key="input"></TabPane>
            {/* <TabPane tab="输出" key="output"></TabPane> */}
          </Tabs>
        </div>
        {
          // @Todo: undo has bug
          tabKey === 'template' &&
          <TenxEditor
            name="app_stack_template"
            theme="chrome"
            fontSize={12}
            value={templateYamlStr}
            onChange={value => this.onYamlChange(value, 'templateYamlStr')}
            onLoad={editor => {
              this.yarmlEditor = editor
            }}
          />
        }
        {
          tabKey === 'input' &&
          <TenxEditor
            name="app_stack_input"
            theme="chrome"
            fontSize={12}
            value={inputYamlStr}
            onChange={value => this.onYamlChange(value, 'inputYamlStr')}
            onLoad={editor => {
              this.yarmlEditor = editor
            }}
          />
        }
      </div>
    </Dock>
  }
}
