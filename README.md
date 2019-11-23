```
官方文档：https://ssr.vuejs.org/zh/
官方例子：https://github.com/vuejs/vue-hackernews-2.0/
参考博客：https://juejin.im/post/5a50f208f265da3e5132ed91#heading-2
```

# 第一部分 基本介绍
## 1、前言
服务端渲染实现原理机制：在服务端拿数据进行解析渲染，直接生成html片段返回给前端。然后前端可以通过解析后端返回的html片段到前端页面，大致有以下两种形式：
* 服务器通过模版引擎直接渲染整个页面，例如java后端的vm模版引擎，php后端的smarty模版引擎。
* 服务渲染生成html代码块, 前端通过AJAX获取然后使用js动态添加。

## 2、服务端渲染的优劣
服务端渲染能够解决两大问题：
* seo问题，有利于搜索引擎蜘蛛抓取网站内容，利于网站的收录和排名。
* 首屏加载过慢问题，例如现在成熟的SPA项目中，打开首页需要加载很多资源，通过服务端渲染可以加速首屏渲染。

同样服务端渲染也会有弊端，主要是根据自己的业务场景来选择适合方式，由于服务端渲染前端页面，必将会给服务器增加压力。

## 3、vue ssr的实现原理
客户端请求服务器，服务器根据请求地址获得匹配的组件，在调用匹配到的组件返回 Promise (官方是preFetch方法)来将需要的数据拿到。最后再通过
```
<script>window.__initial_state=data</script>
```

接下来客户端会将vuex将写入的 initial_state 替换为当前的全局状态树，再用这个状态树去检查服务端渲染好的数据有没有问题。遇到没被服务端渲染的组件，再去发异步请求拿数据。说白了就是一个类似React的 shouldComponentUpdate 的Diff操作。

Vue2使用的是单向数据流，用了它，就可以通过 SSR 返回唯一一个全局状态， 并确认某个组件是否已经SSR过了。

## 4、vue后端渲染主要插件：vue-server-renderer
由于virtual dom的引入，使得vue的服务端渲染成为了可能，下面是官方 vue-server-renderer提供的渲染流程图:

可以看出vue的后端渲染分三个部分组成：页面的源码（source），node层的渲染部分和浏览器端的渲染部分。


source分为两种entry point,一个是前端页面的入口client entry,主要是实例化Vue对象，将其挂载到页面中；另外一个是后端渲染服务入口server entry,主要是控服务端渲染模块回调，返回一个Promise对象(回调函数中提供vue实例对象)。


前面的source部分就是业务开发的代码，开发完成之后通过 webpack 进行构建，生成对应的bundle，这里不再赘述client bundle,就是一个可在浏览器端执行的打包文件；这里说下server bundle, vue2提供 vue-server-renderer模块，模块可以提供两种render: rendererer/bundleRenderer ,下面分别介绍下这两种render。


renderer接收一个vue对象 ，然后进行渲染，这种对于简单的vue对象,可以这么去做，但是对于复杂的项目，如果使用这种直接require一个vue对象，这个对于服务端代码的结构和逻辑都不太友好，首先模块的状态会一直延续在每个请求渲染请求，我们需要去管理和避免这次渲染请求的状态影响到后面的请求,因此vue-server-renderer提供了另外一种渲染模式，通过一个 bundleRenderer去做渲染。


bundleRenderer是较为复杂项目进行服务端渲染官方推荐的方式，通过webpack以server entry按照一定的要求打包生成一个 server-bundle,它相当于一个可以给服务端用的app的打包压缩文件，每一次调用都会重新初始化 vue对象，保证了每次请求都是独立的，对于开发者来说，只需要专注于当前业务就可以，不用为服务端渲染开发更多的逻辑代码。
renderer生成完成之后，都存在两个接口，分别是renderToString和renderToStream，一个是一次性将页面渲染成字符串文件，另外一个是流式渲染，适用于支持流的web服务器，可以是请求服务的速度更快。


# 第二部分 从零开始搭建
## 1.前言
上一节介绍了vue ssr的基本原理，这节内容我们将从零开始搭建vue ssr渲染脚手架，当然不能不参考官方的实例vue-hackernews-2.0。

