# vueload.js

![]
![](https://img.shields.io/badge/version-1.0.0-blue.svg)
![](https://img.shields.io/badge/license-Apache%20Licence%202.0-green.svg)

*vueload.js是使用javascript实现异步加载一个.vue文件的库，可以实现vue组件按需异步加载*
## 使用方法
+ 在`<head>`标签中引用    **/dist/vueload.min.js** 
+ 调用方法 
    + Vue.component('my-component',vueload("./vue/my-component.vue")); //全局注册
    + vueload.register(Vue,'./vue/my-component.vue'); //全局注册
    + components: {
        'my-component': vueload('./vue/my-component.vue')
     }
    + components: {
        'my-component': vueload('./vue/my-component.vue', 'my-component')
     }
    + vueload.install(Vue);  //使用url:./vue/my-component.vue写法必须先执行这一句
      components: [
           "url:./vue/my-component.vue"
      ]
## 模板
    <!doctype html>
    <html lang="en">

    <head>
    <script src="./es6-promise.auto.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
    <script src="../src/vueloader.js"></script>
    <style>
        .button{
        font-size: 20px;
        }
        </style>
    </head>

    <body>
    <div id="my-app">
        <button class="button" onclick="test()">测试</button>
        <my-component></my-component>
    </div>

    <script type="text/javascript">   
        vueload.install(Vue);  //使用url:./vue/my-component.vue写法必须先执行这一句
        // Vue.component('my-component',vueload("./vue/my-component.vue")); //全局注册
        vueload.register(Vue,'./vue/my-component.vue'); //全局注册
        new Vue({
        el: '#my-app'
        ,     
        components: {
            'my-component': vueload('./vue/my-component.vue')
        }   
        components: {
            'my-component': vueload('./vue/my-component.vue', 'my-component')
        }
        components: [
            "url:./vue/my-component.vue"
        ]
        });
    </script>
    </body>

    </html>
