/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * detail.tsx page
 *
 * @author zhangtao
 * @date Friday December 14th 2018
 */
import * as React from 'react'
import { Drawer } from 'antd'
import Dock from 'react-dock'
import { connect } from 'dva'
import Monitor from './Monitor'
import styles from './styles/detail.less'

function mapStateToProps(state) {
  return {}
}

interface DetailProps {
  isVisible: boolean,
  cancelDock: () => void;
  pods: any[];
  getContainer?: any;
}

interface DetailState {
  loading: boolean
}

@connect(mapStateToProps)
export default  class Detail extends React.Component<DetailProps, DetailState> {
  state = {
    loading: false,
  }
  render () {
    return(
      // <Dock
      //   fluid={false}
      //   position={'right'}
      //   defaultSize={800}
      //   isVisible={this.props.isVisible}
      //   onVisibleChange={this.props.cancelDock}
      // >
      // <div className={styles.MonitorWrap}>
      //   <div className={styles.header} >监控信息</div>
      //   {
      //     this.props.isVisible &&
      //   <Monitor
      //     pods={this.props.pods}
      //   />
      //   }
      // </div>
      // </Dock>
        <Drawer
          placement="right"
          closable={false}
          onClose={this.props.cancelDock}
          visible={this.props.isVisible}
          width={'75%'}
          mask={false}
          getContainer={this.props.getContainer}
        >
                <div className={styles.MonitorWrap}>
        <div className={styles.header} >监控信息</div>
        {
          this.props.isVisible &&
        <Monitor
          pods={this.props.pods}
        />
        }
      </div>
        </Drawer>
    )
  }
}
