/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Error
 *
 * @author zhangpc
 * @date 2018-05-24
 */
import React from 'react'
import { Icon } from 'antd'
import Page from '@tenx-ui/page'
import '@tenx-ui/page/assets/index.css'
import styles from './style/index.less'

const Error = () => (<Page inner>
  <div className={styles.error}>
    <Icon type="frown-o" />
    <h1>404 Not Found</h1>
  </div>
</Page>)

export default Error
