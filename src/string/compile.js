import {
    parseToken,
    TokenType
} from './parse'

const Express = /<%(.*)%>/
const EqualExpress = /<%(?:\s?)+=(?:\s?)+(\w+)(?:\s?)+%>/

export function compile(template, scope) {
    let code = 'const r=[];\n  with(this){\n';

    function add(line, js) {
        js ? code += `${line}\n` :
            code += 'r.push("' + line.replace(/"/g, '\\"') + '");\n';
    }
    parseToken(template, {
        start(token) {
            if (token.type === 'PreBlock') {
                let matched = token.value.match(Express)
                if (matched.length > 0) {
                    add(matched[1], true)
                }
            } else if (token.type === 'EqualBlock') {
                let matched = token.value.match(EqualExpress)
                if (matched.length > 0) {
                    add(`r.push(${matched[1]});\n`, true)
                }
            } else {
                add(token.value)
            }
        },
        end(token) {
            if (token.type === 'EndTag') {
                add(token.value)
            } else if (token.type === 'EndBlock') {
                let matched = token.value.match(Express)
                if (matched.length > 0) {
                    add(matched[1], true)
                }
            }
        }
    })
    code += '}\nreturn r.join("");';
    return new Function(code.replace(/[\r\t\n]/g, '')).call(scope);
}