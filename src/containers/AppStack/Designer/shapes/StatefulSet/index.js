/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 */

/**
 *  StatefulSet shape
 *
 * @author zhangpc
 * @date 2019-02-27
 */

import * as joint from 'jointjs'
import { getOptions } from '../_base'
import template from './template.json'
import inputs from './inputs'

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
options = getOptions({ text: 'StatefulSet', type: 'StatefulSet' }, options)
const StatefulSet = joint.shapes.devs.Model.define('devs.StatefulSet', options)

StatefulSet.options = options

export default StatefulSet
