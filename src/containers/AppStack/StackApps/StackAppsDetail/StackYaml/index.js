import React from 'react'
import TenxEditor from '@tenx-ui/editor'
import '@tenx-ui/editor/assets/index.css'
import styles from './style/index.less'
export default class StackYaml extends React.PureComponent {
  state = {
    menus: [ '堆栈编排', 'K8s资源编排' ],
    activeTab: '堆栈编排',
    yamlValue: '',
  }
  componentDidMount() {
    this.setState({
      yamlValue: this.props.data.stackYamlContent,
    })
  }
  toggleTab = (currentMenu, i) => {
    const { data } = this.props
    const yamlEditor = document.getElementById('yamlEditor')
    const currentTab = yamlEditor.getElementsByTagName('li')[i]
    this.refs.activeLine.style.left = `${currentTab.offsetLeft}px`
    this.setState({ activeTab: currentMenu })
    if (currentMenu === '堆栈编排') {
      this.setState({
        yamlValue: data.stackYamlContent,
      })
    } else {
      this.setState({
        yamlValue: data.k8sYamlContent,
      })
    }

  }
  render() {
    const { menus, activeTab, yamlValue } = this.state
    const header = () => <ul className={styles.yamlHeader}>
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
      <div style={{ height: 500 }} id="yamlEditor" className={styles.yamlEditor}>
        <TenxEditor
          headerExtraContent={header()}
          value={yamlValue}
          readOnly={true}
        />
      </div>
    )
  }
}
