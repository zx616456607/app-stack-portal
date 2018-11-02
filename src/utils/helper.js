/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * helper
 *
 * @author Song Shangzhi
 * @date 2018-05-24
 */

import attempt from 'lodash/attempt'
import isEmpty from 'lodash/isEmpty'
import moment from 'moment'
import { DEFAULT_TIME_FORMAT } from './constants'
import cloneDeep from 'lodash/cloneDeep'

const TENX_MARK = 'tenxcloud.com'
// 延时函数
const delay = ({ timeout = 1000, data = {}, success = true }) => new Promise(
  (resolve, reject) => setTimeout(() => (success ? resolve(data) : reject()), timeout)
)

/**
 * Get the type of var
 *
 * @export
 * @param {any} param var
 * @return {string} type
 */
const getType = param => {
  let type = Object.prototype.toString.call(param)
  type = type.replace(/\[object /, '')
  type = type.replace(/\]/, '')
  return type.toLowerCase()
}

/**
 * Get the first array footer index that fulfilling requirements
 *
 * @export
 * @param {array} arr - the Array instance
 * @param {function | string | number | boolean} func - the method or value need to be fulfilled
 * @return {number} index - when not found ,return -1
 */
const getFirstIndexOfArray = (arr, func) => {
  try {
    let i = -1
    if (!func) return i
    const type = typeof func
    if (type === 'function') {
      for (let j = 0; j < arr.length; j++) {
        if (func(arr[j])) {
          i = j
          break
        }
      }
      return i
    }
    if ([ 'boolean', 'string', 'number' ].indexOf(type) > -1) i = arr.indexOf(func)
    return i
  } catch (e) {
    console.warn(e)
  }
}

/**
 * safe parse json by attempt of loash
 *
 * @param {string} str string
 *
 * @return {object} json
 */
const safeParseJSON = str => attempt(JSON.parse.bind(null, str))

/**
 * encode image fullname
 * `carrot/node/edge` -> `carrot/node%2Fedge`
 *
 * @export
 * @param {string} fullname projectName/imageName
 * @return {string} encoded fullname
 */
const encodeImageFullname = fullname => {
  const [ project, ...imageName ] = fullname.split('/')
  if (!imageName || imageName.length === 1) {
    return fullname
  }
  return `${project}/${encodeURIComponent(imageName.join('/'))}`
}

/**
 * Format datetime
 * `YYYY-MM-DD HH:mm:ss`
 *
 * @param {any} timestamp datetime
 * @param {string} format format string
 * @return {string} formatted datetime string
 */
const formatDate = (timestamp, format) => {
  format = format || DEFAULT_TIME_FORMAT
  if (!timestamp || timestamp === '') {
    return moment(new Date()).format(format)
  }
  return moment(timestamp).format(format)
}

/**
 * Format date
 * `YYYY-MM-DD HH:mm:ss`
 * @export
 * @param {any} timestamp
 * @returns
 */
const dateLiteral = {
  zh: {
    year: [ '年', '年' ],
    month: [ '月', '月' ],
    day: [ '日', '日' ],
    hour: [ '小时', '小时' ],
    minute: [ '分', '分' ],
    second: [ '秒', '秒' ],
    millisecond: [ '毫秒', '毫秒' ],
  },
  en: {
    year: [ 'year', 'years' ],
    month: [ 'month', 'months' ],
    day: [ 'day', 'days' ],
    hour: [ 'hour', 'hours' ],
    minute: [ 'minute', 'minutes' ],
    second: [ 'second', 'seconds' ],
    millisecond: [ 'ms', 'ms' ],
  },
  jp: {
    year: [ '年', '年' ],
    month: [ 'ヶ月', 'ヶ月' ],
    day: [ '日', '日' ],
    hour: [ '時間', '時間' ],
    minute: [ '分', '分' ],
    second: [ '秒', '秒' ],
    millisecond: [ 'ミリ秒', 'ミリ秒' ],
  },
}
//
export function formatDuration(begin, end = new Date(), showZeroSecond, separator, showZero, loc) {
  const start = toDate(begin)
  const over = toDate(end)
  const d = moment.duration(over - start)
  loc = loc ? loc : 'zh'
  let table = {}
  if (dateLiteral.hasOwnProperty(loc)) {
    table = dateLiteral[loc]
  } else {
    table = dateLiteral.en
  }
  if (!separator) {
    separator = ' '
  }
  const duration = [
    [ 'year', d.years() ],
    [ 'month', d.months() ],
    [ 'day', d.days() ],
    [ 'hour', d.hours() ],
    [ 'minute', d.minutes() ],
    // [ 'second', d.seconds() ],
    // [ 'millisecond', d.milliseconds() ],
  ]
  const result = duration.reduce((parts, entry) => {
    const key = entry[0]
    const value = entry[1]
    if (value === 0 && !showZero) {
      return parts
    }
    const literal = value === 1 ? table[key][0] : table[key][1]
    parts.push(`${value} ${literal}`)
    return parts
  }, []).join(separator)
  if (result) {
    return result
  }
  return showZeroSecond ? `0 ${table.second[0]}` : ''
}

function toDate(date) {
  if (typeof date === 'string') {
    return new Date(date)
  }
  return date
}

/**
 * safely get deep value in a Nested Object or Array
 * @param {object | array} target the obj or array you need to read value from
 * @param {array | string} propsList the propsList you read
 * @return {any} if read error, return null
 * @example getDeepValue(userList, ['group', 0, 'name'])
 */
const getDeepValue = (target, propsList) => {
  let list = propsList
  if (typeof propsList === 'string') list = propsList.split('.').filter(i => i !== '')
  return list.reduce(
    (result, prop) => ((result && result[prop]) ? result[prop] : null), target)
}

