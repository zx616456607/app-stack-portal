/**
 *
 * Job container
 *
 * @author Songsz
 * @date 2018-10-29
 *
*/

import * as React from 'react'
import { connect, SubscriptionAPI } from 'dva'

interface EventProps extends SubscriptionAPI {
  cluster: string;
  name: string;
}

class Event extends React.Component<EventProps, {}> {
  async componentDidMount() {
    const payload = { cluster: this.props.cluster, name: this.props.name }
    const res = await this.props.dispatch({ type: 'nativeDetail/getPodEvent', payload })
  }
  render() {
    return(
      <div>fuck</div>
    )
  }
}

function mapStateToProps(state) {
  const { app: { cluster = '' } = {} } = state
  const { nativeDetail: { name = '' } = {} } = state
  return { cluster, name }
}
export default connect(mapStateToProps)(Event)
