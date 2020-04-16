# template-explorer

> 每个成熟的前端框架，模板引擎是其中重要的组成部分，目前市面上的模板引擎分为两种：

* dom base

* string base 
    - template -> parse = `AST` => render= `string`


## string base
要实现 hbs 的语法:

```html
<div>
    <% if (test > 1 ) { %>
        <%= test %>
    <% } %>
</div>

```
name, 我们需要parse 拿到的 AST

```json
[
    {  "type":1,
       "text":"div"
    },
    {
        "type":2,
        "tag":"if",
        "item":"test > 1",
        "children":[{
            "type": 3,
            "item":"test"
        }]
    },
    {
         "type":1 ,
         "text":"</div>"
    }
]

```

> 节点三个类型

 * 元素节点 1
 * 文本节点 3
 * 我们自定义的变量节点 2

``` shell
    yarn add rollup @babel/core @babel/plugin-syntax-dynamic-import @babel/preset-env  rollup-plugin-babel  rollup-plugin-commonjs rollup-plugin-node-resolve rollup-plugin-serve
```