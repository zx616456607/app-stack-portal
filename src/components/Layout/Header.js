/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Header
 *
 * @author zhangpc
 * @date 2018-05-24
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Menu, Icon, Layout } from 'antd'
import classnames from 'classnames'
import styles from './style/Header.less'

const { SubMenu } = Menu

const Header = ({
  switchSider, siderFold, user,
}) => {
  const handleClickMenu = () => {}
  const headerClassName = classnames(styles.header, {
    [styles.fold]: siderFold,
    [styles.unfold]: !siderFold,
  })
  return (
    <Layout.Header className={headerClassName}>
      <div
        className={styles.button}
        onClick={switchSider}
      >
        <Icon type={classnames({ 'menu-unfold': siderFold, 'menu-fold': !siderFold })} />
      </div>
      <div className={styles.rightWarpper}>
        <div className={styles.button}>
          <Icon type="mail" />
        </div>
        <Menu mode="horizontal" onClick={handleClickMenu}>
          <SubMenu
            style={{
              float: 'right',
            }}
            title={<span>
              <Icon type="user" />
              {user.userName}
            </span>}
          >
            <Menu.Item key="logout">
              Sign out
            </Menu.Item>
          </SubMenu>
        </Menu>
      </div>
    </Layout.Header>
  )
}

Header.propTypes = {
  switchSider: PropTypes.func,
  siderFold: PropTypes.bool,
  user: PropTypes.object,
}

export default Header
