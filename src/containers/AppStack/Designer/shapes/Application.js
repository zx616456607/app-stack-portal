/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 *  Application shape
 *
 * @author zhangpc
 * @date 2018-11-16
 */

import * as joint from 'jointjs'

const options = {
  size: {
    width: 300,
    height: 300,
  },
  markup: [
    {
      tagName: 'rect',
      selector: 'rect', // not necessary but faster
      attributes: {
        class: 'body',
        rx: 6,
        ry: 6,
        strokeWidth: 1,
        width: 300,
        height: 300,
      },
    },
    {
      tagName: 'g',
      attributes: {
        class: 'label-wrapper',
        transform: 'translate(18, -10)',
      },
      children: [
        {
          tagName: 'rect',
          attributes: {
            width: 120,
            height: 20,
            rx: 12,
            ry: 8,
            strokeWidth: 1,
            stroke: '#2db7f5',
            'stroke-dasharray': 4,
          },
        },
        {
          tagName: 'image',
          attributes: {
            class: 'image',
            href: `${process.env.PUBLIC_DIR}designer/svg/Application.svg`,
            width: 12,
            height: 12,
            transform: 'translate(12,3)',
          },
        },
        {
          tagName: 'text',
          selector: 'label-app',
          attributes: {
            class: 'label-app',
            transform: 'translate(28,4)',
            children: [
              {
                tagName: 'tspan',
                attributes: {
                  dy: 0,
                  class: 'v-line',
                },
              },
            ],
          },
        },
        {
          tagName: 'text',
          selector: 'label-id',
          attributes: {
            class: 'label-id',
            'font-size': 18,
            'xml:space': 'preserve',
            y: '0.8em',
            'text-anchor': 'middle',
            fill: '#000',
            transform: 'translate(82,4)',
            children: [
              {
                tagName: 'tspan',
                attributes: {
                  dy: 0,
                  class: 'v-line',
                },
              },
            ],
          },
        },
      ],
    },
  ],
  attrs: {
    'label-app': {
      text: '应用',
    },
    'label-id': {
      text: '-',
    },
  },
  _deploy_2_yaml: false,
  _link_rules: {
    required: false,
    types: [],
  },
  _app_stack_template: {
    apiVersion: 'v1',
    kind: 'Application',
    metadata: {
      name: {
        get_input: 'app_name',
      },
      labels: {},
    },
  },
  _app_stack_input: {
    app_name: {
      label: '扩展资源',
      description: '应用名称',
      default: '',
    },
  },
}
const Application = joint.shapes.devs.Model.define('devs.Application', options)

Application.options = options

export default Application
