/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 *  Built-in function for shapes
 *
 * @author zhangpc
 * @date 2018-12-28
 */

export const getSchemaPortname = service => {
  const portnameArray = []
  service.spec.ports.forEach(({ name, protocol }) => {
    // Don't need to add UDP, as HAProxy doesn't support UDP for now, so it's useless
    if (protocol === 'UDP') {
      return
    }
    // Mark real protocol in annotations
    portnameArray.push(`${name}/${protocol}`)
  })
  return portnameArray.join(',')
}
