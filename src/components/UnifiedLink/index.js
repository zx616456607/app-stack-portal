/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
*/

/**
 *
 * Unified Link
 *
 * @author zhangpc
 * @date 2019-01-10
 *
*/
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./index.prod')
} else {
  module.exports = require('./index.dev')
}
