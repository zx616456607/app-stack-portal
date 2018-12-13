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
 * Calculate time from now
 * Option
 * - beginDate
 * Output
 * - three days ago, etc
 *
 * @param {any} beginDate format string
 * @return {string} formatted datetime string
 */
const calcuDate = beginDate => moment(beginDate).fromNow()

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
 * @param {array} propsList the propsList you read
 * @return {any} if read error, return null
 * @example getDeepValue(userList, ['group', 0, 'name'])
 */
const getDeepValue = (target, propsList) => propsList.reduce(
  (result, prop) => ((result && result[prop]) ? result[prop] : null), target)

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
const formatMonitorName = data => {
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

/**
 * 统一 pod 和 service 监控数据格式
 * @param {object} res 数据源
 * @return {object} result data
 */
const formatPodMonitor = res => {
  const result = {
    data: [],
  }
  for (const [ key, value ] of Object.entries(res)) {
    const metrics = value.metrics || []
    metrics.forEach(metric => {
      metric.value && (metric.value = Math.ceil(metric.value * 100) / 100)
      metric.floatValue && (metric.floatValue = Math.ceil(metric.floatValue * 100) / 100)
    })
    value.container_name = key
    value.metrics = metrics
    result.data.push(value)
  }
  return result
}

/**
 * Format cpu
 * @param {any} memory memory
 * @param {any} resources resources
 * @return {any} return data
 */
function cpuFormat(memory, resources) {
  const enterpriseFlag = true
  const parseCpuToNumber = cpu => {
    if (!cpu) {
      return
    }
    if (cpu.indexOf('m') < 0) {
      cpu *= 1000
    } else {
      cpu = parseInt(cpu)
    }
    return Math.ceil((cpu / 1000) * 10) / 10
  }
  const cpuLimits = parseCpuToNumber(resources && resources.limits ? resources.limits.cpu : null)
  const cpuRequests = parseCpuToNumber(
    resources && resources.requests ? resources.requests.cpu : null
  )
  if (enterpriseFlag) {
    if (cpuLimits && cpuRequests && cpuLimits !== cpuRequests) {
      return `${cpuRequests}~${cpuLimits} CPU`
    }
    if (cpuLimits && cpuRequests && cpuLimits === cpuRequests) {
      return `${cpuRequests} CPU`
    }
  }
  if (!memory) {
    return '-'
  }
  const newMemory = parseInt(memory.replace('Mi', '').replace('Gi'))
  switch (newMemory) {
    case 1:
      return '1 CPU（共享）'
    case 2:
      return '1 CPU（共享）'
    case 4:
      return '1 CPU'
    case 8:
      return '2 CPU'
    case 16:
      return '2 CPU'
    case 32:
      return '2 CPU'
    case 256:
      return '1 CPU（共享）'
    case 512:
      return '1 CPU（共享）'
    default:
      return '1 CPU'
  }
}
function memoryFormat(resources) {
  const enterpriseFlag = true
  let memoryLimits = resources && resources.limits ? resources.limits.memory : null
  let memoryRequests = resources && resources.requests ? resources.requests.memory : null
  if (!memoryLimits || !memoryRequests) {
    return '-'
  }
  memoryLimits = memoryLimits.replace('i', '')
  if (enterpriseFlag && memoryLimits && memoryRequests) {
    memoryRequests = memoryRequests.replace('i', '')
    if (memoryLimits === memoryRequests) {
      return memoryLimits
    }
    return `${memoryRequests}~${memoryLimits}`
  }
  return memoryLimits
}

function utf8_to_b64(str) {
  return window.btoa(window.unescape(encodeURIComponent(str)));
}

function b64_to_utf8(str) {
  // For k8s only
  str = str.slice(1)
  try {
    str = decodeURIComponent(window.escape(window.atob(str)));
  } catch (error) {
    str = window.atob(str);
  }
  return str;
}

/*
 * this function for app, storage, compose file, tenxflow, repository,
 * docker file, image name, image store, users,
 * teamspeace, integration
 */
/*
 * this function for app, storage, compose file, tenxflow, repository,
 * docker file, image name, image store, users,
 * teamspeace, integration
 */
function appNameCheck(name, itemName, existNameFlag) {
  // name for check, itemName for show, existNameFlag for show existed
  let errorMsg = '';
  // null check
  if (!name || name.length === 0) {
    errorMsg = '请输入' + itemName;
    return errorMsg;
  }
  // a-zA-Z start check
  const startCheck = new RegExp('^[A-Za-z]{1}');
  if (!startCheck.test(name)) {
    errorMsg = '请以字母开头';
    return errorMsg;
  }
  // a-zA-Z0-9_- body check
  const bodyCheck = new RegExp('^[A-Za-z]{1}[A-Za-z0-9_-]*$');
  if (!bodyCheck.test(name)) {
    errorMsg = '由字母、数字、中划线-、下划线_组成';
    return errorMsg;
  }
  // min length check
  if (name.length < 3) {
    errorMsg = '请输入3个以上字符';
    errorMsg = `${itemName}至少为3个字符`;
    return errorMsg;
  }
  // existName check
  if (existNameFlag) {
    errorMsg = itemName + '已经存在';
    return errorMsg;
  }
  // max length check
  if (name.length > 63) {
    errorMsg = '不能超过63个字符';
    return errorMsg;
  }
  // a-zA-Z0-9 end check
  const endCheck = new RegExp('^[A-Za-z]{1}[A-Za-z0-9_\-]{1,61}[A-Za-z0-9]$');
  if (!endCheck.test(name)) {
    errorMsg = '由字母或数字结尾';
    return errorMsg;
  }
  return 'success';
}


export {
  delay,
  getType,
  getFirstIndexOfArray,
  safeParseJSON,
  encodeImageFullname,
  formatDate,
  calcuDate,
  getDeepValue,
  parseK8sSize,
  getBuildStatusTextAndClass,
  getServiceStatus,
  formatMonitorName,
  formatPodMonitor,
  cpuFormat,
  memoryFormat,
  utf8_to_b64,
  b64_to_utf8,
  appNameCheck,
}

