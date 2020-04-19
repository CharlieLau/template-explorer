import {parse} from './parse'

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
export function compile(html){
    let root =parse(html)
    let code = generate(root)
    return new Function(`with(this){ return ${code}}`);
}
export function generate(el){
    let children = genChildren(el);
    let code = `_c("${el.tag}",${
       el.attrs.length?genProps(el.attrs):'undefined'
    }${
        children? `,${children}` :''
    })
    `
    return code;

}

function genProps(attrs){ 
    let str = '';
    for(let i = 0; i < attrs.length;i++){
        let attr = attrs[i];
        if(attr.name === 'style'){
            let obj = {};
            attr.value.split(';').forEach(item=>{
                let [key,value] = item.split(':');
                obj[key] = value
            });
            attr.value = obj;
        }
        str+= `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0,-1)}}`
}
function genChildren(el){
    let children = el.children;
    if(children && children.length > 0){
        return `${children.map(c=>gen(c)).join(',')}`
    }else{
        return false;
    }
}
function gen(node){
    if(node.type == 1){
        return generate(node);
    }else{
        let text = node.text;
        let tokens = [];
        let match,index;
        let lastIndex = defaultTagRE.lastIndex = 0; 
        while(match = defaultTagRE.exec(text)){
            index = match.index;
            if(index > lastIndex){
                tokens.push(JSON.stringify(text.slice(lastIndex,index)));
            }
            tokens.push(`_s(${match[1].trim()})`);
            lastIndex = index + match[0].length;
        }
        if(lastIndex < text.length){
            tokens.push(JSON.stringify(text.slice(lastIndex)))
        }
        return `_v(${tokens.join('+')})`;
    }
}