/**
 * parse k8s size string to object
 *
 * @param {string} [sizeStr=''] '1Gi'
 * @return {object} { size: 1024, unit: 'Gi' }
 */
const parseK8sSize = (sizeStr = '') => {
  if (!sizeStr) {
    return {}
  }
  const unit = sizeStr.substr(-2)
  let size = sizeStr.replace(unit, '')
  switch (unit) {
    case 'Gi':
      size *= 1024
      break
    case 'Ti':
      size *= 1024 * 1024
      break
    case 'Pi':
      size *= 1024 * 1024 * 1024
      break
    case 'Ei':
      size *= 1024 * 1024 * 1024 * 1024
      break
    case 'Mi':
    default:
      break
  }
  return { size, unit }
}

/**
 * get statusText and statusClass by status
 *
 * @param {number} status build status
 * @return {object} { statusText, statusClass }
 */
const getBuildStatusTextAndClass = status => {
  let statusText = ''
  let statusClass = ''
  let statusColor = ''
  const errorColor = '#f85a5a'
  const successColor = '#5cb85c'
  const warningColor = '#FFBF00'
  const primaryColor = '#2db7f5'
  const noColor = '#666'
  switch (status) {
    case 0:
      statusText = '成功'
      statusClass = 'success'
      statusColor = successColor
      break
    case 1:
      statusText = '失败'
      statusClass = 'failed'
      statusColor = errorColor
      break
    case 2:
      statusText = '执行中...'
      statusClass = 'running'
      statusColor = primaryColor
      break
    case 4:
      statusText = '手动终止'
      statusClass = 'abort'
      statusColor = errorColor
      break
    case 33:
      statusText = '审批超时'
      statusClass = 'approvalTtimeout'
      statusColor = errorColor
      break
    case 32:
    case 35:
      statusText = '等待审批'
      statusClass = 'pendingForApproval'
      statusColor = warningColor
      break
    case 34:
      statusText = '拒绝执行'
      statusClass = 'refusedToExecute'
      statusColor = errorColor
      break
    case 36:
      statusText = '审批处理中'
      statusClass = 'inApproval'
      statusColor = noColor
      break
    default:
      statusText = '等待中...'
      statusClass = 'waiting'
      statusColor = warningColor
  }
  return { statusText, statusClass, statusColor }
}

/**
 * Get service status
 * return one of [ Running, Pending, Stopped, Stopping, ScrollRelease, RollingUpdate, Deploying ]
 *
 * @param {object} _service build status
 * @return {object} { phase, availableReplicas, replicas }
 *
 */
const getServiceStatus = _service => {
  const service = cloneDeep(_service)
  const { status, metadata } = service
  if (!metadata.annotations) {
    metadata.annotations = {}
  }
  const specReplicas = service.spec.replicas
  let replicas = specReplicas
  if (replicas === undefined) {
    replicas = metadata.annotations[`${TENX_MARK}/replicas`]
  }
  let availableReplicas = 0
  if (!status) {
    return {
      phase: 'Stopped',
      availableReplicas: 0,
      replicas,
    }
  }
  availableReplicas = status.availableReplicas || 0
  status.availableReplicas = availableReplicas
  let {
    phase,
    updatedReplicas,
    unavailableReplicas,
    observedGeneration,
    readyReplicas,
  } = status
  const { strategy = {} } = service.spec || {}
  if (status.replicas > specReplicas && strategy.type === 'RollingUpdate') {
    const newCount = metadata.annotations['rollingupdate/newCount']
    if (newCount === undefined) {
      phase = 'ScrollRelease'
    } else {
      phase = 'RollingUpdate'
    }
    return {
      phase,
      availableReplicas,
      replicas,
    }
  }
  status.replicas = replicas
  if (phase && phase !== 'Running') {
    return status
  }
  if (observedGeneration >= metadata.generation
    && replicas === updatedReplicas && readyReplicas > 0) {
    status.availableReplicas = readyReplicas
    status.phase = 'Running'
  } else if (unavailableReplicas > 0 && (!availableReplicas || availableReplicas < replicas)) {
    status.phase = 'Pending'
  } else if (specReplicas > 0 && availableReplicas < 1) {
    status.unavailableReplicas = specReplicas
    status.phase = 'Pending'
  } else if (updatedReplicas && unavailableReplicas) {
    status.phase = 'Deploying'
    status.progress = { status: false }
  } else if (availableReplicas < 1) {
    status.phase = 'Stopped'
  } else {
    status.phase = 'Running'
  }
  // For issue #CRYSTAL-2478
  // Add spec.replicas analyzing conditions
  if (specReplicas === 0 && availableReplicas > 0) {
    status.phase = 'Stopping'
  }
  return status
}

/**
 * bizcharts 图例显示有问题，去掉服务名称后的数字（dsb-server-3375465363-1x4v5 => dsb-server-1x4v5）
 * @param {object} data 数据源
 * @return {object} 修改数据中的时间
 */
const formatInstanceMonitor = data => {
  if (isEmpty(data)) {
    return data
  }
  data.forEach(item => {
    const { container_name, metrics } = item
    let name = container_name.split('-')
    name.splice(-2, 1)
    name = name.join('-')
    metrics.forEach(metric => {
      metric.container_name = name
      metric.timestamp = formatDate(metric.timestamp, 'MM-DD HH:mm:ss')
    })
  })
  return data
}

export {
  delay,
  getType,
  getFirstIndexOfArray,
  safeParseJSON,
  encodeImageFullname,
  formatDate,
  getDeepValue,
  parseK8sSize,
  getBuildStatusTextAndClass,
  getServiceStatus,
  formatInstanceMonitor,
}

