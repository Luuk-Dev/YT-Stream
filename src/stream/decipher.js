const { URLSearchParams } = require('url');
const { request } = require(`../request/index.js`);
const vm = require('vm');

async function getFunctions(html5playerfile, options){
  const body = await request(html5playerfile, options, options.agent);
  const functions = extractFunctions(body);
  return functions;
};

const DECIPHER_NAME_REGEXPS = [
  '\\bm=([a-zA-Z0-9$]{2,})\\(decodeURIComponent\\(h\\.s\\)\\);',
  '\\bc&&\\(c=([a-zA-Z0-9$]{2,})\\(decodeURIComponent\\(c\\)\\)',
  '(?:\\b|[^a-zA-Z0-9$])([a-zA-Z0-9$]{2,})\\s*=\\s*function\\(\\s*a\\s*\\)\\s*\\{\\s*a\\s*=\\s*a\\.split\\(\\s*""\\s*\\)',
  '([\\w$]+)\\s*=\\s*function\\((\\w+)\\)\\{\\s*\\2=\\s*\\2\\.split\\(""\\)\\s*;',
];

const VARIABLE_PART = '[a-zA-Z_\\$][a-zA-Z_0-9]*';
const VARIABLE_PART_DEFINE = `\\"?${VARIABLE_PART}\\"?`;
const BEFORE_ACCESS = '(?:\\[\\"|\\.)';
const AFTER_ACCESS = '(?:\\"\\]|)';
const VARIABLE_PART_ACCESS = BEFORE_ACCESS + VARIABLE_PART + AFTER_ACCESS;
const REVERSE_PART = ':function\\(a\\)\\{(?:return )?a\\.reverse\\(\\)\\}';
const SLICE_PART = ':function\\(a,b\\)\\{return a\\.slice\\(b\\)\\}';
const SPLICE_PART = ':function\\(a,b\\)\\{a\\.splice\\(0,b\\)\\}';
const SWAP_PART = ':function\\(a,b\\)\\{' +
      'var c=a\\[0\\];a\\[0\\]=a\\[b%a\\.length\\];a\\[b(?:%a.length|)\\]=c(?:;return a)?\\}';

const DECIPHER_REGEXP = `function(?: ${VARIABLE_PART})?\\(a\\)\\{` +
  `a=a\\.split\\(""\\);\\s*` +
  `((?:(?:a=)?${VARIABLE_PART}${VARIABLE_PART_ACCESS}\\(a,\\d+\\);)+)` +
  `return a\\.join\\(""\\)` +
  `\\}`;

const HELPER_REGEXP = `var (${VARIABLE_PART})=\\{((?:(?:${
  VARIABLE_PART_DEFINE}${REVERSE_PART}|${
  VARIABLE_PART_DEFINE}${SLICE_PART}|${
  VARIABLE_PART_DEFINE}${SPLICE_PART}|${
  VARIABLE_PART_DEFINE}${SWAP_PART}),?\\n?)+)\\};`;

const N_TRANSFORM_REGEXP = 'function\\(\\s*(\\w+)\\s*\\)\\s*\\{' +
  'var\\s*(\\w+)=(?:\\1\\.split\\(""\\)|String\\.prototype\\.split\\.call\\(\\1,""\\)),' +
  '\\s*(\\w+)=(\\[.*?]);\\s*\\3\\[\\d+]' +
  '(.*?try)(\\{.*?})catch\\(\\s*(\\w+)\\s*\\)\\s*\\' +
  '{\\s*return"enhanced_except_([A-z0-9-]+)"\\s*\\+\\s*\\1\\s*}' +
  '\\s*return\\s*(\\2\\.join\\(""\\)|Array\\.prototype\\.join\\.call\\(\\2,""\\))};';

function matchRegex (regex, str){
  const match = str.match(new RegExp(regex, 's'));
  if (!match) throw new Error(`Could not match ${regex}`);
  return match;
};

function matchFirst(regex, str){
  return matchRegex(regex, str)[0];
}

function matchGroup1(regex, str){
  return matchRegex(regex, str)[1];
}