## 2、前期准备
拷贝vue-hackernews-2.0的项目，package.json如下所示：
```
  "dependencies": {
    "compression": "^1.7.1",
    "cross-env": "^5.1.1",
    "es6-promise": "^4.1.1",
    "express": "^4.16.2",
    "extract-text-webpack-plugin": "^3.0.2",
    "firebase": "4.6.2",
    "lru-cache": "^4.1.1",
    "route-cache": "0.4.3",
    "serve-favicon": "^2.4.5",
    "vue": "^2.5.22",
    "vue-router": "^3.0.1",
    "vue-server-renderer": "^2.5.22",
    "vuex": "^3.0.1",
    "vuex-router-sync": "^5.0.0"
  },
  "devDependencies": {
    "autoprefixer": "^7.1.6",
    "babel-core": "^6.26.0",
    "babel-loader": "^7.1.2",
    "babel-plugin-syntax-dynamic-import": "^6.18.0",
    "babel-preset-env": "^1.6.1",
    "chokidar": "^1.7.0",
    "css-loader": "^0.28.7",
    "file-loader": "^1.1.5",
    "friendly-errors-webpack-plugin": "^1.6.1",
    "rimraf": "^2.6.2",
    "stylus": "^0.54.5",
    "stylus-loader": "^3.0.1",
    "sw-precache-webpack-plugin": "^0.11.4",
    "url-loader": "^0.6.2",
    "vue-loader": "^15.3.0",
    "vue-template-compiler": "^2.5.22",
    "webpack": "^3.8.1",
    "webpack-dev-middleware": "^1.12.0",
    "webpack-hot-middleware": "^2.20.0",
    "webpack-merge": "^4.2.1",
    "webpack-node-externals": "^1.7.2"
  }
```
* 删除多余依赖：firebase(未使用)

* 删除多余代码和目录，具体操作如下执行：
  * 删除api目录
  * 删除components目录中文件
  * store目录文件
  ```
  //actions.js
  export default {
    
  }
  // getters.js
  export default {
    
  }
  // mutations.js
  export default {
    
  }    
  // index.js
  import Vue from 'vue'
  import Vuex from 'vuex'
  import actions from './actions'
  import mutations from './mutations'
  import getters from './getters'

  Vue.use(Vuex)

  export function createStore () {
    return new Vuex.Store({
      state: {},
      actions,
      mutations,
      getters
    })
  }
  ```
  * router目录文件
  ```
  // index.js
  import Vue from 'vue'
  import Router from 'vue-router'

  Vue.use(Router)
  export function createRouter () {
    return new Router({
      mode: 'history',
      fallback: false,
      scrollBehavior: () => ({ y: 0 }),
      routes: []
    })
  }
  ```
  * 删除views目录中文件
  * App.vue文件：删除多余路由跳转
  ```
  <template>
  <div id="app">
    <header class="header">
      <nav class="inner">
        <router-link to="/" exact>
          <img class="logo" src="~public/logo-48.png" alt="logo">
        </router-link>
        <a class="github" href="https://github.com/vuejs/vue-hackernews-2.0" target="_blank" rel="noopener">
          Built with Vue.js
        </a>
      </nav>
    </header>
    <transition name="fade" mode="out-in">
      <router-view class="view"></router-view>
    </transition>
  </div>
  ...其它代码
  </template>
  ```

  * entry-client.js，重点解释一下，若全部注释，客户端便不会通过vue来接管服务器返回的页面，浏览器支持性较好，但vue代码限制较多，只有beforeCreate和created会在服务器端渲染(SSR)过程中被调用，其它都为无用代码。浏览器接管vue，则注释ProgressBar代码
  ```
  // import ProgressBar from './components/ProgressBar.vue'

  // global progress bar
  //const bar = Vue.prototype.$bar = new Vue(ProgressBar).$mount()
  //document.body.appendChild(bar.$el)
  ...其它代码
  //bar.start()
    Promise.all(asyncDataHooks.map(hook => hook({ store, route: to })))
      .then(() => {
        //bar.finish()
        next()
      })
      .catch(next)
  ...其它代码
  ```

  * server.js
  ```
  ...其它代码
  // 注释此行未用到的功能
  // app.use('/service-worker.js', serve('./dist/service-worker.js'))
  ...其它代码
  ```

  * build目录文件
  ```
  // webpack.client.config.js
  ...其它代码
  // 注释firebase用到的api
  // resolve: {
  //   alias: {
  //     'create-api': './create-api-client.js'
  //   }
  // },
  ...其它代码
  // 注释service-work.js代码
  // if (process.env.NODE_ENV === 'production') {
  //   config.plugins.push(
  //     // auto generate service worker
  //     new SWPrecachePlugin({
  //       cacheId: 'vue-hn',
  //       filename: 'service-worker.js',
  //       minify: true,
  //       dontCacheBustUrlsMatching: /./,
  //       staticFileGlobsIgnorePatterns: [/\.map$/, /\.json$/],
  //       runtimeCaching: [
  //         {
  //           urlPattern: '/',
  //           handler: 'networkFirst'
  //         },
  //         {
  //           urlPattern: /\/(top|new|show|ask|jobs)/,
  //           handler: 'networkFirst'
  //         },
  //         {
  //           urlPattern: '/item/:id',
  //           handler: 'networkFirst'
  //         },
  //         {
  //           urlPattern: '/user/:id',
  //           handler: 'networkFirst'
  //         }
  //       ]
  //     })
  //   )
  // }
    ...其它代码

  // webpack.server.config.js
    ...其它代码
  // 注释firebase用到的api
  // resolve: {
  //   alias: {
  //     'create-api': './create-api-client.js'
  //   }
  // },
    ...其它代码
  ```

