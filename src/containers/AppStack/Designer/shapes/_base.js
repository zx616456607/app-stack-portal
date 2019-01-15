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
import * as joint from 'jointjs'

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

/**
 * short cell id
 *
 * @param {string} id full id of cell
 *
 * @return {string} shorted Id
 */
export const idShort = id => id.split('-')[0]

/**
 * 简化 graph 结构，以显示在 yaml dock 中
 * 减小暴露给用户结构的复杂度
 *
 * @param {object} graph `this.graph.toJSON()` 返回的结构
 * @return {object} minifiedGraph
 */
export const minifyGraph = (graph = { cells: [] }) => {
  graph.cells = graph.cells.map(cell => {
    if (cell.type === 'link') {
      const { id, type, source, target, z, vertices = [], attrs } = cell
      return { id, type, source, target, z, vertices, attrs }
    }
    const { id, type, position, size, z, attrs } = cell
    const formatCell = { id, type, position, size, z, attrs }
    if (cell.embeds) {
      formatCell.embeds = cell.embeds
    }
    if (cell.parent) {
      formatCell.parent = cell.parent
    }
    return formatCell
  })
  return graph
}

/**
 * 将通过 `minifyGraph` 函数简化后的结构恢复成 `this.graph.fromJSON()` 需要的结构
 *
 * @param {object} minifiedGraph `minifyGraph` 函数简化后的结构
 * @param {object} [nodes={}] nodes
 * @param {object} [inputs={}] inputs
 *
 * @return {object} `this.graph.fromJSON()` 需要的结构
 */
export const fullGraph = (minifiedGraph = { cells: [] }, nodes = {}, inputs = {}) => {
  minifiedGraph.cells = minifiedGraph.cells.map(cell => {
    const { id, type } = cell
    if (type === linkOptions.type) {
      return Object.assign({}, linkOptions, cell)
    }
    const _shortedId = idShort(id)
    if (nodes[_shortedId]) {
      cell._app_stack_template = nodes[_shortedId]
    }
    if (inputs[_shortedId]) {
      cell._app_stack_input = inputs[_shortedId]
    }
    const ResourceShape = joint.shapes.devs[type.split('.')[1]] || {}
    return Object.assign({}, ResourceShape.options, cell)
  })
  return minifiedGraph
}
