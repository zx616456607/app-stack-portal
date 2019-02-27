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
  _deploy_2_yaml: true,
  _link_rules: {
    required: false,
    types: [ 'devs.DeploymentService', 'devs.Deployment' ],
  },
  _app_stack_template: template,
  _app_stack_input: inputs,
}
options = getOptions({ text: '加密配置', type: 'Secret' }, options)

const Secret = joint.shapes.devs.Model.define('devs.Secret', options)

Secret.options = options

export default Secret
