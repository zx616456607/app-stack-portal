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
  /** 部署的时候是否会转换成 yaml */
  _deploy_2_yaml: true,
  /** 是否允许单独部署 */
  _deploy_single: false,
  _link_rules: {
    required: false,
    types: [ 'devs.Service', 'devs.ConfigMap' ],
  },
  _app_stack_template: template,
  _app_stack_input: inputs,
}
options = getOptions({ text: '_ShapeTemplate', type: '_ShapeTemplate' }, options)
const _ShapeTemplate = joint.shapes.devs.Model.define('devs._ShapeTemplate', options)

_ShapeTemplate.options = options

export default _ShapeTemplate