function getFuncName(body, regexps){
  let fn;
  for (const regex of regexps) {
    try {
      fn = matchGroup1(regex, body);
      const idx = fn.indexOf('[0]');
      if (idx > -1) {
        fn = matchGroup1(`${fn.substring(idx, 0).replace(/\$/g, '\\$')}=\\[([a-zA-Z0-9$\\[\\]]{2,})\\]`, body);
      }
      break;
    } catch (err) {
      continue;
    }
  }
  if (!fn || fn.includes('[')) throw new Error(`Unable to match function name`);
  return fn;
};

function extractDecipherFunc(body){
  try {
    const helperObject = matchFirst(HELPER_REGEXP, body);
    const decipherFunc = matchFirst(DECIPHER_REGEXP, body);
    const resultFunc = `var decipher=${decipherFunc};`;
    const callerFunc = `decipher(sig);`;
    return helperObject + resultFunc + callerFunc;
  } catch (e) {
    return null;
  }
};

function extractDecipherWithName(body){
  try {
    const decipherFuncName = getFuncName(body, DECIPHER_NAME_REGEXPS);
    const funcPattern = `(${decipherFuncName.replace(/\$/g, '\\$')}=function\\([a-zA-Z0-9_]+\\)\\{.+?\\})`;
    const decipherFunc = `var ${matchGroup1(funcPattern, body)};`;
    const helperObjectName = matchGroup1(';([A-Za-z0-9_\\$]{2,})\\.\\w+\\(', decipherFunc);
    const helperPattern = `(var ${helperObjectName.replace(/\$/g, '\\$')}=\\{[\\s\\S]+?\\}\\};)`;
    const helperObject = matchGroup1(helperPattern, body);
    const callerFunc = `${decipherFuncName}(sig);`;
    return helperObject + decipherFunc + callerFunc;
  } catch (e) {
    return null;
  }
};

function getExtractFunctions(extractFunctions, body){
  for (const extractFunction of extractFunctions) {
    try {
      const func = extractFunction(body);
      if (!func) continue;
      return new vm.Script(func);
    } catch (err) {
      continue;
    }
  }
  return null;
};

function extractDecipher(body){
  const decipherFunc = getExtractFunctions([extractDecipherWithName, extractDecipherFunc], body);
  if (!decipherFunc) return null;
  return decipherFunc;
};

function extractNTransformFunc(body){
  try {
    const nFunc = matchFirst(N_TRANSFORM_REGEXP, body);
    return `var transform=${nFunc}` + `transform(n);`;
  } catch (e) {
    return null;
  }
};

function extractNTransform(body){
  const nTransformFunc = getExtractFunctions([extractNTransformFunc], body);
  if (!nTransformFunc) return null;
  return nTransformFunc;
};

function extractFunctions(body){
  return [
    extractDecipher(body),
    extractNTransform(body)
  ];
}

function setDownloadURL(format, decipherScript, nTransformScript){
  if (!decipherScript) return;
  const decipher = url => {
    const args = new URLSearchParams(url);
    if (!args.has('s')) return args.get('url');
    const components = new URL(decodeURIComponent(args.get('url')));
    components.searchParams.set(args.get('sp') || 'sig', decipherScript.runInNewContext({sig: decodeURIComponent(args.get('s'))}));
    return components.toString();
  };
  const nTransform = url => {
    const components = new URL(decodeURIComponent(url));
    const n = components.searchParams.get('n');
    if (!n || !nTransformScript) return url;
    components.searchParams.set('n', nTransformScript.runInNewContext({n: n}));
    return components.toString();
  };
  const cipher = !format.url;
  const url = format.url || format.signatureCipher || format.cipher;
  format.url = cipher ? nTransform(decipher(url)) : nTransform(url);
  delete format.signatureCipher;
  delete format.cipher;
};

function format_decipher(formats, html5player, agent){
  return new Promise(async resolve => {
    const [decipherScript, nTransformScript] = await getFunctions(html5player, {headers: {cookie: agent.jar.getCookieStringSync('https://www.youtube.com')}, agent});
    for(let format of formats){
      setDownloadURL(format, decipherScript, nTransformScript);
    };
    resolve(formats);
  });
};

module.exports = {
  format_decipher
}
