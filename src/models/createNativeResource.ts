/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * createNativeCluster.ts page
 *
 * @author zhangtao
 * @date Tuesday October 30th 2018
 */

import {
  createNativeResource,
  updateNativeResource,
  createPSP,
  updatePSP,
  createStack,
  loadStackDetail,
  loadStackList,
  loadSample,
  checkProjectIstio,
} from '../services/createNativeResource'
import { getDeepValue } from '../utils/helper';

interface YamlValuePar {
  payload: {
    yamlValue?: string | undefined;
  }
}

export default {
  namespace: 'createNative',
  state: {
    yamlValue: `
    apiVersion: v1
    kind: Service
    metadata:
      name: nginx
      labels:
        app: nginx
    spec:
      ports:
      - port: 80
        name: web
      clusterIP: None
      selector:
        app: nginx
    ---
    apiVersion: apps/v1
    kind: StatefulSet
    metadata:
      name: web
    spec:
      selector:
        matchLabels:
          app: nginx    # has to match .spec.template.metadata.labels
      serviceName: "nginx"
      replicas: 2   # by default is 1
      template:
        metadata:
          labels:
            app: nginx   # has to match .spec.selector.matchLabels
        spec:
          terminationGracePeriodSeconds: 10
          containers:
          - name: nginx
            image: nginx:v1.9.2
            ports:
            - containerPort: 80
              name: web
            volumeMounts:
            - name: www
              mountPath: /usr/share/nginx/html
      volumeClaimTemplates:
      - metadata:
          name: www
        spec:
          accessModes: [ "ReadWriteOnce" ]
          storageClassName: "my-storage-class"
          resources:
            requests:
              storage: 1Gi
    ---

    kind: Service
    apiVersion: v1
    metadata:
      name: my-service
    spec:
      selector:
        app: nginx
      ports:
      - protocol: TCP
        port: 80
        targetPort: 9376
    ---
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: nginx-deployment
    spec:
      selector:
        matchLabels:
          app: nginx
      replicas: 2
      template:
        metadata:
          labels:
            app: nginx
        spec:
          containers:
          - name: nginx
            image: nginx
            ports:
            - containerPort: 80
    ---
    apiVersion: batch/v1
    kind: Job
    metadata:
      name: process-item
      labels:
        jobgroup: jobexample
    spec:
      completions: 4
      parallelism: 2
      template:
        metadata:
          name: jobexample
          labels:
            jobgroup: jobexample
        spec:
          containers:
          - name: c
            image: busybox
            command: ["sh", "-c", "echo Processing item $ITEM && sleep 5"]
          restartPolicy: Never`,
  },
  reducers: {
    updateYamlValue(state, { payload: { yamlValue = '' } = {} }: YamlValuePar) {
      return { ...state, yamlValue }
    },
  },
  effects: {
    * createNativeResource({ payload }, { call }) {
      const res = yield call(createNativeResource , payload)
      return res
    },
    * createPSP({ payload }, { call }) {
      const res = yield call(createPSP , payload)
      return res
    },
    * updateNativeResource({ payload }, { call }) {
      const res = yield call(updateNativeResource, payload)
      return res
    },
    * updatePSP({ payload }, { call }) {
      const res = yield call(updatePSP, payload)
      return res
    },
    * createStack({ payload }, { call }) {
      const res = yield call(createStack, payload)
      return res
    },
    * loadStackDetail({ payload }, { call }) {
      const res = yield call(loadStackDetail, payload)
      return res
    },
    * loadStackList({ payload }, { call }) {
      const res = yield call(loadStackList, payload)
      return res
    },
    * loadSample({ payload }, { call }) {
      const res = yield call(loadSample, payload)
      return res
    },
    * checkProjectIstio({ payload }, { call }) {
      const res = yield call(checkProjectIstio, payload)
      const istioEnable = getDeepValue(res, [ 'istioEnabled' ]) || false
      return istioEnable
    },
  },
}
