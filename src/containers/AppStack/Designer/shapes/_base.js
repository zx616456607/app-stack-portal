/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 *  Base for shape
 *
 * @author zhangpc
 * @date 2018-12-29
 */

import merge from 'lodash/merge'

export const getOptions = ({ text, type }, options) => {
  const DEFAULT_OPTIONS = {
    size: {
      width: 88,
      height: 88,
    },
    inPorts: [],
    outPorts: [ 'out' ],
    markup: [
      {
        tagName: 'rect',
        selector: 'rect', // not necessary but faster
        attributes: {
          class: 'body',
          rx: 6,
          ry: 6,
          strokeWidth: 1,
          'ref-width': '100%',
          'ref-height': '100%',
        },
      },
      {
        tagName: 'image',
        attributes: {
          class: 'image',
          // ~ Support for quick assignment
          href: `${process.env.PUBLIC_DIR}designer/svg/${type}.svg`,
          width: 36,
          height: 36,
          transform: 'translate(26, 8)',
        },
      },
      {
        tagName: 'text',
        attributes: {
          class: 'label',
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
          // transform: 'matrix(1,0,0,1,44,50)',
          transform: 'matrix(1,0,0,1,44,68)',
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
    attrs: {
      '.label': {
        // ~ Support for quick assignment
        text,
      },
      'label-id': {
        text: '-',
      },
    },
    ports: {
      groups: {
        in: {
          position: {
            name: 'right',
            args: {
              y: 22,
            },
          },
          attrs: {
            '.port-label': {
              fill: '#000',
            },
            '.port-body': {
              fill: '#fff',
              stroke: '#000',
              r: 5,
              magnet: true,
            },
          },
          label: null,
        },
        out: {
          position: {
            name: 'left',
            args: {
              y: 22,
            },
          },
          attrs: {
            '.port-label': {
              fill: '#000',
            },
            '.port-body': {
              fill: '#fff',
              stroke: '#000',
              r: 5,
              magnet: true,
            },
          },
          label: null,
        },
      },
      items: [],
    },
  }
  const newOpts = merge({}, DEFAULT_OPTIONS, options)
  if (newOpts.inPorts) {
    newOpts.inPorts.forEach(port => {
      newOpts.ports.items.push({
        id: port,
        group: 'in',
        attrs: {
          '.port-label': {
            text: port,
          },
        },
      })
    })
  }
  if (newOpts.outPorts) {
    newOpts.outPorts.forEach(port => {
      newOpts.ports.items.push({
        id: port,
        group: 'out',
        attrs: {
          '.port-label': {
            text: port,
          },
        },
      })
    })
  }
  return newOpts
}

export const linkOptions = {
  type: 'link',
  connector: {
    name: 'rounded',
  },
  smooth: true,
  attrs: {
    '.body': {
      strokeWidth: 1,
    },
  },
}
