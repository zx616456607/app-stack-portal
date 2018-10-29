/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * Job container
 *
 * @author Songsz
 * @date 2018-10-29
 *
*/

import React from 'react'
import { Switch, Route } from 'dva/router'
import List from './List'
import Detail from './Detail'

const Job = props => {
  return (
    <Switch>
      <Route
        exact
        path={props.match.path}
        component={List}
      />
      <Route
        path={`${props.match.path}/:id`}
        component={Detail}
      />
    </Switch>
  )
}

export default Job
