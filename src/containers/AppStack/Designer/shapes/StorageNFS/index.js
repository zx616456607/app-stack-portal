/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 */

/**
 *  StorageNFS shape
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
    types: [ 'devs.Service', 'devs.ConfigMap' ],
  },
  _app_stack_template: template,
  _app_stack_input: inputs,
}
options = getOptions({ text: 'NFS', type: 'StorageNFS' }, options)
const StorageNFS = joint.shapes.devs.Model.define('devs.StorageNFS', options)

StorageNFS.options = options

export default StorageNFS
