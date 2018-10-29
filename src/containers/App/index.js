/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * App
 *
 * @author zhangpc
 * @date 2018-05-24
 */
/* global window */
/* global document */
import React from 'react'
import NProgress from 'nprogress'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import Loader from '@tenx-ui/loader'
import '@tenx-ui/loader/assets/index.css'
import * as MyLayout from '../../components/Layout'
import { BackTop, Layout, notification } from 'antd'
import { footerText } from '../../utils/config'
import { Helmet } from 'react-helmet'
import classnames from 'classnames'
import { withRouter } from 'dva/router'
import './style/App.less'
import contentStyles from './style/content.less'

const { Content, Footer, Sider } = Layout
const { Header, styles } = MyLayout

let lastHref

class App extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    location: PropTypes.object,
    dispatch: PropTypes.func,
    app: PropTypes.object,
    loading: PropTypes.object,
  }

  async componentDidMount() {
    this.mainContainer = document.getElementById('mainContainer')
    const { dispatch, history } = this.props
    if (window.parent.appStackIframeCallBack) {
      window.parent.appStackIframeCallBack('aiPortalHistory', history)
    }
    try {
      await dispatch({ type: 'app/authorize' })
    } catch (error) {
      notification.warn({
        message: '获取 token 失败',
        description: '请刷新页面或重新登录',
      })
    }
  }

  // https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/guides/scroll-restoration.md
  componentDidUpdate(prevProps) {
    if (this.props.app.locationPathname !== prevProps.app.locationPathname) {
      this.mainContainer && (this.mainContainer.scrollTop = 0)
    }
  }

  render() {
    const { children, dispatch, app, loading, location } = this.props
    const {
      siderFold, menu, jwtToken, user,
    } = app
    const production = process.env.NODE_ENV === 'production'

    const classStr = classnames(
      contentStyles.customizeContent,
      {
        [contentStyles.hideHeaderAndSider]: production,
      }
    )
    const contentClass = classnames({
      [styles.marginLeftWide]: !production && !siderFold,
      [styles.marginLeftSmall]: !production && siderFold,
    })

    const { href } = window.location
    if (lastHref !== href) {
      NProgress.start()
      if (!loading.global) {
        NProgress.done()
        lastHref = href
      }
    }

    const headerProps = {
      user,
      menu,
      location,
      siderFold,
      switchSider() {
        dispatch({ type: 'app/switchSider' })
      },
    }

    const siderProps = {
      menu,
      location,
      siderFold,
    }

    if (!jwtToken || !jwtToken.token) {
      return <Loader fullScreen spinning={loading.effects['app/authorize']} />
    }

    return (
      <div>
        {/* <Loader fullScreen spinning={loading.effects['app/query']} /> */}
        <Helmet>
          <title>ai-deep-learning</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          {/* <link rel="icon" href={logo} type="image/x-icon" /> */}
        </Helmet>
        <div className={classStr}>
          <Layout className={styles.dark}>
            <Sider
              className={styles.fixedSider}
              trigger={null}
              collapsible
              collapsed={siderFold}
            >
              {siderProps.menu.length === 0 ? null : <MyLayout.Sider {...siderProps} />}
            </Sider>
            <Layout style={{ minHeight: '100vh' }} id="mainContainer">
              <BackTop target={() => document.getElementById('mainContainer')} />
              <Header {...headerProps} />
              <Content className={contentClass}>
                {children}
              </Content>
              <Footer >
                {footerText}
              </Footer>
            </Layout>
          </Layout>
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ app, loading }) => ({ app, loading })

export default withRouter(connect(mapStateToProps)(App))
