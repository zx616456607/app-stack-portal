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
const webpack = require('webpack')
const tsImportPluginFactory = require('ts-import-plugin')
const { site } = require('./config')
const env = process.env

module.exports = webpackConfig => {
  const production = env.NODE_ENV === 'production'
  if (production) {
    webpackConfig.entry = {
      main: [
        './src/index.js',
      ],
      vendor: [
        '@antv/data-set',
        'bizcharts',
        'brace',
        'classnames',
        'rc-queue-anim',
      ],
    }
  }
  webpackConfig.plugins.push(new webpack.optimize.CommonsChunkPlugin({
    name: [ 'vendor' ],
    minChunks: Infinity,
  }))
  webpackConfig.module.rules.forEach(rule => {
    // add babel-import-plugin TypeScript Implement support
    if (String(rule.test).indexOf('ts|tsx') > -1) {
      rule.use.forEach(ruleItem => {
        if (String(ruleItem.loader).indexOf('awesome-typescript-loader') > -1) {
          ruleItem.options.getCustomTransformers = () => ({
            before: [
              tsImportPluginFactory([
                {
                  libraryName: 'antd',
                  libraryDirectory: 'es',
                },
                {
                  libraryName: '@tenx-ui/icon',
                  libraryDirectory: 'es',
                  camel2DashComponentName: false,
                },
              ]),
            ],
          })
        }
      })
    }
  })

  webpackConfig.plugins = webpackConfig.plugins.concat([
    new webpack.BannerPlugin({
      banner: `Licensed Materials - Property of ${site}\n(C) Copyright 2018 ${site}. All Rights Reserved.\nhttps://${site}`,
      exclude: /\.svg$/,
    }),
  ])

  return webpackConfig
}
