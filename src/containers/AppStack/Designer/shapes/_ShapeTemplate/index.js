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
  /** 入口连接点 */
  inPorts: [ 'in' ],
  /** 出口连接点 */
  outPorts: null,
  /** 部署的时候是否要转换成 yaml */
  _deploy_2_yaml: true,
  /** 是否允许单独部署，在保存堆栈时会检查 `_deploy_single` 为 `true` 的元素不允许单独保存 */
  _deploy_single: false,
  /** 连线规则 */
  _link_rules: {
    /** 是否必须连线 */
    required: false,
    /** 可以连线的元素类型 */
    types: [ 'devs.Service', 'devs.ConfigMap' ],
  },
  /** 元素的模版（一般为 k8s 资源对应的结构） */
  _app_stack_template: template,
  /** 元素的输入内容 */
  _app_stack_input: inputs,
}
// 注意要在 `public/designer/svg` 中增加一个与元素 type 同名的 svg 文件作为元素的图标
options = getOptions({ text: '_ShapeTemplate', type: '_ShapeTemplate' }, options)
const _ShapeTemplate = joint.shapes.devs.Model.define('devs._ShapeTemplate', options)

_ShapeTemplate.options = options

export default _ShapeTemplate
