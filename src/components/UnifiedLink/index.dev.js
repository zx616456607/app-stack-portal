/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
*/

/**
 *
 * Unified Link dev
 *
 * @author zhangpc
 * @date 2019-01-10
 *
*/

import { Link } from 'react-router-dom'

export const push = (to, history) => {
  history.push(to)
}

const UnifiedLink = (props = {}) => <Link {...props} />

export default UnifiedLink
