/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * editor.tsx page
 *
 * @author zhangtao
 * @date Wednesday November 21st 2018
 */
import * as React from 'react'
import styles from './styles/editor.less'
import { Tooltip, Icon, Button, Layout } from 'antd'
import { yamlString } from './editorType'
import fscreen from 'fscreen';
import classnames from 'classnames'
import ExportComposeFile from './exportComposeFile'
import ImportComposeFile from './importComposeFile'
import { SubscriptionAPI } from 'dva'
import TenxEditor from '@tenx-ui/editor'
import '@tenx-ui/editor/assets/index.css'
import { Editor as AceEditor } from 'brace'
import Tool from './tool'

const {  Sider, Content } = Layout
interface EditorProps extends SubscriptionAPI {
  onBeforeChange: (value: yamlString) => void;
  value: yamlString;
  createOrEditNative: () => void;
  editflag: boolean;
  setYamlValue: ( yamlValue: yamlString ) => void;
}

interface EditorState {
  fullScreen: boolean;
  Exportvisible: boolean;
  Importvisible: boolean;
  collapsed: boolean;
}
export default class Editor extends React.Component<EditorProps, EditorState> {
  state = {
    fullScreen: false,
    Exportvisible: false,
    Importvisible: false,
    collapsed: true,
  }
  editorNode: HTMLDivElement
  innerNode: HTMLDivElement
  Ace: AceEditor
  componentDidMount() {
    fscreen.addEventListener('fullscreenchange', this.onfullscreenchange);
  }
  componentWillUnmount() {
    fscreen.removeEventListener('fullscreenchange', this.onfullscreenchange);
  }
  setExportvisible = (value) => this.setState({ Exportvisible: value })
  setImportvisible = (value) => this.setState({ Importvisible: value })
  onfullscreenchange = () => {
    const { fullScreen } = this.state
    this.setState({ fullScreen: !fullScreen })
  }
  toggleFullScreen = () => {
    const { fullScreen } = this.state
    if (!fullScreen) {
      fscreen.requestFullscreen(this.editorNode);
    } else {
      fscreen.exitFullscreen(this.editorNode);
    }
    this.Ace.resize()
  }
  render() {
    const eidtorCN = classnames(styles.editor, { [styles.fullScreen]: this.state.fullScreen })
    return (
      <div
        className={eidtorCN}
        ref={editorNode => { this.editorNode = editorNode as HTMLDivElement }}
      >
        <EditorHeader
          headRef={innerNode => { this.innerNode = innerNode as HTMLDivElement }}
          plusOnclick={() => this.setState({ Importvisible: true })}
          saveOnClick={() => this.setState({ Exportvisible: true })}
          fullScreen={this.state.fullScreen}
          toggleFullScreen={this.toggleFullScreen}
          onSiderClick={() => this.setState({ collapsed: !this.state.collapsed })}
        />
        <Layout
          style={{ height: this.state.fullScreen ? 'calc( 100vh - 30px )' : 'calc( 100vh - 152px )' }}
        >
        <Content>
        <TenxEditor
          titleDisplay={false}
          onChange={this.props.onBeforeChange}
          value={this.props.value}
          onLoad={(ace) => this.Ace = (ace as AceEditor)}
          height={this.state.fullScreen ? 'calc( 100vh - 78px )' : 'calc( 100vh - 200px )'}
        />
        <EditorBottom
          onCancelClick={() => history.back()}
          onSavelick={this.props.createOrEditNative}
          editflag={this.props.editflag}
        />
        </Content>
        <Sider
          collapsed={this.state.collapsed}
          collapsedWidth={0}
          width={300}
          className={styles.sider}
        >
          <Tool aceEditor={this.Ace} value={this.props.value}/>
        </Sider>
        </Layout>
        { this.state.Exportvisible &&
        <ExportComposeFile
            visible={this.state.Exportvisible}
            setVisible={this.setExportvisible}
            dispatch={this.props.dispatch}
            history={this.props.history}
            yamlValue={this.props.value}
            getContainer={() => this.state.fullScreen ? this.innerNode : document.body}
        />
        }{ this.state.Importvisible &&
        <ImportComposeFile
          visible={this.state.Importvisible}
          setVisible={this.setImportvisible}
          dispatch={this.props.dispatch}
          history={this.props.history}
          getContainer={() => this.state.fullScreen ? this.innerNode : document.body}
          setYamlValue={this.props.setYamlValue}
        />}
      </div>
    )
  }
}

interface EditorHeaderProps {
  headRef: (innerNode: HTMLDivElement | null) => void,
  plusOnclick: () => void,
  saveOnClick: () => void,
  fullScreen: boolean,
  toggleFullScreen: () => void,
  onSiderClick: () => void,
}

const EditorHeader = ({
  headRef,
  plusOnclick,
  saveOnClick,
  fullScreen,
  onSiderClick,
  toggleFullScreen,
}: EditorHeaderProps,
) => {
  return (
    <div
      className={styles.editHeader}
      ref={headRef}
    >
      <Tooltip title={'辅助工具'}>
      <Icon
        type="tool"
        theme="outlined"
        onClick={onSiderClick}
        className={styles.editIcon}
      />
      </Tooltip>
      <Tooltip title={'导入编排'}>
      <Icon
        type="plus"
        theme="outlined"
        onClick={plusOnclick}
        className={styles.editIcon}
      />
      </Tooltip>
      <Tooltip title={'保存为编排文件'}>
      <Icon
        type="save"
        theme="outlined"
        onClick={saveOnClick}
        className={styles.editIcon}
      />
      </Tooltip>
      <Tooltip title={fullScreen ? '退出全屏' : '全屏'}>
      <Icon
        type={fullScreen ? 'fullscreen-exit' : 'fullscreen'}
        theme="outlined"
        onClick={toggleFullScreen}
        className={styles.editIcon}
      />
      </Tooltip>
    </div>
  )
}

interface EditorBottomProps {
  onCancelClick: () => void,
  onSavelick: () => void,
  editflag: boolean,
}
const EditorBottom = ({
  onCancelClick,
  onSavelick,
  editflag,
}: EditorBottomProps,
 ) => {
  return (
    <div className={styles.operationBar} >
    <div>
      <Button
        className={styles.darkButton}
        onClick={onCancelClick}
      >
        取消
      </Button>
      <Button
        type="primary"
        onClick={onSavelick}
      >
      {
        editflag ? '保存' : '确定'
      }
      </Button>
    </div>
  </div>
  )
}
