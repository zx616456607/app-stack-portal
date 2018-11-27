/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * StackAppsDetail
 *
 * @author zhouhaitao
 * @date 2018-11-26
 */

import React from 'react'
import { Card, Button, Tabs } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { Stack as StackIcon, Circle as CircleIcon } from '@tenx-ui/icon'
import { connect } from 'dva'
import styles from './style/index.less'
import StackElements from './StackElements'
import StackYaml from './StackYaml'
const Tabpane = Tabs.TabPane

@connect(state => {
  const { appStack, loading, app } = state
  const { cluster } = app
  return { appStack, loading, cluster }

}, dispatch => ({
  getStackDetail: ({ cluster, name }) => dispatch({
    type: 'appStack/fetchAppStackDetail',
    payload: { cluster, name },
  }),
  appStackStart: ({ cluster, name }) => dispatch({
    type: 'appStack/stackStart',
    payload: ({ cluster, name }),
  }),
  appStackStop: ({ cluster, name }) => dispatch({
    type: 'appStack/stackStop',
    payload: ({ cluster, name }),
  }),
  appStackDelete: ({ cluster, name }) => dispatch({
    type: 'appStack/stackDelete',
    payload: ({ cluster, name }),
  }),

}))
class StackAppsDetail extends React.Component {
  componentDidMount() {
    const { getStackDetail, cluster } = this.props
    const name = this.props.match.params.name
    getStackDetail({ cluster, name })
  }
  convertStatus = () => {
    return {
      color: '#5cb85c',
      txt: '正常运行',
    }
  }
  start = () => {

  }
  stop = () => {

  }
  deleteStack = () => {

  }
  render() {
    const name = this.props.match.params.name
    const stackYamlContent = 'kind: Deployment\napiVersion: v1\nmetadata:\n  name: test\n  labels:\n    name: test\n    system/appName: test\n    system/svcName: test\n    system/appstack: test\n  annotations:\n    sidecar.istio.io/inject: \'false\'\nspec:\n  repicas: 1\n  lselector:\n    matchLabels:\n      name: test\n  template:\n    metadata:\n      labels:\n        name: test\n        system/appName: test\n        system/svcName: test\n        system/appstack: test\n      annotations:\n        sidecar.istio.io/inject: \'false\'\n    spec:\n      containers:\n        - name: test\n          image: \'192.168.1.52/public/hello-world:latest\'\n          ports:\n            - containerPort: 80\n              protocol: TCP\n          resources:\n            limits:\n              memory: 512Mi\n              cpu: 1000m\n            requests:\n              memory: 512Mi\n              cpu: 200m\n          args:\n            - /hello\n          imagePullPolicy: Always\n          volumeMounts:\n            - name: noclassify-configmap-classify-configmap-volume-1\n              mountPath: /home/example\n              readOnly: false\n              subPath: example\n      volumes:\n        - name: noclassify-configmap-classify-configmap-volume-1\n          configMap:\n            name: demo\n            items:\n              - key: example\n                path: example\n---\nkind: Service\napiVersion: v1\nmetadata:\n  name: test\n  labels:\n    system/appName: test\n    system/svcName: test\n    system/appstack: test\n    name: test\n  annotations:\n    system/lbgroup: none\nspec:\n  ports:\n    - name: tcp-test-0\n      protocol: TCP\n      targetPort: 80\n      port: 80\n  selector:\n    name: test\n\n---\napiVersion: v1\ndata:\n  example: example\nkind: ConfigMap\nmetadata:\n  name: demo\n  labels:\n    system/appstack: test'
    const k8sYamlContent = 'kind: K8S\napiVersion: v1\nmetadata:\n  name: test\n  labels:\n    name: test\n    system/appName: test\n    system/svcName: test\n    system/appstack: test\n  annotations:\n    sidecar.istio.io/inject: \'false\'\nspec:\n  repicas: 1\n  lselector:\n    matchLabels:\n      name: test\n  template:\n    metadata:\n      labels:\n        name: test\n        system/appName: test\n        system/svcName: test\n        system/appstack: test\n      annotations:\n        sidecar.istio.io/inject: \'false\'\n    spec:\n      containers:\n        - name: test\n          image: \'192.168.1.52/public/hello-world:latest\'\n          ports:\n            - containerPort: 80\n              protocol: TCP\n          resources:\n            limits:\n              memory: 512Mi\n              cpu: 1000m\n            requests:\n              memory: 512Mi\n              cpu: 200m\n          args:\n            - /hello\n          imagePullPolicy: Always\n          volumeMounts:\n            - name: noclassify-configmap-classify-configmap-volume-1\n              mountPath: /home/example\n              readOnly: false\n              subPath: example\n      volumes:\n        - name: noclassify-configmap-classify-configmap-volume-1\n          configMap:\n            name: demo\n            items:\n              - key: example\n                path: example\n---\nkind: Service\napiVersion: v1\nmetadata:\n  name: test\n  labels:\n    system/appName: test\n    system/svcName: test\n    system/appstack: test\n    name: test\n  annotations:\n    system/lbgroup: none\nspec:\n  ports:\n    - name: tcp-test-0\n      protocol: TCP\n      targetPort: 80\n      port: 80\n  selector:\n    name: test\n\n---\napiVersion: v1\ndata:\n  example: example\nkind: ConfigMap\nmetadata:\n  name: demo\n  labels:\n    system/appstack: test'
    const yamlContent = { stackYamlContent, k8sYamlContent }
    return <QueueAnim
      id="stackAppDetail"
    >
      <Card className={styles.detailInfo} hoverable key="header">
        <div className={styles.detailInfoLeft}>
          <div className={styles.detailIcon}>
            <StackIcon/>
          </div>
          <div className={styles.detailName}>
            <h1>{name}</h1>
            <div className={styles.status}>
              状态： <CircleIcon style={{ color: this.convertStatus().color }}/>
              <span style={{ color: this.convertStatus().color }}>{this.convertStatus().txt}</span>
            </div>
          </div>
        </div>
        <div className={styles.detailInfoRight}>
          <Button icon="caret-right" onClick={this.start}>启动</Button>
          <Button onClick={this.stop}><span className={styles.stopIcon} style={{ background: '#666' }}></span>停止</Button>
          <Button onClick={this.deleteStack} icon="delete">删除</Button>
        </div>
      </Card>
      <Card hoverable key="content">
        <Tabs defaultActiveKey="element">
          <Tabpane tab="堆栈元素" key="element">
            <StackElements/>
          </Tabpane>
          <Tabpane tab="YAML" key="YAML">
            <StackYaml
              data={yamlContent}
            />
          </Tabpane>
          <Tabpane tab="堆栈拓补" key="topology">

          </Tabpane>
          <Tabpane tab="事件" key="event">

          </Tabpane>
        </Tabs>
      </Card>
    </QueueAnim>
  }
}

export default StackAppsDetail