* 安装依赖
```
npm install
```

* 执行npm run dev将项目跑起来
```
npm run dev
```

此时输入地址，会返回404,因为前面我们将路由全部删除了，下面我们就一个简单的路由配置实现ssr的数据和路由的交互。

# 第三部分 Hello World功能搭建
## 路由配置
* 在views目录下，新建一个index.vue文件，代码如下所示:
```
<template>
    <div>
        Hello World, 你访问的路由为： {{ path }} 
    </div>
</template>

<script>
export default {
    computed: {
        path () {
            return this.$store.state.path
        }
    },
    // 获取自身路由所需要的数据
    asyncData ( { route, store } ) {
        return store.dispatch('SET_PATH', route.path)
    }
}
</script>
```

* 配置router路由
```
// index.js
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
export function createRouter () {
  return new Router({
    mode: 'history',
    fallback: false,
    scrollBehavior: () => ({ y: 0 }),
    routes: [{
      path: '*',
      components: require('../views/index.vue')
    }]
  })
}

```

* store中state增加path及action、mutation方法
```
// index.js
import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'

Vue.use(Vuex)

export function createStore () {
  return new Vuex.Store({
    state: {
      path: '',
    },
    actions,
    mutations,
    getters
  })
}

// action.js
export default {
    SET_PATH: ({ commit }, path) => {
        // TODO:此处可在服务器上调用其它api获取数据
        commit('SET_PATH', path)
        return Promise.resolve()
    }
}
// mutations.js
export default {
    SET_PATH: (state, path) => {
        state.path = path
    }
}
```

这样你就能访问到一个页面，上面只是一个简单的例子，你可以根据自己的需求进行完善。

## sass配置
由于个人习惯使用sass，此处将webpack进行sass配置
* 创建assets/styles/index.scss文件，作为scss的全局入口

* 修改webpack.base.config.js，添加sass配置
```
    // 其它代码...
    rules: [
      {
        test: /\.(css|scss)$/,
        use: isProd
        ? ExtractTextPlugin.extract({
            fallback: 'vue-style-loader',
            use: ['css-loader', 'sass-loader', {
                  loader: 'sass-resources-loader',
                  options: {
                    resources: [path.resolve(__dirname, '../src/assets/styles/index.scss')]
                  }
                }
            ],
          })
        : ['vue-style-loader', 'css-loader', 'sass-loader', {
              loader: 'sass-resources-loader',
              options: {
                  resources: [path.resolve(__dirname, '../src/assets/styles/index.scss')]
              }
          }]
      }
    ]
```

* 安装依赖,sass-loader使用^7.3.1,使用8.0.0会出现不兼容问题
```
npm install sass-loader sass-resources-loader node-sass --save-dev 
```

在index.vue中引入scss,检查是否存在问题
```
<template>
    <div class="visit">
        Hello World, 你访问的路由为： {{ path }} 
    </div>
</template>

<script>
export default {
    computed: {
        path () {
            return this.$store.state.path
        }
    },
    asyncData ( { route, store } ) {
        return store.dispatch('SET_PATH', route.path)
    }
}
</script>

<style lang="scss">
    .visit {
        border: 1px solid red
    }

</style>
```

# 总结
1.服务端渲染主要解决seo问题和首屏加载过慢问题，但会对服务器增加一点压力，大家应根据需求选型
2.vue ssr官网提供的示例只是展示一下vue ssr的原理，用在项目中并不方便，推荐使用更高层的框架nuxt.js。小技巧：若注释entry-client.js的所有代码，客户端不执行vue代码，可以做一个纯渲染htm的网页，兼容至ie8以下，但vue的许多特性及生命周期的方法都不会执行，大家也可根据项目需求选择，若喜欢使用vue语法又想考虑兼容至ie8且简单预览的页面，可以注释entry-client.js的所有代码实验以下。