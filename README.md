# app-stack-portal
Portal for app stack.

## 开发构建

### 目录结构

```bash
├── /dist/           # 项目输出目录
├── /public/         # 公共文件
├── /mock/           # 数据 mock
├── /config/         # 项目配置目录
│ ├── /index.js      # 项目常规配置
├── /src/            # 项目源码目录
│ ├── /assets/       # 静态文件（组件中需要用到的静态文件都从此引入）
│ │ ├── /img/        # 图片
│ │ ├── /lib/        # 库
│ │ └── /style/      # 样式
│ │ │ ├── /cors/     # 网站整体风格定义
│ │ │ └── /custom.less     # 项目常规配置
│ │ │ └── /index.less     # 项目常规配置
│ ├── /components/   # UI 组件及 UI 相关方法
│ │ ├── skin.less    # 全局样式
│ │ └── vars.less    # 全局样式变量
│ ├── /containers/   # 容器组件
│ │ └── App.js       # 顶级组件
│ ├── /models/       # 数据模型
│ ├── /services/     # 数据接口
│ ├── /selectors/    # reselect
│ ├── /utils/        # 工具函数
│ │ ├── index.js     # 常用工具
│ │ └── request.js   # 异步请求函数
│ ├── router.js      # 路由配置
│ ├── index.js       # 入口文件
│ └── index.ejs      # html 模版
├── package.json     # 项目信息
├── .eslintrc        # eslint 配置
└── .webpackrc       # roadhog 配置
```

文件夹命名说明:

-   components：组件（方法）为单位以文件夹保存，文件夹名组件首字母大写（如`DataTable`），方法首字母小写（如`layer`）, 文件夹内主文件以 `index.js` 命名，多文件在 `index.js` 中导出对象。
-   containers：页面为单位以文件夹保存，文件夹名首字母大写,文件夹内主文件以 `index.js` 导出，如果有子路由，依次按照路由层次建立文件夹。

### 快速开始

克隆项目文件:

```bash
git clone git@gitlab.tenxcloud.com:enterprise-2.0/app-stack-portal.git
```

进入目录安装依赖:

```bash
npm i
# or
yarn install
```

编辑配置文件：
```bash
cp src/utils/config.sample.js src/utils/config.js
```

开发：

```bash
npm run dev
# or
yarn dev
```

构建：

```bash
npm run build
# or
yarn build
```

代码检测：

```bash
npm run lint
```

### 错误处理 🙅🙅‍🙅‍

- 错误提示统一使用 `antd` 中的 `notification` 组件，而且不能使用 `notification.error`，提示给用户的错误最高级别为 `warn`。

- 在 `dva` 中 `model` 层只做数据交互，不要涉及 `view` 层相关操作，例如错误弹出等，`model` 层的错误最好不要 `catch`，让它正常抛出，这样才能被全局错误处理函数捕获。

#### 1. 全局错误处理：

例如 token 过期、没有权限等错误需要在全局捕获并处理：

```js
// 1. Initialize
const app = dva({
  history: createHistory(),
  // 🙅 handle global error here
  onError(e) {
    const { status, response = {} } = e
    // [global] handle token expired
    if (status === 401 && response.err === 'User is not authorized. Authorization, token are required.') {
      message.warn('您的登录状态已失效，请登录后继续当前操作')
      e.preventDefault()
      return
    }
    // message.warn(e.status + ' ' + e.message)
  },
})
```

全局的错误处理统一在 `./src/index.js` 文件中处理，使用 `dva` 提供的 `onError` 函数。

#### 2. `action` 中的错误处理：

原则上每个 `action` 都需要使用 `try catch` 来捕获 api 返回的错误，并将错误信息提示给用户：

```js
// use trycatch
loadHarborProject = async () => {
  const { dispatch } = this.props
  try {
    await dispatch({
      type: 'paas/fetchHarborProjects',
    })
  } catch (error) {
    notification.warn({
      message: '加载仓库组出错',
    })
  }
}
// or use promise catch
loadHarborProject = async () => {
  const { dispatch } = this.props
  dispatch({
    type: 'paas/fetchHarborProjects',
  }).catch(() => {
    notification.warn({
      message: '加载仓库组出错',
    })
  })
}
```

### 常见样式书写
#### 1.按钮 + 列表

![img](/public/doc/page.png)

```html
<Page>
  <QueueAnim>
    <div className="layout-content-btns" key="btns">
      <Button type={'primary'} icon="plus">新建流水线</Button>
      <Button icon="reload" >刷新</Button>
      <Search className="search-style" placeholder={'请输入名称关键词搜索'} />
      <Pagination showTotal={total => `共计${total}条`} size={'small'} />
    </div>
    <Card key="body">
      <Table pagination={false} />
    </Card>
  </QueueAnim>
</Page>
```

需要注意一下几点：

- 最外层统一使用 `Page` 组件
- 进场动画统一使用 `QueueAnim`，注意 `QueueAnim` 下的子组件必须有 `key` 属性，且不能重复，否则没有动画效果
- `.layout-content-btns`, `.search-style` 均为内置样式，可以直接引用，且 `.layout-content-btns` 中对分页组件的样式做了复写，所以这里直接写 `Pagination` 就好了
- 由于分页组件需要统一放在右上角，所以需要我们禁用掉 `Table` 组件的分页，单独写一个 `Pagination`
- 列表为 `Table` 外面套了一个 `Card`，边距等样式已经被统一复写，这里不需要额外的处理


