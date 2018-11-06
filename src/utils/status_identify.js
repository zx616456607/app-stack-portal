/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Status identify tools
 * v0.1 - 2016-11-21
 * @author Zhangpc
 */
import cloneDeep from 'lodash/cloneDeep'
import { TENX_MARK } from './constants'
const CONTAINER_MAX_RESTART_COUNT = 5

/*
 * Get container status
 * one of [Pending, Running, Terminating, Failed, Unknown, Abnormal]
 */
export function getPodStatus(container) {
  const { metadata } = container
  const { deletionTimestamp } = metadata
  const status = container.status || { phase: 'Pending' }
  if (deletionTimestamp) {
    status.phase = 'Terminating'
  }
  const { conditions, containerStatuses } = status
  let restartCount = 0
  let phase = status.phase
  if (conditions) {
    conditions.every(condition => {
      if (condition.type !== 'Ready' && condition.status !== 'True') {
        phase = 'Pending'
        return false
      }
      return true
    })
  }
  if (containerStatuses) {
    containerStatuses.map(containerStatus => {
      // const { ready } = containerStatus
      const containerRestartCount = containerStatus.restartCount
      if (containerRestartCount > restartCount) {
        restartCount = containerRestartCount
        if (!containerStatus.state || !containerStatus.state.running) {
          // state 不存在或 state 不为 running
          phase = 'Abnormal'
        }
      }
      return null
    })
    if (restartCount >= CONTAINER_MAX_RESTART_COUNT) {
      status.phase = phase
      status.restartCount = restartCount
    }
  }
  return status
}

/*
 * Get service status
 * return one of [Pending, Running, Deploying, Stopped]
 */
export function getDeploymentStatus(_service) {
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
  // For issue #CRYSTAL-2478
  // Add spec.replicas analyzing conditions
  if (specReplicas === 0 && availableReplicas > 0) {
    status.phase = 'Stopping'
    return status
  }
  if (observedGeneration >= metadata.generation && replicas === updatedReplicas &&
    readyReplicas > 0) {
    status.availableReplicas = readyReplicas
    status.phase = 'Running'
    return status
  }
  /* if (unavailableReplicas > 0 && (!availableReplicas || availableReplicas < replicas)) {
    status.phase = 'Pending'
  } */
  if (specReplicas > 0 && availableReplicas < 1) {
    status.unavailableReplicas = specReplicas
    status.phase = 'Pending'
    return status
  }
  if (updatedReplicas && unavailableReplicas) {
    status.phase = 'Deploying'
    status.progress = { status: false }
    return status
  }
  if (availableReplicas < 1) {
    status.phase = 'Stopped'
    return status
  }
  status.phase = 'Running'
  return status
}

export function getStatefulSetStatus(_service) {
  const service = cloneDeep(_service)
  const { status, metadata } = service

  if (!metadata.annotations) {
    metadata.annotations = {}
  }
  const specReplicas = service.spec.replicas
  const replicas = specReplicas

  let currentReplicas = 0
  if (!status) {
    return {
      phase: 'Stopped',
      currentReplicas: 0,
      replicas,
    }
  }
  currentReplicas = status.currentReplicas || 0
  status.currentReplicas = currentReplicas
  let {
    phase,
    updatedReplicas,
    observedGeneration,
    readyReplicas,
  } = status
  const { updateStrategy = {} } = service.spec || {}
  if (status.replicas > specReplicas && updateStrategy.type === 'RollingUpdate') {
    phase = 'RollingUpdate'
    return {
      phase,
      currentReplicas,
      replicas,
    }
  }
  status.replicas = replicas
  if (phase && phase !== 'Running') {
    return status
  }
  // For issue #CRYSTAL-2478
  // Add spec.replicas analyzing conditions
  if (specReplicas === 0 && currentReplicas > 0) {
    status.phase = 'Stopping'
    return status
  }
  if (observedGeneration >= metadata.generation && replicas === updatedReplicas &&
    readyReplicas > 0) {
    status.currentReplicas = readyReplicas
    status.phase = 'Running'
    return status
  }
  /* if (uncurrentReplicas > 0 && (!currentReplicas || currentReplicas < replicas)) {
    status.phase = 'Pending'
  } */
  if (specReplicas > 0 && currentReplicas < 1) {
    status.uncurrentReplicas = specReplicas
    status.phase = 'Pending'
    return status
  }
  if (updatedReplicas && currentReplicas < specReplicas) {
    status.phase = 'Deploying'
    status.progress = { status: false }
    return status
  }
  if (currentReplicas < 1) {
    status.phase = 'Stopped'
    return status
  }
  status.phase = 'Running'
  return status
}

// 获取Job状态判断
export function getJobStatus(_service) {
  const service = cloneDeep(_service)
  const status = { phase: 'null' }
  const { status: { succeeded, active = [], failed } = {} } = service
  const { spec: { completions } = {} } = service
  if (succeeded !== undefined && (succeeded === completions)) {
    status.phase = 'Finish'
  }
  if (active > 0) {
    status.phase = 'Doing'
  }
  if (active !== undefined && failed !== undefined &&
    active === 0 && failed > 0 && succeeded < completions) {
    status.phase = 'Failure'
  }
  if (succeeded !== undefined && failed !== undefined) {
    status.availableReplicas = succeeded + failed
  }
  if (completions !== undefined) {
    status.replicas = completions
  }
  return status
}

// CronJob 的状态判断
export function getCronJobStatue(_service) {
  const service = cloneDeep(_service)
  const { spec: { suspend } } = service
  const status = { phase: 'null' }
  if (suspend !== undefined && suspend === true) {
    status.phase = 'Running'
  }
  if (suspend !== undefined && suspend === false) {
    status.phase = 'Stopped'
  }
  return status
}
