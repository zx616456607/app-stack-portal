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
import { Controlled as CodeMirror } from 'react-codemirror2'
import styles from './styles/editor.less'
import { Tooltip, Icon, Button } from 'antd'
import 'codemirror/mode/yaml/yaml'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'
import { yamlString,  IInstance, codemirror  } from './editorType'
import fscreen from 'fscreen';
import classnames from 'classnames'
import ExportComposeFile from './exportComposeFile'
import ImportComposeFile from './importComposeFile'
import { SubscriptionAPI } from 'dva'

const editorOpts = {
  lineNumbers: true,
  readOnly: false,
  styleActiveLine: true,
  lineWrapping: true,
  tabSize: 2,
  mode: 'yaml',
  theme: 'base16-dark',
}

interface EditorProps extends SubscriptionAPI {
  onBeforeChange: (editor: IInstance, data: codemirror.EditorChange, value: yamlString) => void;
  value: yamlString;
  createOrEditNative: () => void;
  editflag: boolean;
  setYamlValue: ( yamlValue: yamlString ) => void;
}

interface EditorState {
  fullScreen: boolean
  Exportvisible: boolean;
  Importvisible: boolean;
}
export default class Editor extends React.Component<EditorProps, EditorState> {
  state = {
    fullScreen: false,
    Exportvisible: false,
    Importvisible: false,

  }
  editorNode: HTMLDivElement
  innerNode: HTMLDivElement
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
  }
  render() {
    const eidtorCN = classnames(styles.editor, { [styles.fullScreen]: this.state.fullScreen })
    return (
      <div
        className={eidtorCN}
        ref={editorNode => { this.editorNode = editorNode as HTMLDivElement }}
      >
        <div
          className={styles.editHeader}
          ref={innerNode => { this.innerNode = innerNode as HTMLDivElement }}
        >
        <Tooltip title={'导入编排'}>
          <Icon
            type="plus"
            theme="outlined"
            onClick={() => this.setState({ Importvisible: true })}
            className={styles.editIcon}
          />
          </Tooltip>
          <Tooltip title={'保存为编排文件'}>
          <Icon
            type="save"
            theme="outlined"
            onClick={() => this.setState({ Exportvisible: true })}
            className={styles.editIcon}
          />
          </Tooltip>
          <Tooltip title={this.state.fullScreen ? '退出全屏' : '全屏'}>
          <Icon
            type={this.state.fullScreen ? 'fullscreen-exit' : 'fullscreen'}
            theme="outlined"
            onClick={this.toggleFullScreen}
            className={styles.editIcon}
          />
          </Tooltip>
        </div>
        <CodeMirror
          onBeforeChange={this.props.onBeforeChange}
          options={editorOpts}
          value={this.props.value}
        />
        <div className={styles.operationBar} >
          <div>
            <Button
              className={styles.darkButton}
              onClick={() => history.back()}
            >
              取消
            </Button>
            <Button
              type="primary"
              onClick={this.props.createOrEditNative}
            >
            {
              this.props.editflag ? '保存' : '确定'
            }
            </Button>
          </div>
        </div>
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
