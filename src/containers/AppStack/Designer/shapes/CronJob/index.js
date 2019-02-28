/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 */

/**
 * CronJob shape
 *
 * @author zhangpc
 * @date 2019-02-27
 */

import * as joint from 'jointjs'
import { getOptions } from '../_base'
import template from './template.json'
import inputs from './inputs.json'

let options = {
  inPorts: [ 'in' ],
  outPorts: null,
  _deploy_2_yaml: true,
  _link_rules: {
    required: false,
    types: [
      'devs.Secret', 'devs.Service', 'devs.StorageGlusterFS', 'devs.StorageNFS',
      'devs.StoragePrivate', 'devs.ConfigMap',
    ],
  },
  _app_stack_template: template,
  _app_stack_input: inputs,
}
options = getOptions({ text: 'CronJob', type: 'CronJob' }, options)
const CronJob = joint.shapes.devs.Model.define('devs.CronJob', options)

CronJob.options = options

export default CronJob
