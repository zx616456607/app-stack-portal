import { PIPELINE } from './src/services/constants'

export default {
  'GET /api/v2/devops/ci-pipelines': {"status":200,"message":"Get pipeline success","results":{"pageNum":1,"pageSize":2,"total":9,"result":[{"pipeline_id":"PLID-HkiN-BjqM","activate_enabled":1,"name":"24567","owner":"wanglei","namespace":"wanglei","notification_config":"{\"email_list\":[\"test@tenxcloud.com\"],\"pipeline_build_result_config\":{\"success_notification\":true,\"failed_notification\":false}}","pipeline_ci_config":"","create_time":"2018-03-30T05:16:34.000Z","project_id":"MPID-rJhEdQWdG","repo_type":"gitlab","default_branch":"master","address":"git@gitlab.tenxcloud.com:wanglei/bookstore-sample.git","nextBuildTime":null,"last_build_id":null,"last_build_time":null,"status":null,"triggered_info":null},{"pipeline_id":"PLID-B1-MwBoqG","activate_enabled":1,"name":"svn-edit","owner":"wanglei","namespace":"wanglei","notification_config":"{\"email_list\":[\"wanglei@tenxcloud.com\"],\"pipeline_build_result_config\":{\"success_notification\":true,\"failed_notification\":false}}","pipeline_ci_config":"","create_time":"2018-03-30T05:11:43.000Z","project_id":"MPID-Bkhj-1_zb","repo_type":"svn","default_branch":"","address":"http://code.taobao.org/svn/svn-public","nextBuildTime":null,"last_build_id":null,"last_build_time":null,"status":null,"triggered_info":null}]}},
  'POST /api/v2/devops/ci-pipelines': {
    "status": 200,
    "results": {
      "pipeline_id": "CIPID-Bk4Lno-YM"
    },
    "message": "Pipeline created successfully"
  },
  'GET /api/v2/devops/ci-pipelines/pipeline_id/stages': {
    "status": 200,
    "message": "Get pipeline stage success",
    "results": [{
      "pipeline_id": "PLID-rJdvCtP5M",
      "build_type": 1,
      "flow_id": "CIFID-BkH9PYkKM",
      "owner": "zhangmingli",
      "namespace": "zhangmingli",
      "init_type": 1,
      "create_time": "2018-03-27T10:26:35.000Z",
      "update_time": null,
      "seq": 1,
      "stages": [{
        "metadata": {
          "name": "1werty",
          "id": "CISID-HJ6-og6Fz",
          "creationTime": "2018-03-19T08:57:25.000Z",
          "type": 3
        },
        "spec": {
          "container": {
            "args": [],
            "env": [],
            "dependencies": [],
            "errorContinue": 0,
            "image": "tenx_containers/image-builder:v2.2"
          },
          "ci": {
            "enabled": 0,
            "config": {
              "buildCluster": "CID-90eb6ec7b55a"
            }
          },
          "project": {
            "id": "MPID-SyfZimHtf",
            "branch": "master"
          },
          "build": {
            "DockerfileFrom": 1,
            "registryType": 1,
            "imageTagType": 1,
            "noCache": false,
            "image": "asdf",
            "project": "summer",
            "projectId": 77,
            "DockerfilePath": "/",
            "DockerfileName": "Dockerfile"
          }
        }
      },
        {
          "metadata": {
            "name": "air-control",
            "id": "CISID-SJ-gIo1tM",
            "creationTime": "2018-03-09T06:13:03.000Z",
            "type": 3
          },
          "spec": {
            "container": {
              "args": [],
              "env": [],
              "dependencies": [],
              "errorContinue": 0,
              "image": "node:7.9.0"
            },
            "ci": {
              "enabled": 0,
              "config": {
                "buildCluster": "CID-90eb6ec7b55a"
              }
            },
            "project": {
              "id": "MPID-HJfVnDR-M",
              "branch": null
            },
            "build": {
              "DockerfileFrom": 1,
              "registryType": 1,
              "imageTagType": 2,
              "noCache": false,
              "image": "air-image",
              "project": "summer",
              "projectId": 77,
              "DockerfilePath": "/",
              "DockerfileName": "Dockerfile"
            }
          }
        },
        {
          "metadata": {
            "name": "led-control",
            "id": "CISID-B1lzqKktG",
            "creationTime": "2018-03-09T04:13:59.000Z",
            "type": 4
          },
          "spec": {
            "container": {
              "args": [],
              "env": [],
              "dependencies": [],
              "errorContinue": 0,
              "image": "tenx_containers/java-maven:8.3"
            },
            "ci": {
              "enabled": 0,
              "config": {
                "buildCluster": "CID-90eb6ec7b55a"
              }
            }
          }
        },
        {
          "metadata": {
            "name": "qqqq",
            "id": "CISID-SJibXTOKG",
            "creationTime": "2018-03-16T04:08:07.000Z",
            "type": 3
          },
          "spec": {
            "container": {
              "args": [],
              "env": [],
              "dependencies": [],
              "errorContinue": 0,
              "image": "tenx_containers/image-builder:v2.2"
            },
            "ci": {
              "enabled": 0,
              "config": {
                "buildCluster": "CID-90eb6ec7b55a"
              }
            },
            "project": {
              "id": "MPID-HJfVnDR-M",
              "branch": null
            },
            "build": {
              "DockerfileFrom": 1,
              "registryType": 1,
              "imageTagType": 1,
              "noCache": false,
              "image": "qqqq",
              "project": "summer",
              "projectId": 77,
              "DockerfilePath": "/",
              "DockerfileName": "Dockerfile"
            }
          }
        }
      ]
    }]
  }

};
