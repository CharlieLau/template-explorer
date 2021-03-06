const PreBlock = /^\<\%(?:\s?)+\w+.*\%\>/
const EndBlock = /^<%(\s?)+}{1}(\s?)+ %>/
const EqualBlock = /^<%(?:\s?)+=(?:\s?)+(\w+).*%>/
const TEXT = /^[\w\s]+/
const PreTag = /^\<\w+.*\>/
const EndTag = /^\<\/\w+.*\>/

const Condition = /<%(?:\s?)+(\w+)(?:\s?)+\((.*)\).*%>/
export  const TokenType = {
    PreBlock: 2,
    PreTag: 1,
    EqualBlock: 2,
    TEXT: 3
}

class Token {
    constructor(type, value = '', unary = false) {
        this.type = type;
        this.value = value
        this.unary = unary // 是否一元标签
    }
}

export function parseToken(template, parseToken = {}) {
    let code = template
    let nodes = []
    let matchedText = ''
    while (code) {
        let node;
        let fn;
        code = code.trim();
        let token;
        if (node = code.match(PreTag)) {
            matchedText = node[0]
            token = new Token('PreTag', matchedText)
            fn = parseToken.start
        } else if (node = code.match(TEXT)) {
            matchedText = node[0].trim()
            token = new Token('TEXT', matchedText, true)
            fn = parseToken.start
        } else if (node = code.match(PreBlock)) {
            matchedText = node[0]
            token = new Token('PreBlock', matchedText)
            fn = parseToken.start
        } else if (node = code.match(EqualBlock)) {
            matchedText = node[0]
            token = new Token('EqualBlock', matchedText, true)
            fn = parseToken.start
        } else if (node = code.match(EndBlock)) {
            matchedText = node[0]
            token = new Token('EndBlock', matchedText)
            fn = parseToken.end
        } else if (node = code.match(EndTag)) {
            matchedText = node[0]
            token = new Token('EndTag', matchedText)
            fn = parseToken.end
        }
        fn(token)
        nodes.push(token)
        code = code.slice(matchedText.length)
        node = null
    }
    return nodes
}


export function parse(template) {
    let stacks = []
    let currentParentToken
    let root

    const tokens = parseToken(template, {
        start(token) {
            let type = TokenType[token.type];
            let ast = {
                type,
                unary: token.unary,
                children: []
            }
            if (type === 1) {
                ast.text = token.value
            } else if (type === 2) {
                const condition = token.value.match(Condition)
                if (Array.isArray(condition) && condition.length > 1) {
                    ast.tag = condition[1]
                    ast.item = condition[2]
                } else {
                    ast.item = token.value
                }
            }
            if (!root) {
                root = ast
            } else if (currentParentToken) {
                currentParentToken.children.push(ast)
            }

            if (!token.unary) {
                currentParentToken = ast
                stacks.push(currentParentToken)
            } else {
                delete ast.children
            }
        },
        end(token) {
            stacks.pop()
            currentParentToken = stacks[stacks.length - 1]
        }
    })
    return {
        ast: root,
        tokens
    };
}