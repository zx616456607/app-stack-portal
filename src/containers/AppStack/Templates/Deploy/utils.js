/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 *  App stack utils
 *
 * @author zhangpc
 * @date 2018-11-29
 */

import { getDeepValue } from '../../../../utils/helper'

const APP_STACK_LABEL = 'system/appstack'

export const addAppStackLabelsForResource = (name, resource) => {
  if (!resource.metadata) {
    resource.metadata = {}
  }
  if (!resource.metadata.labels) {
    resource.metadata.labels = {}
  }
  resource.metadata.labels[APP_STACK_LABEL] = name
  if (getDeepValue(resource, [ 'spec', 'template', 'metadata', 'labels' ])) {
    resource.spec.template.metadata.labels[APP_STACK_LABEL] = name
  }
  return resource
}
