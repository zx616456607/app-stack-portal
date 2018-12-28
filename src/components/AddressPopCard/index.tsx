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

interface AddressNode {
  name: string;
  protocol: string
}
interface AddressPopCardProps {
  addressList: AddressNode[];
}

interface AddressPopCardState {
  show: boolean;
}

export default class AddressPopCard extends React.Component<AddressPopCardProps, AddressPopCardState> {
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
      <div className="AddressPopCard" onClick={this.onClick}>
      {
        this.props.addressList.length === 0 ?
        <span>-</span> :
        <Popover
          placement="right"
          content={<CopyList addressList={this.props.addressList} inputShow={this.state.show}/>}
          trigger="click"
          onVisibleChange={this.showPop}
          arrowPointAtCenter
        // getTooltipContainer=
        // {(triggerNode) => triggerNode}
        >
          <span className={styles.checkAddress}>查看地址</span>
        </Popover>
      }
    </div>
    )
  }
}

interface CopyListProps {
  addressList: AddressNode[];
  inputShow: boolean
}

interface CopyListState {
  copyStatus: boolean
}

class CopyList extends React.Component<CopyListProps, CopyListState> {
  state = {
    copyStatus: false,
  }
  inputID = Math.random()
  copyCode = (e) => {
    const code = document.getElementById('__AddressPopCardInput')
    code.select();
    document.execCommand('Copy', false);
    this.setState({
      copyStatus: true,
    });
  }
  startCopyCode = (address) => {
    const code = document.getElementById('__AddressPopCardInput')
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
        { this.props.inputShow &&
        <input
          style={{ position: 'absolute', opacity: 0, height: 0 }}
          id="__AddressPopCardInput"
        />}
        {
          this.props.addressList.map(({ name: address, protocol }) => {
            return (<div key={address} className={styles.CopyList}>
              <span>{address}</span>
              <ProtocolIcon protocol={protocol}/>
              <Tooltip title={this.state.copyStatus === false ? '点击复制' : '复制成功'} >
              <CopyIcon
                className={styles.marginCopy}
                onClick={this.copyCode}
                onMouseEnter={() => this.startCopyCode(address)}
                onMouseLeave={this.returnDefaultTooltip}
              />
              </Tooltip>
            </div>)
          })}
      </div>
    )
  }
}

function ProtocolIcon({ protocol }) {
  let text = 'N'
  if (protocol === 'HTTP') {
    text = 'H'
  }
  if (protocol === 'TCP') {
    text = 'T'
  }
  if (protocol === 'UDP') {
    text = 'U'
  }
  return(
    <React.Fragment>
      {
        text !== 'N' &&
        <span className={styles.protocolIcon}>
          {text}
        </span>
      }
    </React.Fragment>
  )
}
