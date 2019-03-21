/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * App webpack dev config
 *
 * v0.1 - 2018-03-22
 * @author Zhangpc
 */
const env = process.env
const isProd = env.NODE_ENV === 'production'
const publicDir = isProd ? '/app-stack/' : '/'
const path = require('path')

export default {
  entry: 'src/index.js',
  theme: {
    '@primary-color': '#2db7f5',
    '@success-color': '#5cb85c',
    '@warning-color': '#ffbf00',
    '@error-color': '#f85a5a',
    '@a-hover-color': '#57cfff',
    '@font-size-base': '12px',
  },
  browserslist: [
    'last 8 Chrome versions',
    'last 4 Firefox versions',
    'last 3 Safari versions',
    'last 4 Edge versions',
    'Firefox ESR',
    'Chrome >= 55'
  ],
  html: {
    template: './src/index.ejs',
  },
  publicPath: publicDir,
  outputPath: `./dist${publicDir}`,
  hash: true,
  ignoreMomentLocale: true,
  es5ImcompatibleVersions: true,
  extraBabelIncludes: [
    'node_modules/strict-uri-encode',
    "node_modules/url-parse-lax",
    "node_modules/is-ip",
    "node_modules/ip-regex",
  ],
  extraBabelPlugins: [
    [
      'import',
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
      },
      'antd',
    ],
    [
      'import',
      {
        libraryName: '@tenx-ui/icon',
        libraryDirectory: 'es',
        camel2DashComponentName: false,
      },
      '@tenx-ui/icon',
    ],
  ],
  alias: {
    '@': path.resolve(__dirname, 'src'),
    'query-string': path.resolve(__dirname, 'src/assets/lib/query-string'),
  },
  env: {
    development: {
      extraBabelPlugins: [
        'dva-hmr',
      ],
    },
    production: {
      extraBabelPlugins: [
        'transform-react-remove-prop-types',
      ],
    },
  },
  define: {
    'process.env.NODE_ENV': env.NODE_ENV,
    'process.env.PUBLIC_DIR': publicDir,
  },
}
