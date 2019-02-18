import * as React from 'react'
import ResourceBanner from '@tenx-ui/resourcebanner'
import '@tenx-ui/resourcebanner/assets/index.css'
import { paasApiUrl } from '../../utils/config'
import get from 'lodash/get'
import { connect } from 'dva'

export const push = to => {
  if (window.parent.appStackIframeCallBack) {
    window.parent.appStackIframeCallBack('redirect', { pathname: to })
  }
}

const UnifiedLink = props => {
  const { to, children, ...otherProps } = props
  return <a onClick={() => push(to)} {...otherProps}>{children}</a>
}

interface ResourceBannerProps {
    resourceType: string[]
    clusterID: string
    namespace: string
    role: string
}

function mapStateToProps(state) {
    const role =  get(state, [ 'app', 'user', 'role' ])
    const clusterID = get(state, [ 'app', 'cluster' ])
    const namespace = get(state, [ 'app', 'project' ])
    return { role, clusterID, namespace }
  }

class ResourceBannerW extends React.Component<ResourceBannerProps, any> {
 render() {
     return(
        <ResourceBanner
          config={{ paasApiUrl }}
          clusterID={this.props.clusterID}
          resourceType={this.props.resourceType}
          namespace={this.props.namespace}
          role={this.props.role}
          Link={(props) => { return <UnifiedLink {...props}>{props.children}</UnifiedLink> }}
        >
          {this.props.children}
        </ResourceBanner>
     )
 }
}

export default (connect(mapStateToProps)(ResourceBannerW) as any)
