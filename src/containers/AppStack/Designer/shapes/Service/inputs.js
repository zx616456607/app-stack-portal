/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 */

/**
 * inputs of Service
 *
 * @author zhangpc
 * @date 2019-03-05
 */

import { INPUT_SERVICE_PROTOCOL } from '../_utils'

const inputs = {
  service_name: {
    label: '原生资源',
    description: 'Service 名称',
    default: '',
  },
  service_port: {
    type: 'number',
    label: '原生资源',
    description: '服务端口',
    default: 80,
  },
  service_protocol: {
    ...INPUT_SERVICE_PROTOCOL,
  },
  service_targetPort: {
    type: 'number',
    label: '原生资源',
    description: '目标端口',
    default: 80,
  },
}

export default inputs
