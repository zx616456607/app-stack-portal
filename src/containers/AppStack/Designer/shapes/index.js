/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 *  App stack shapes
 *
 * @author zhangpc
 * @date 2018-11-16
 */

export * from './_utils'
export { default as Application } from './Application'
export { default as DeploymentService } from './DeploymentService'
export { default as Deployment } from './Deployment'
export { default as Service } from './Service'
export { default as ConfigMap } from './ConfigMap'
export { default as Secret } from './Secret'
export { default as LBgroup } from './LBgroup'
export { default as StatefulSet } from './StatefulSet'
export { default as CronJob } from './CronJob'
export { default as Job } from './Job'
export { default as StorageGlusterFS } from './StorageGlusterFS'
export { default as StorageNFS } from './StorageNFS'
export { default as StoragePrivate } from './StoragePrivate'
