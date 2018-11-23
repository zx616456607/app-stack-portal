/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * yamls of appStack
 *
 * @author zhangpc
 * @date 2018-11-16
 */

export const YAML_SEPARATOR = '---\n'
/* export const Deployment = `
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  annotation:
    sidecar.istio.io/inject: "false"
  name:
    get_input: deployment_name
  namespace:
    get_input: namespace
  labels:
    tenxcloud.com/appName:
      get_input: app_name
    tenxcloud.com/svcName:
      get_input: deployment_name
spec:
  strategy:
    rollingUpdate:
      maxSurge: 10%
      maxUnavailable: 0
    type: RollingUpdate
  replicas:
    get_input: replicas
  selector:
    matchLabels:
      name:
        get_input: deployment_name
  template:
    metadata:
      annotations:
        sidecar.istio.io/inject: "false"
      labels:
        app:
          get_input: deployment_name
        name:
          get_input: deployment_name
        tenxcloud.com/appName:
          get_input: app_name
        tenxcloud.com/svcName:
          get_input: deployment_name
    spec:
      containers:
      - image:
          get_input: image_addr
        imagePullPolicy: always # 1
        name:
          get_input: deployment_name # 2
        ports:
        - containerPort:
            get_input: container_port
          protocol:
            get_input: port_protocol
        resources:
          limits:
              cpu:
                get_input: limits_cpu
              memory:
                get_input: limits_memory
          requests:
              cpu:
                get_input: requests_cpu
              memory:
                get_input: requests_memory
`

export const Service = `
apiVersion: v1
kind: Service
metadata:
  labels:
    tenxcloud.com/appName:
      get_input: app_name
    tenxcloud.com/svcName:
      get_input: service_name
  name:
    get_input: service_name
  namespace:
    get_input: namespace
spec:
  ports:
  - name: port_name_1
    port:
      get_input: service_port
    protocol:
      get_input: service_protocol
    targetPort:
      get_input: service_targetPort
  selector:
    name:
      get_input: deployment_name
`

export const ConfigMap = `
apiVersion: v1
data:
  example: example
kind: ConfigMap
metadata:
  name:
    get_input: configMap_name
  namespace:
      get_input: namespace
` */
export const Deployment = `kind: Deployment
apiVersion: v1
metadata:
  name: test
  labels:
    name: test
    tenxcloud.com/appName: test
    tenxcloud.com/svcName: test
    system/appstack: test123
  annotations:
    sidecar.istio.io/inject: 'false'
spec:
  replicas: 1
  selector:
    matchLabels:
      name: test
  template:
    metadata:
      labels:
        name: test
        tenxcloud.com/appName: test
        tenxcloud.com/svcName: test
      annotations:
        sidecar.istio.io/inject: 'false'
    spec:
      containers:
        - name: test
          image: '192.168.1.52/public/hello-world:latest'
          ports:
            - containerPort: 80
              protocol: TCP
          resources:
            limits:
              memory: 512Mi
              cpu: 1000m
            requests:
              memory: 512Mi
              cpu: 200m
          args:
            - /hello
          imagePullPolicy: Always
          volumeMounts:
            - name: noclassify-configmap-classify-configmap-volume-1
              mountPath: /home/example
              readOnly: false
              subPath: example
      volumes:
        - name: noclassify-configmap-classify-configmap-volume-1
          configMap:
            name: demo
            items:
              - key: example
                path: example
`

export const Service = `kind: Service
apiVersion: v1
metadata:
  name: test
  labels:
    tenxcloud.com/appName: test
    tenxcloud.com/svcName: test
    name: test
    system/appstack: test123
  annotations:
    system/lbgroup: none
spec:
  ports:
    - name: tcp-test-0
      protocol: TCP
      targetPort: 80
      port: 80
  selector:
    name: test
`

export const ConfigMap = `apiVersion: v1
data:
  example: example
kind: ConfigMap
metadata:
  name: demo
`
