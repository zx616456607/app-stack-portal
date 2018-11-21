/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * constants
 *
 * @author zhangpc
 * @date 2018-05-24
 */
export const CONTENT_TYPE_JSON = 'application/json'
export const CONTENT_TYPE_TEXT = 'text/plain'
export const CONTENT_TYPE_URLENCODED = 'application/x-www-form-urlencoded'
export const AUTH_DATA = 'authData'
export const PIPELINE_RUNNING_STATUS = 2
export const URL_REG_EXP = /^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i
export const TENX_STORE = 'tenx_store'
export const DEFAULT_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
export const IN_PROGRESS_STATUS = [ 2, 32, 35, 36 ]
export const TENX_MARK = 'tenxcloud.com'
export const METRICS_DEFAULT_SOURCE = 'prometheus'
export const METRICS_CPU = 'cpu/usage_rate'
export const METRICS_MEMORY = 'memory/usage'
export const METRICS_NETWORK_RECEIVED = 'network/rx_rate'
export const METRICS_NETWORK_TRANSMITTED = 'network/tx_rate'
export const METRICS_DISK_READ = 'disk/readio'
export const METRICS_DISK_WRITE = 'disk/writeio'
export const UPDATE_INTERVAL = 1000 * 60
export const REALTIME_INTERVAL = 1000 * 10 // 实时监控
export const DOCK_DEFAULT_SIZE = 370
export const DOCK_DEFAULT_HEADER_SIZE = 32
export const FRESH_FREQUENCY = {
  1: {
    freshInterval: '1分钟',
  },
  6: {
    freshInterval: '5分钟',
  },
  24: {
    freshInterval: '20分钟',
  },
  168: {
    freshInterval: '2小时',
  },
  720: {
    freshInterval: '6小时',
  },
}
