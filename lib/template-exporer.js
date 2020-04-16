const PreBlock = /^\<\%(?:\s?)+\w+.*\%\>/;
const EndBlock = /^<%(\s?)+}{1}(\s?)+ %>/;
const EqualBlock = /^<%(?:\s?)+=(?:\s?)+(\w+).*%>/;
const TEXT = /^[\w\s]+/;
const PreTag = /^\<\w+.*\>/;
const EndTag = /^\<\/\w+.*\>/;
const Condition = /<%(?:\s?)+(\w+)(?:\s?)+\((.*)\).*%>/;

class Token {
  constructor(type, value = '') {
    this.type = type;
    this.value = value;
  }

}

function compile(template) {
  let code = template;
  let nodes = [];
  let matchedText = '';

  while (code) {
    let node;
    code = code.trim();

    if (node = code.match(PreTag)) {
      matchedText = node[0];
      nodes.push(new Token('PreTag', matchedText));
    } else if (node = code.match(TEXT)) {
      matchedText = node[0].trim();
      nodes.push(new Token('TEXT', matchedText));
    } else if (node = code.match(PreBlock)) {
      matchedText = node[0];
      nodes.push(new Token('PreBlock', matchedText));
    } else if (node = code.match(EndBlock)) {
      matchedText = node[0];
      nodes.push(new Token('EndBlock', matchedText));
    } else if (node = code.match(EqualBlock)) {
      matchedText = node[0];
      nodes.push(new Token('EqualBlock', matchedText));
    } else if (node = code.match(EndTag)) {
      matchedText = node[0];
      nodes.push(new Token('EndTag', matchedText));
    }

    code = code.slice(matchedText.length);
    node = null;
  }

  return nodes;
}

function parseEqualBlock(tokens) {
  const [node, eTokens] = eat('EqualBlock', tokens);
  const variable = node.value.match(EqualBlock);
  return [{
    type: 2,
    item: variable[1]
  }, eTokens];
}

function parseBlock(tokens, parent) {
  debugger;
  let tailTokens = tokens;
  let blocks = [];

  while (check('PreBlock', tailTokens) || check('EqualBlock', tailTokens) || check('PreTag', tailTokens)) {
    let block = {
      type: 2,
      children: []
    };
    let eBlock;
    let node;

    if (check('PreBlock', tailTokens)) {
      [node, tailTokens] = eat('PreBlock', tailTokens);
      const condition = node.value.match(Condition);
      block.tag = condition[1];
      block.item = condition[2];
    }

    if (check('PreTag', tailTokens)) {
      [eBlock, tailTokens] = parseTag(tailTokens, block);
      block.children.push(eBlock);
    }

    if (check('EqualBlock', tailTokens)) {
      [eBlock, tailTokens] = parseEqualBlock(tailTokens);
      block.children.push(eBlock);
    }

    if (check('EndBlock', tailTokens)) {
      [, tailTokens] = eat('EndBlock', tailTokens);
    }

    blocks.push(block);
  }

  return [blocks, tailTokens];
}

function parseTag(tokens, parent) {
  debugger;
  let tailTokens = tokens;
  let tags = [];

  while (check('PreTag', tailTokens) || check('EndTag', tailTokens) || check('TEXT', tailTokens) || check('PreBlock', tailTokens)) {
    let tag = {
      type: 1,
      text: '',
      children: []
    };
    let node;

    if (check('PreTag', tailTokens)) {
      [node, tailTokens] = eat('PreTag', tailTokens);

      if (node.value === "<span>") {
        console.log(parent);
        debugger;
      }

      tag.text = node.value;
    }

    if (check('PreBlock', tailTokens)) {
      let nChildren = [];
      [nChildren, tailTokens] = parseBlock(tailTokens);
      tag.children = tag.children.concat(nChildren);
    }

    if (check('TEXT', tailTokens)) {
      let nChildren = [];
      [nChildren, tailTokens] = eat('TEXT', tailTokens);
      tag.children.push({
        type: 3,
        item: nChildren.value
      });
    }

    if (check('EndTag', tailTokens)) {
      [, tailTokens] = eat('EndTag', tailTokens);
    }

    tags.push(tag);
  }

  return [tags, tailTokens];
}

function parse(template) {
  const tokens = compile(template);
  let [node] = parseTag(tokens);
  console.log(node);
}

function eat(type, tokens) {
  if (!tokens) {
    throw new Error('没token 可eat了 ' + type);
  }

  if (tokens.length && tokens[0].type === type) {
    return [tokens[0], tokens.slice(1)];
  }

  throw new Error('this first node type is not ' + type + ' in template  eat method');
}

function check(type, tokens) {
  return tokens.length && tokens[0].type === type;
}

export { parse };
//# sourceMappingURL=template-exporer.js.map
