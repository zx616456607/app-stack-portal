/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 */

/**
 *  Deployment shape
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
    types: [ 'devs.LBgroup', 'devs.Service', 'devs.ConfigMap' ],
  },
  _app_stack_template: template,
  _app_stack_input: inputs,
}
options = getOptions({ text: 'Deployment', type: 'Deployment' }, options)
const Deployment = joint.shapes.devs.Model.define('devs.Deployment', options)

Deployment.options = options

export default Deployment
