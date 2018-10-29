/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * model of task templates
 *
 * @author songsz
 * @date 2018-04-09
 */

import {
  getClusters,
  getProjectMembers,
  getImages,
  getHarborProjects,
  getHarborProjectImages,
  getHarborImageTags,
  getHarborImageConfig,
  getDockerRegistry,
} from '../services/paas'

export default {
  namespace: 'paas',
  state: {
    clusters: [],
    projectMembers: [],
    harborImageConfig: {},
    images: [],
    harborProjects: [],
    dockerRegistry: [],
  },

  reducers: {
    saveClusters(state, { payload: { clusters } }) {
      const isBuilderClusters = clusters.filter(item => item.isBuilder)
      return { ...state, clusters: isBuilderClusters }
    },
    saveProjectMembers(state, { payload: { projectMembers } }) {
      return { ...state, projectMembers }
    },
    saveImages(state, { payload: { images } }) {
      return { ...state, images }
    },
    saveHarborProjects(state, { payload: { harborProjects } }) {
      return { ...state, harborProjects }
    },
    saveHarborServer(state, { payload: { harborServer } }) {
      return { ...state, harborServer }
    },
    saveHarborProjectImages(state, { payload: { harborProjectImages } }) {
      return { ...state, harborProjectImages }
    },
    saveHarborImageTags(state, { payload: { harborImageTags } }) {
      return { ...state, harborImageTags }
    },
    saveHarborImageConfig(state, { payload: { harborImageConfig } }) {
      return { ...state, harborImageConfig }
    },
    saveDockerRegistry(state, { payload: { dockerRegistry } }) {
      return { ...state, dockerRegistry }
    },
  },

  effects: {
    * getClusters(_, { call, put }) {
      const res = yield call(getClusters)
      if (res.clusters) {
        yield put({
          type: 'saveClusters',
          payload: {
            clusters: res.clusters || [],
          },
        })
      }
    },
    * getProjectMembers({ payload }, { call, put }) {
      const res = yield call(getProjectMembers, payload)
      if (res.data) {
        yield put({
          type: 'saveProjectMembers',
          payload: {
            projectMembers: res.data || [],
          },
        })
      }
    },
    * getImages({ payload }, { call, put }) {
      const res = yield call(getImages, payload)
      if (res.results) {
        yield put({
          type: 'saveImages',
          payload: {
            images: res.results || [],
          },
        })
      }
    },
    * fetchHarborProjects(_, { call, put }) {
      const res = yield call(getHarborProjects)
      if (res.data) {
        yield put({
          type: 'saveHarborProjects',
          payload: {
            harborProjects: res.data || [],
          },
        })
        yield put({
          type: 'saveHarborServer',
          payload: {
            harborServer: res.server,
          },
        })
      }
      return res
    },
    * fetchHarborProjectImages({ payload: { query } }, { call, put }) {
      yield put({ type: 'saveHarborImageTags', payload: { harborProjectImages: [] } })
      const res = yield call(getHarborProjectImages, { query })
      if (res.data) {
        yield put({
          type: 'saveHarborProjectImages',
          payload: {
            harborProjectImages: res.data || [],
          },
        })
      }
      return res
    },
    * fetchHarborImageTags({ payload: { fullName } }, { call, put }) {
      yield put({ type: 'saveHarborImageTags', payload: { harborImageTags: [] } })
      const res = yield call(getHarborImageTags, { fullName })
      if (res.data) {
        yield put({
          type: 'saveHarborImageTags',
          payload: {
            harborImageTags: res.data || [],
          },
        })
      }
      return res
    },
    * fetchHarborImageConfig({ payload: { fullName, tag } }, { call, put }) {
      yield put({ type: 'saveHarborImageConfig', payload: { harborImageConfig: {} } })
      const res = yield call(getHarborImageConfig, { fullName, tag })
      if (res.data) {
        yield put({
          type: 'saveHarborImageConfig',
          payload: {
            harborImageConfig: res.data || {},
          },
        })
      }
      return res
    },
    * fetchDockerRegistry(_, { call, put }) {
      const res = yield call(getDockerRegistry)
      if (res.data) {
        yield put({
          type: 'saveDockerRegistry',
          payload: {
            dockerRegistry: res.data || [],
          },
        })
      }
      return res
    },
  },
}
