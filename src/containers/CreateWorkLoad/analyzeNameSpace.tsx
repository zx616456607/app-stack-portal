/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * analyzeNameSpace.tsx page
 *
 * @author zhangtao
 * @date Monday December 3rd 2018
 */

import * as React from 'react'
import { Icon } from 'antd'
import styles from './styles/analyzeNameSpace.less'
import * as modal from '@tenx-ui/modal'
import '@tenx-ui/modal/assets/index.css'
import { connect, SubscriptionAPI } from 'dva'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import { analyzeYamlBase, dumpArray } from './tool'
import { yamlString } from './editorType';

interface AnalyzeNameSpaceProps extends SubscriptionAPI {
  fullScreen: boolean
  innerNode: HTMLDivElement
  yamlString: yamlString
  namespace: string
}

class AnalyzeNameSpace extends React.Component<AnalyzeNameSpaceProps, any> {
  showConfirmModal = () => {
    modal.confirm({
      modalTitle: 'namespace  替换',
      title: '是否将 yaml 中的 namespace 替换成当前的 namespace',
      onOk: () => {
        const yamlObj: any[] = analyzeYamlBase(this.props.yamlString) as any[]
        yamlObj.forEach((node) => {
          const metadata = getDeepValue(node, ['metadata']) || {}
          if (metadata.namespace !== undefined) {
            metadata.namespace = this.props.namespace
          }
        })
        const newPayload = { yamlValue: dumpArray(yamlObj) }
        this.props.dispatch({ type: 'createNative/updateYamlValue', payload: newPayload })
        const npayload = { type: 'delete', message: ['analyzeNamespace', ''] }
        this.props.dispatch({ type: 'createNative/patchWarn', payload: npayload })
      },
      onCancel() {},
      getContainer: () => { return this.props.innerNode },
      destroyOnClose: true,
    })
  }
  render() {
    return(
      <div className={styles.AnalyzeNameSpace}>
        <Icon type="exclamation-circle" />
        <span>namespace 与当前项目不符</span>
        <span
          className={styles.changeNameSpace}
          onClick={this.showConfirmModal}
        >
        是否替换成当前的 namespace
        </span>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const yamlStringn = getDeepValue(state, ['createNative', 'yamlValue']) || ''
  const namespace = getDeepValue(state, ['app', 'project'])
  return { yamlString: yamlStringn, namespace }
}
export default connect(mapStateToProps)(AnalyzeNameSpace)
