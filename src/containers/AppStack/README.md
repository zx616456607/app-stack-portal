## 如何在堆栈编排添加新元素？

1. 首先在 `./Designer/shapes` 中增加对应元素，示例 `_ShapeTemplate`
2. 在 `/public/designer/svg` 中增加一个与元素 `type` 同名的 svg 文件作为元素的图标，同时也要在 @tenx-ui/icon 中增加对应的图标，**注意图标均为双色图标**。
3. 然后在 `./Designer/shapes/_utils.js` `RESOURCE_LIST` 变量中增加对应元素
4. 部署堆栈页面 `./Template/Deploy/index.js`，在变量 `ELEMENT_KIND_INPUT_MAP` 中添加新元素的错误提醒
5. 如果添加的元素为工作负载类型，则需要在堆栈列表页面 `./StackApps/index.js`，`WORKLOAD_COUNT_KEY_FILED_MAP` 变量中添加对应的统计数据
6. 堆栈详情页面变量 `ELEMENT_KEY_KIND_MAP` 中添加对应元素 map，涉及两个 tab：
    - 堆栈元素 tab `./StackApps/StackAppsDetail/StackElements/index.js`
    - 全链路监控 tab `./StackApps/StackAppsDetail/ResourceTopology/index.js`
