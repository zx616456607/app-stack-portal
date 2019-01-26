import React from 'react'
import { connect } from 'dva'
import TenxEditor from '@tenx-ui/editor'
import '@tenx-ui/editor/assets/index.css'
import styles from './style/index.less'
import 'brace/mode/yaml'
import 'brace/snippets/yaml'
import 'brace/theme/monokai'
import yamlParser from 'js-yaml'
import autoFitFS from '@tenx-ui/utils/lib/autoFitFS'

@autoFitFS(110)
@connect(state => {
  const { appStack } = state
  let { appStacksDetail } = appStack
  if (appStacksDetail) {
    appStacksDetail.templateObj = JSON.parse(appStacksDetail.appStack.spec.content)
    appStacksDetail.templateYaml = yamlParser.safeDump(appStacksDetail.templateObj)
    appStacksDetail.k8sManifest = appStacksDetail.appStack.spec.k8sManifest
  } else {
    appStacksDetail = {}
  }
  return { appStacksDetail }
})
export default class StackYaml extends React.PureComponent {
  state = {
    menus: [ '堆栈编排', 'K8s资源编排' ],
    activeTab: '堆栈编排',
    yamlValue: '',
  }
  componentDidMount() {
    this.setState({
      yamlValue: this.props.appStacksDetail.templateYaml,
    })
  }
  toggleTab = (currentMenu, i) => {
    const { appStacksDetail } = this.props
    const yamlEditor = document.getElementById('yamlEditor')
    const currentTab = yamlEditor.getElementsByTagName('li')[i]
    this.refs.activeLine.style.left = `${currentTab.offsetLeft}px`
    this.setState({ activeTab: currentMenu })
    if (currentMenu === '堆栈编排') {
      this.setState({
        yamlValue: appStacksDetail.templateYaml,
      })
    } else {
      this.setState({
        yamlValue: appStacksDetail.k8sManifest,
      })
    }

  }
  render() {
    const { menus, activeTab, yamlValue } = this.state
    const header = <ul className={styles.yamlHeader}>
      {
        menus.map((v, i) => <li
          key={v}
          className={activeTab === v ? styles.active : ''}
          onClick={() => this.toggleTab(v, i)}
        >
          {v}
        </li>)
      }
      <li ref="activeLine" className={styles.activeLine}></li>
    </ul>
    return (
      <div id="yamlEditor" className={styles.yamlEditor}>
        <TenxEditor
          name="stack-yaml"
          headerExtraContent={header}
          value={yamlValue}
          readOnly={true}
          height={this.props.autoFitFsH}
        />
      </div>
    )
  }
}
