# template-explorer

> 每个成熟的前端框架，模板引擎是其中重要的组成部分，提升了视图的可维护性和编写效率，目前市面上的模板引擎分为两种：

* string base 
基于模板字符串中,加上用户数据变量或者函数，编译成view字符串，通过innerHTML填充到对应节点，借助浏览器能力翻译成具体节点。
* dom base
解析阶段和string base类似，但是强调着render之后，dom和数据间的`联动`关系,数据更新后不依赖手动操作dom来更新view


# 工程搭建
安装依赖
``` shell
    yarn add  rollup @babel/core @babel/plugin-syntax-dynamic-import @babel/preset-env  rollup-plugin-babel  rollup-plugin-commonjs rollup-plugin-node-resolve rollup-plugin-serve --dev
```

rollup.config.js

```node
import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import serve from 'rollup-plugin-serve'


export default {
    input: 'src/index.js',
    output: {
        file: './lib/template-exporer.js',
        format: 'esm',
        name: 'tExporer',
        sourcemap: true,
    },
    plugins: [
        resolve(),
        commonjs(),
        babel({
            exclude: /node_modules/
        }),
        process.env.SERVE ? serve({
            open: true,
            contentBase: '',
            openPage: '/public/index.html',
            host: '127.0.0.1',
            port: '9999'
        }) : null
    ]

}
```



# string base
大致过程
>  template-> split = `lines` -> compile = function +data -> `string` -> innerHTML = dom

要实现如下的模板:
```html
<div>
    <% if (test > 1 ) { %>
        <%= test %>
    <% } %>
</div>

```
我们需要按照：
```javascript
const TYPE_TAG = 1;     // 标签节点
const TYPE_TEXT = 2;    // 文本节点
const TYPE_VAR = 3;     // 变量和语句节点
const TYPE_COM = 4;     // 注释节点
```
类型对html进行spilt,最终的lines:
```javascript
[
   '<div>',
   '<% if (test > 1 ) { %>',
   '<%= test %>',
   '<% } %>',
   '</div>'
]
```
接下来，根据不同的节点类型，来拼凑不同的解析规则,最终compile函数,大致如下：

``` javascript
let code = 'const l=[];'
code += 'with(obj){'
code += `
        l.push('<div>');
        if (test > 1 ) {
            l.push(test);
        }
        l.push('</div>');
    }
    return l.join('')
`
// compile fn:
const fn = new Function('obj',`return ${code}`)
fn.call(scope)
```


# dom base
参考 Vue的渲染
> template -> parse = AST -> compile=> data + render function => vitual dom  -> dom

要实现这样的模板:
``` html
<div id="app" >
    <p>{{name}}</p>
    <span>年龄:{{age}}</span>
</div>


```
首先转换成AST:
``` javascript
{
    tag:'div',
    type:1,
    attrs: {
        id:'app'
    },
    children:[{
        tag:'p',
        type:1,
        children:[{
            type:3,
            text:'{{name}}'
        }]
    },{
        tag:'span',
        type:1,
        children:[{
            type:3,
            text:'年龄:'
        },{
            type:3,
            text:'{{age}}'
        }]
    }]
}
```
compile render函数：
```javascript
// 函数体
const code = _c('div',{id:'app'},_c("p",undefined,_v('年龄:'+_s(name))),_s(age))

// 主函数
function render() {
  with(this) {
    return _c('div', {
      attrs: {
        "id": "app"
      }
    }, [_c('p', [_v(_s(name))]), _c('span', [_v("年龄:" + _s(age))])])
  }
}

```
然后在`渲染Watcher` 通过render函数，解析成vnode,创建真实dom, 再次视图更新通过dom diff部分更新dom节点:

```
_c :createElement
_v: createTextNode
_s: stringify
```
dom diff
Vue的diff算法是基于snabbdom改造过来的,Vue的diff算法是`同级的vnode间做diff`，递归地进行同级vnode的diff，最终实现整个DOM树的更新.

patch函数会维护oldStart+oldEnd，newStart+newEnd这样2对指针，分别对应oldVdom和newVdom的起点和终点。起止点之前的节点是待处理的节点，Vue不断对vnode进行处理同时移动指针直到其中任意一对起点和终点相遇。处理过的节点Vue会在oldVdom和newVdom中同时将它标记为已处理。Vue通过以下措施来提升diff的性能。




参考：
* https://johnresig.com/blog/javascript-micro-templating/
* https://github.com/whxaxes/mus
* https://github.com/yanhaijing/template.js
* https://blog.csdn.net/m6i37jk/article/details/78140159
* https://github.com/muwoo/blogs/blob/master/src/Vue/11.md
