/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 */

/**
 *  StorageGlusterFS shape
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
options = getOptions({ text: 'GlusterFS', type: 'StorageGlusterFS' }, options)
const StorageGlusterFS = joint.shapes.devs.Model.define('devs.StorageGlusterFS', options)

StorageGlusterFS.options = options

export default StorageGlusterFS
