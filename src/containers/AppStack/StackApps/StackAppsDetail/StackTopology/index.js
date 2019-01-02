/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Stack Topology
 *
 * @author zhangpc
 * @date 2018-12-12
 */
import React from 'react'
import { connect } from 'dva'
import styles from './style/index.less'
import PaperGraph from '../../../Designer/PaperGraph'

@connect(state => {
  const { appStack } = state
  let { appStacksDetail } = appStack
  if (appStacksDetail) {
    appStacksDetail.templateObj = JSON.parse(appStacksDetail.appStack.spec.content)
  } else {
    appStacksDetail = {}
  }
  return { appStacksDetail }
})
export default class StackTopology extends React.Component {
  state = {
    paperScale: 1,
  }

  render() {
    const { appStacksDetail } = this.props
    return <div className={styles.stackTopology}>
      <PaperGraph
        readOnly={true}
        onLoad={(paper, graph) => {
          graph.fromJSON(appStacksDetail.templateObj._graph)
        }}
      />
    </div>
  }
}
