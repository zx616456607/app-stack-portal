/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 */

/**
 *  _ShapeTemplate shape
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
      'devs.CronJob', 'devs.Deployment', 'devs.Job', 'devs.StatefulSet',
      'devs.DeploymentService', 'devs.LBgroup',
    ],
  },
  _app_stack_template: template,
  _app_stack_input: inputs,
}
options = getOptions({ text: 'Service', type: 'Service' }, options)
const Service = joint.shapes.devs.Model.define('devs.Service', options)

Service.options = options

export default Service
