/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
*/

/**
 *
 * Unified Link prod
 *
 * @author zhangpc
 * @date 2019-01-10
 *
*/

import pathToRegexp from 'path-to-regexp'

const PATH_LIST = [
  {
    path: '/app-stack',
    unifiedLink: '/app-stack-pro',
    redirect: false,
  },
  {
    path: '/app-stack/appStackDetail/:name',
    unifiedLink: '/app-stack-pro',
    redirect: true,
  },
  {
    path: '/app-stack/appStackDetail/:name/:key',
    unifiedLink: '/app-stack-pro',
    redirect: true,
  },
  {
    path: '/app-stack/templates',
    unifiedLink: '/app-stack-pro/templates',
    redirect: false,
  },
  {
    path: '/app-stack/templates/:name/deploy',
    unifiedLink: '/app-stack-pro/templates',
    redirect: true,
  },
  {
    path: '/app-stack/designer',
    unifiedLink: '/app-stack-pro/designer',
    redirect: false,
  },
  {
    path: '/app-stack/designer/:name/edit',
    unifiedLink: '/app-stack-pro/designer',
    redirect: true,
  },
  {
    path: '/Deployment',
    unifiedLink: '/app-stack/Deployment',
    redirect: false,
  },
  {
    path: '/Deployment/:id',
    unifiedLink: '/app-stack/Deployment',
    redirect: true,
  },
  {
    path: '/StatefulSet',
    unifiedLink: '/app-stack/StatefulSet',
    redirect: false,
  },
  {
    path: '/StatefulSet/:id',
    unifiedLink: '/app-stack/StatefulSet',
    redirect: true,
  },
  {
    path: '/Job',
    unifiedLink: '/app-stack/Job',
    redirect: false,
  },
  {
    path: '/Job/:id',
    unifiedLink: '/app-stack/Job',
    redirect: true,
  },
  {
    path: '/CronJob',
    unifiedLink: '/app-stack/CronJob',
    redirect: false,
  },
  {
    path: '/CronJob/:id',
    unifiedLink: '/app-stack/CronJob',
    redirect: true,
  },
  {
    path: '/Pod',
    unifiedLink: '/app-stack/Pod',
    redirect: false,
  },
  {
    path: '/Pod/:id',
    unifiedLink: '/app-stack/Pod',
    redirect: true,
  },
  {
    path: '/Service',
    unifiedLink: '/net-management/Service',
    redirect: false,
  },
  {
    path: '/Service/:id',
    unifiedLink: '/net-management/Service',
    redirect: true,
  },
]

const getUnifiedLink = to => {
  let pathname
  PATH_LIST.every(({ path, unifiedLink, redirect }) => {
    if (pathToRegexp(path).exec(to)) {
      pathname = unifiedLink
      if (redirect) {
        pathname = `${unifiedLink}?redirect=${encodeURIComponent(to)}`
      }
      return false
    }
    return true
  })
  if (!pathname) {
    console.warn(`'${to}' has no matched unified link`)
    pathname = PATH_LIST[0].unifiedLink
  }
  return pathname
}

export const push = to => {
  window.parent.appStackIframeCallBack('redirect', { pathname: getUnifiedLink(to) })
}

const UnifiedLink = props => {
  const { to, children, ...otherProps } = props
  return <a onClick={() => push(to)} {...otherProps}>{children}</a>
}

export default UnifiedLink
