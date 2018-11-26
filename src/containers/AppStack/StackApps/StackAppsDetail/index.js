import React from 'react'
import { Card } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { Stack as StackIcon } from '@tenx-ui/icon'
import styles from './style/index.less'

class StackAppsDetail extends React.Component {
  componentDidMount() {
    // console.log(this.props)
  }
  render() {
    return <QueueAnim
      id="stackAppDetail"
    >
      <Card>
        <div className={styles.detailInfoLeft}>
          <div className={styles.detailIcon}>
            <StackIcon/>
          </div>
          <div className={styles.detailName}>

          </div>
        </div>
      </Card>
    </QueueAnim>
  }
}

export default StackAppsDetail
