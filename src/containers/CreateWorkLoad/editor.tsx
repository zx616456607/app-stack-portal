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
import 'brace/mode/yaml'
import 'brace/snippets/yaml'
import 'brace/theme/monokai'
import { Editor as AceEditor } from 'brace'
import Tool from './tool'
import PanelGroup from 'react-panelgroup'
import AnalyzeNameSpace from './analyzeNameSpace'
import { Import as ImportIcon } from '@tenx-ui/icon'
import '@tenx-ui/icon/assets/index.css'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
const {  Sider, Content } = Layout
interface EditorProps extends SubscriptionAPI {
  onBeforeChange: (value: yamlString) => void;
  value: yamlString;
  createOrEditNative: () => void;
  editflag: boolean;
  setYamlValue: ( yamlValue: yamlString ) => void;
  editorWarn: any[];
}

interface EditorState {
  fullScreen: boolean;
  Exportvisible: boolean;
  Importvisible: boolean;
  collapsed: boolean;
  warnWrapHeight: number
}
export default class Editor extends React.Component<EditorProps, EditorState> {
  state = {
    fullScreen: false,
    Exportvisible: false,
    Importvisible: false,
    collapsed: false,
    warnWrapHeight: 120,
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
          onSiderClick={() => {
            this.setState({ collapsed: !this.state.collapsed }, () => this.Ace.resize())
          }}
          onSearchClick={() => { this.Ace.execCommand('find') }}
        />
        <Layout
          style={{ height: this.state.fullScreen ? 'calc( 100vh - 30px )' : 'calc( 100vh - 102px )' }}
        >
        <Content>
        <div
         style={{ height: this.state.fullScreen ? 'calc( 100vh - 78px )' : 'calc( 100vh - 150px )' }}
        >
        <PanelGroup
          direction="column"
          borderColor="#252525"
          panelWidths={[
            { resize: 'stretch' },
            {
              size: this.state.warnWrapHeight,
              minSize: 36,
              resize: 'dynamic',
            },
          ]}
          onUpdate={(res) => {
            const warnWrapHeight = getDeepValue(res, [1, 'size'])
            this.setState({ warnWrapHeight })
            this.Ace.resize()
          }}
        >
        <TenxEditor
          titleDisplay={false}
          onChange={this.props.onBeforeChange}
          value={this.props.value}
          onLoad={(ace) => this.Ace = (ace as AceEditor)}
          fullscreenHeight="100%"
        />
        <div className={styles.warnZoon}>
        <div className={styles.errorInfo}>错误调试窗口</div>
        {
          this.props.editorWarn.map(([key, vale]) => {
            if (key === 'yamlBasegrammar') {
              return <div key={key} className={key}><Icon type="close-circle" />{vale}</div>
            }
            if (key === 'analyzeNamespace') {
              return <AnalyzeNameSpace
                key={key}
                fullScreen={this.state.fullScreen}
                innerNode={this.innerNode}
              />
            }
          })
        }{
          this.props.editorWarn.length === 0 &&
          <div className={styles.noError}>暂未发现错误</div>
        }
        </div>
        </PanelGroup>
        </div>
        <EditorBottom
          onCancelClick={() => history.back()}
          onSavelick={this.props.createOrEditNative}
          editflag={this.props.editflag}
        />
        </Content>
        <Sider
          collapsed={this.state.collapsed}
          collapsedWidth={0}
          width={'30%'}
          className={styles.sider}
        >
          <Tool
            aceEditor={this.Ace}
            value={this.props.value}
            editorNode={this.editorNode}
            collapsed={this.state.collapsed}
          />
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
  onSearchClick: () => void,
}

const EditorHeader = ({
  headRef,
  plusOnclick,
  saveOnClick,
  fullScreen,
  onSiderClick,
  toggleFullScreen,
  onSearchClick,
}: EditorHeaderProps,
) => {
  return (
    <div
      className={styles.editHeader}
      ref={headRef}
    >
      <div className={styles.headTitle}>YAML</div>
      <Tooltip title={'搜索'}>
      <div className={styles.editIcon}  onClick={onSearchClick}>
      <Icon type="search" />
      搜索
      </div>
      </Tooltip>
      <Tooltip title={'导入编排'}>
      <div className={styles.editIcon} onClick={plusOnclick}>
      <ImportIcon
      />
      导入
      </div>
      </Tooltip>
      <Tooltip title={'保存为编排文件'}>
      <div className={styles.editIcon} onClick={saveOnClick}>
      <Icon
        type="save"
        theme="outlined"
      />
      保存
      </div>
      </Tooltip>
      <Tooltip title={'辅助工具'}>
      <div className={styles.editIcon}  onClick={onSiderClick}>
      <Icon
        type="tool"
        theme="outlined"
      />
      工具
      </div>
      </Tooltip>
      <Tooltip title={fullScreen ? '退出全屏' : '全屏'}>
      <div  onClick={toggleFullScreen} className={styles.editIcon}>
      <Icon
        type={fullScreen ? 'shrink' : 'arrows-alt'}
        theme="outlined"
        className={styles.fullEditIcon}
      />
      </div>
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
