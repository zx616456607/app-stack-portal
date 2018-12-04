/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * index.tsx page
 *
 * @author zhangtao
 * @date Wednesday October 31st 2018
 */
import * as React from 'react'
import { Popover, Tooltip } from 'antd'
import styles from './styles/index.less'
import { Copy as CopyIcon } from '@tenx-ui/icon'

interface ImagePopCardProps {
  addressList: string[];
}

interface ImagePopCardState {
  show: boolean;
}

export default class ImagePopCard extends React.Component<ImagePopCardProps, ImagePopCardState> {
  state = {
    show: false,
  }
  showPop = () => {
    const { show } = this.state
    this.setState({
      show: !show,
    })
  }
  onClick = (e) => {
    e.stopPropagation()
  }
  render() {
    return (
      <div className="ImagePopCard">
      {
        this.props.addressList.length === 0 ?
        <span>-</span> :
        <div onClick={this.onClick}>
        <Popover
          placement="right"
          content={<CopyList addressList={this.props.addressList}/>}
          trigger="click"
          onVisibleChange={this.showPop}
          arrowPointAtCenter
          getTooltipContainer={(node) => node as HTMLElement}
        // getTooltipContainer=
        // {(triggerNode) => triggerNode}
        >
        <span className={styles.checkAddress} >查看镜像地址</span>
        </Popover>
        </div>
      }
    </div>
    )
  }
}

interface CopyListProps {
  addressList: string[];
}

interface CopyListState {
  copyStatus: boolean
}

class CopyList extends React.Component<CopyListProps, CopyListState> {
  state = {
    copyStatus: false,
  }
  copyCode = (e) => {
    const code = document.getElementById(styles.input)
    code.select();
    document.execCommand('Copy', false);
    this.setState({
      copyStatus: true,
    });
  }
  startCopyCode = (address) => {
    const code = document.getElementById(styles.input)
    code.value = address;
  }
  returnDefaultTooltip = () => {
    setTimeout(
      () => this.setState({
        copyStatus: false,
      }), 500,
    )
  }
  render() {
    return (
      <div>
        <input
          style={{ position: 'absolute', opacity: 0, height: 0 }}
          id={styles.input}
        />
        {
          this.props.addressList.map(address => {
            return (<div key={address} className={styles.CopyList}>
              <span>{address}</span>
              <Tooltip title={this.state.copyStatus === false ? '点击复制' : '复制成功'} >
              <CopyIcon
                className={styles.marginCopy}
                onClick={this.copyCode}
                onMouseEnter={() => this.startCopyCode(address)}
                onMouseLeave={this.returnDefaultTooltip}
              />
              </Tooltip>
            </div>)
          })
        }
      </div>
    )
  }
}
