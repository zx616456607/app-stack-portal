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
// const SpriteLoaderPlugin = require('svg-sprite-loader/plugin')
const tsImportPluginFactory = require('ts-import-plugin')
const { site } = require('./config')
const env = process.env

module.exports = webpackConfig => {
  const production = env.NODE_ENV === 'production'
  if (production) {
    /* webpackConfig.plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false,
      })
    ) */
  }

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
    // add svg support
    // if (String(rule.loader).indexOf('url-loader') > -1) {
    //   rule.exclude.push(/\.svg$/)
    // }
  })

  // webpackConfig.module.rules = ([
  //   {
  //     test: /\.svg$/,
  //     use: [
  //       {
  //         loader: 'svg-sprite-loader',
  //         options: {
  //           extract: true,
  //           // esModule: false,
  //           // spriteFilename: `sprite.${svgHash}.svg`,
  //           spriteFilename: 'sprite.[hash:8].svg',
  //           runtimeGenerator: require.resolve('./svg_runtime_generator'),
  //         },
  //       },
  //       {
  //         loader: 'svgo-loader',
  //         options: {
  //           plugins: [
  //             { removeTitle: true },
  //             { removeStyleElement: true },
  //             { removeAttrs: { attrs: 'path:fill' } },
  //           ],
  //         },
  //       },
  //     ],
  //   },
  // ]).concat(webpackConfig.module.rules)

  webpackConfig.plugins = webpackConfig.plugins.concat([
    // new SpriteLoaderPlugin(),
    // new webpack.DefinePlugin({
    //   'process.env': {
    //     NODE_ENV: JSON.stringify(env.NODE_ENV),
    //   },
    // }),
    new webpack.BannerPlugin({
      banner: `Licensed Materials - Property of ${site}\n(C) Copyright 2018 ${site}. All Rights Reserved.\nhttps://${site}`,
      exclude: /\.svg$/,
    }),
  ])

  /* webpackConfig.resolve.alias = Object.assign(
    {},
    webpackConfig.resolve.alias,
    {
      '@': path.resolve(__dirname, 'src'),
    }
  ) */

  return webpackConfig
}
