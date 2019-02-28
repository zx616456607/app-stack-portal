/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 */

/**
 *  StoragePrivate shape
 *
 * @author zhangpc
 * @date 2019-02-27
 */

import * as joint from 'jointjs'
import { getOptions } from '../_base'
import template from './template.json'
import inputs from './inputs.json'

let options = {
  _deploy_2_yaml: true,
  _link_rules: {
    required: false,
    types: [
      'devs.CronJob', 'devs.Deployment', 'devs.Job', 'devs.StatefulSet',
      'devs.DeploymentService',
    ],
  },
  _app_stack_template: template,
  _app_stack_input: inputs,
}
options = getOptions({ text: '独享存储', type: 'StoragePrivate' }, options)
const StoragePrivate = joint.shapes.devs.Model.define('devs.StoragePrivate', options)

StoragePrivate.options = options

export default StoragePrivate
