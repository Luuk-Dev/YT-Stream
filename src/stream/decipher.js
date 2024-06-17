const { request } = require(`../request/index.js`);
const vm = require('vm');
const querystring = require('querystring');
const { URL } = require('url');

const ESCAPING_SEQUENZES = [
    { start: '"', end: '"' },
    { start: "'", end: "'" },
    { start: '`', end: '`' },
    { start: '/', end: '/', startPrefix: /(^|[[{:;,/])\s?$/ },
  ];

function cutAfterJS(mixedJson){
    let open, close;
    if (mixedJson[0] === '[') {
      open = '[';
      close = ']';
    } else if (mixedJson[0] === '{') {
      open = '{';
      close = '}';
    }
  
    if (!open) {
      throw new Error(`Invalid JSON from HTML5 watch page`);
    }
  
    let isEscapedObject = null;
  
    let isEscaped = false;
  
    let counter = 0;
  
    let i;
    for (i = 0; i < mixedJson.length; i++) {
      if (!isEscaped && isEscapedObject !== null && mixedJson[i] === isEscapedObject.end) {
        isEscapedObject = null;
        continue;
      } else if (!isEscaped && isEscapedObject === null) {
        for (const escaped of ESCAPING_SEQUENZES) {
          if (mixedJson[i] !== escaped.start) continue;
          if (!escaped.startPrefix || mixedJson.substring(i - 10, i).match(escaped.startPrefix)) {
            isEscapedObject = escaped;
            break;
          }
        }
        if (isEscapedObject !== null) {
          continue;
        }
      }
  
      isEscaped = mixedJson[i] === '\\' && !isEscaped;
  
      if (isEscapedObject !== null) continue;
  
      if (mixedJson[i] === open) {
        counter++;
      } else if (mixedJson[i] === close) {
        counter--;
      }
  
      if (counter === 0) {
        return mixedJson.substring(0, i + 1);
      }
    }
  
    throw Error("Invalid JSON (no matching closing bracket found)");
  };

function extractFunctions(body){
    const functions = [];
    const extractManipulations = caller => {
      const functionName = caller.split(`a=a.split("");`).slice(1).join(`a=a.split("");`).split(`.`)[0];
      if (!functionName) return '';
      const functionStart = `var ${functionName}={`;
      const ndx = body.indexOf(functionStart);
      if (ndx < 0) return '';
      const subBody = body.slice(ndx + functionStart.length - 1);
      return `var ${functionName}=${cutAfterJS(subBody)}`;
    };
    const extractDecipher = () => {
      const functionName = body.split(`a.set("alr","yes");c&&(c=`).slice(1).join(`a.set("alr","yes");c&&(c=`).split(`(decodeURIC`)[0];
      if (functionName && functionName.length) {
        const functionStart = `${functionName}=function(a)`;
        const ndx = body.indexOf(functionStart);
        if (ndx >= 0) {
          const subBody = body.slice(ndx + functionStart.length);
          let functionBody = `var ${functionStart}${cutAfterJS(subBody)}`;
          functionBody = `${extractManipulations(functionBody)};${functionBody};${functionName}(sig);`;
          functions.push(functionBody);
        }
      }
    };
    const extractNCode = () => {
      let functionName = body.split(`&&(b=a.get("n"))&&(b=`).slice(1).join(`&&(b=a.get("n"))&&(b=`).split(`(b)`)[0];
      if (functionName.includes('[')) functionName = body.split(`var ${functionName.split('[')[0]}=[`).slice(1).join(`var ${functionName.split('[')[0]}=[`).split(`]`)[0];
      if (functionName && functionName.length) {
        const functionStart = `${functionName}=function(a)`;
        const ndx = body.indexOf(functionStart);
        if (ndx >= 0) {
          const subBody = body.slice(ndx + functionStart.length);
          const functionBody = `var ${functionStart}${cutAfterJS(subBody)};${functionName}(ncode);`;
          functions.push(functionBody);
        }
      }
    };
    extractDecipher();
    extractNCode();
    return functions;
};

function setDownloadURL(format, decipherScript, transformScript){
    const decipher = url => {
    const args = querystring.parse(url);
        if (!args.s || !decipherScript) return args.url;
        const components = new URL(decodeURIComponent(args.url));
        components.searchParams.set(args.sp ? args.sp : 'signature',
            decipherScript.runInNewContext({ sig: decodeURIComponent(args.s) }));
        return components.toString();
    };
    const ncode = url => {
        const components = new URL(decodeURIComponent(url));
        const n = components.searchParams.get('n');
        if (!n || !transformScript) return url;
        components.searchParams.set('n', transformScript.runInNewContext({ ncode: n }));
        return components.toString();
    };
    const cipher = !format.url;
    const url = format.url || format.signatureCipher || format.cipher;
    format.url = cipher ? ncode(decipher(url)) : ncode(url);
    delete format.signatureCipher;
    delete format.cipher;
}

function format_decipher(formats, html5player, agent){
  return new Promise(async resolve => {
    const body = await request(html5player, {headers: {cookie: agent.jar.getCookieStringSync('https://www.youtube.com')}}, agent);
    const extractedFunctions = extractFunctions(body);
    const decipherScript = extractedFunctions.length ? new vm.Script(extractedFunctions[0]) : null;
    const transformScript = extractedFunctions.length > 1 ? new vm.Script(extractedFunctions[1]) : null;
    for(let i = 0; i < formats.length; i++){
        setDownloadURL(formats[i], decipherScript, transformScript);
    }
    resolve(formats);
  });
}

module.exports = {
  format_decipher
};
