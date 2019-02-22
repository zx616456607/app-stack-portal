/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Menus
 *
 * @author zhangpc
 * @date 2018-05-24
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Menu } from 'antd'
import UnifiedLink from '@tenx-ui/utils/es/UnifiedLink'

const SubMenu = Menu.SubMenu
const MenuItem = Menu.Item
const getDefaultSelectedAndDefaultOpen = (location, menu) => {
  const { pathname } = location
  const pathnameList = pathname.split('/').filter(item => item !== '')
  const open = menu.filter(item => item.key === pathnameList[0])
  let select = open
  if (open[0] && open[0].children && (pathnameList.length > 1)) {
    select = open[0].children.filter(item => item.key === pathnameList[1])
  }
  // TODO: 存在问题: 如果openKey 存在子页面, 但location中没有二级路径, 直接使用children[0]作为默认选择
  if (open[0] && open[0].children && (pathnameList.length === 1)) {
    select = [ open[0].children[0] ]
  }
  const defaultSelectedKeys = select.length > 0 ? [ select[0].key ] : []
  const defaultOpenKeys = open.length > 0 ? [ open[0].key ] : []
  return {
    defaultSelectedKeys,
    defaultOpenKeys,
  }
}
const Menus = ({
  siderFold, menu, location,
}) => {
  /**
   * render menu in sider
   *
   * @param {object} _menu menu object
   * @param {bool} _siderFold is sider fold
   * @return {element} menu element
   */
  const renderMenu = (_menu, _siderFold) => {
    const { type, to, icon, text, children, skiped, ...otherProps } = _menu
    if (skiped) {
      return
    }
    if (type === 'SubMenu') {
      return (
        <SubMenu
          title={
            <span>
              {icon}
              {text}
            </span>
          }
          {...otherProps}
        >
          {children.map(child => renderMenu(child, _siderFold))}
        </SubMenu>
      )
    }
    return (
      <MenuItem {...otherProps}>
        <UnifiedLink to={to}>
          {icon}
          {text}
        </UnifiedLink>
      </MenuItem>
    )
  }
  /**
   * get default select keys
   *
   * @param {object} location the object of location from react-router
   * @param {array} menus menu list
   * @return {array} defaultSelectedKeys
   */
  /* const getMenuSelectedKeys = (location, menus) => {
    const defaultSelectedKeys = []
    const { pathname } = location
    menus.every(menu => {
      if (menu.to === '/') {
        if (pathname === menu.to) {
          defaultSelectedKeys.push(menu.key)
          return false
        }
        return true
      }
      if (menu.type === 'SubMenu') {
        const childrenMenus = menu.children
        let isFound = false
        childrenMenus.every(_menu => {
          if (_menu.includePaths && _menu.includePaths.indexOf(pathname) > -1) {
            defaultSelectedKeys.push(_menu.key)
            isFound = true
            return false
          }
          if (pathname === _menu.to) {
            defaultSelectedKeys.push(_menu.key)
            isFound = true
            return false
          }
          return true
        })
        // if found jump out of the loop
        return !isFound
      }
      if (pathname === menu.to) {
        // if (pathname.indexOf(menu.to) === 0) {
        defaultSelectedKeys.push(menu.key)
        return false
      }
      return true
    })
    if (defaultSelectedKeys.length === 0) {
      defaultSelectedKeys.push(menus[0].key || (menus.children && menus.children[0].key))
    }
    return defaultSelectedKeys
  }*/
  const defaultSelectAndOpen = getDefaultSelectedAndDefaultOpen(location, menu)
  const menuItems = menu.map(item => renderMenu(item, siderFold))
  return (
    <Menu
      mode={siderFold ? 'vertical' : 'inline'}
      // selectedKeys={getMenuSelectedKeys(location, menu)}
      defaultSelectedKeys={defaultSelectAndOpen.defaultSelectedKeys}
      defaultOpenKeys={defaultSelectAndOpen.defaultOpenKeys}
      theme="dark"
    >
      {menuItems}
    </Menu>
  )
}

Menus.propTypes = {
  menu: PropTypes.array,
  siderFold: PropTypes.bool,
  location: PropTypes.object,
}

export default Menus
