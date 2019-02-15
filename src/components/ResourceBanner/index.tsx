import * as React from 'react'
import ResourceBanner from '@tenx-ui/resourcebanner'
import '@tenx-ui/resourcebanner/assets/index.css'
import { paasApiUrl } from '../../utils/config'
import get from 'lodash/get'
import { connect, SubscriptionAPI } from 'dva'
import Link from '../UnifiedLink'

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
          Link={(props) => { return <Link {...props}>{props.children}</Link> }}
        >
          {this.props.children}
        </ResourceBanner>
     )
 }
}

export default (connect(mapStateToProps)(ResourceBannerW) as any)
