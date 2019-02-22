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
import { BackTop, Layout, notification, ConfigProvider } from 'antd'
// import { footerText } from '../../utils/config'
import { Helmet } from 'react-helmet'
import classnames from 'classnames'
import { withRouter } from 'dva/router'
import './style/App.less'
import contentStyles from './style/content.less'
import { initUnifiedLinkHistory } from '@tenx-ui/utils/es/UnifiedLink'

const { Content, Sider } = Layout
const { Header, styles } = MyLayout

const isPageInIframe = window.self !== window.top
const handleDocMounseDown = () => {
  // 将 iframe 的 mousedown 事件传递给父容器，用来关闭父容器的弹出层等
  const evt = new MouseEvent('mousedown', {
    bubbles: true,
    cancelable: true,
  })
  window.parent.document.dispatchEvent(evt)
}

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
    const { dispatch, history } = this.props
    // ⚠️ 初始化统一的 Link history 后，请使用 `UnifiedLink` 组件以及 `pushHistory` 做跳转 ⚠️
    // 或者也可以通过 `getUnifiedHistory` 拿到统一后的 `history` 对象做相关操作，请不要使用
    // `react-router` 注入到组件 `props` 中的 `history` 对象以及 `dva/router` 中的 `routerRedux` 方法
    initUnifiedLinkHistory(history)
    if (window.parent.iframeCallBack) {
      window.parent.iframeCallBack('history', history)
    }

    if (isPageInIframe) {
      document.addEventListener('mousedown', handleDocMounseDown)
    }

    this.mainContainer = document.getElementById('mainContainer')

    try {
      await dispatch({ type: 'app/authorize' })
    } catch (error) {
      console.warn('authorize error', error)
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

  componentWillUnmount() {
    if (isPageInIframe) {
      document.removeEventListener('mousedown', handleDocMounseDown)
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
          <title>app-stack</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          {/* <link rel="icon" href={logo} type="image/x-icon" /> */}
        </Helmet>
        <div className={classStr}>
          <ConfigProvider
            // prefixCls={'unified-nav'}
          >
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
                <Content className={contentClass} style={{ overflow: 'hidden' }}>
                  {children}
                </Content>
                {/* <Footer >
                  {footerText}
                </Footer> */}
              </Layout>
            </Layout>
          </ConfigProvider>
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ app, loading }) => ({ app, loading })

export default withRouter(connect(mapStateToProps)(App))
