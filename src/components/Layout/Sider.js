/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Sider
 *
 * @author zhangpc
 * @date 2018-05-24
 */
import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import Menus from './Menu'
import styles from './style/Layout.less'
import logo from '../../assets/img/logo.svg'
import logoWide from '../../assets/img/logo-wide.svg'


const Sider = ({ siderFold, location, menu }) => {

  const menusProps = {
    menu,
    siderFold,
    location,
  }
  const logoClassName = classnames({
    [styles.unfold]: !siderFold,
    [styles.fold]: siderFold,
  })
  return (
    <div>
      <div className={styles.logo}>
        <img className={logoClassName} alt="logo" src={siderFold ? logo : logoWide} />

      </div>
      <Menus {...menusProps} />
    </div>
  )
}

Sider.propTypes = {
  menu: PropTypes.array,
  siderFold: PropTypes.bool,
  location: PropTypes.object,
}

export default Sider
