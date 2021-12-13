const validate = require('./validate.js');
const _getURL = require('./request/url.js');

function getID(url){
  if(typeof url !== 'string') throw new Error(`URL is not a string`);
  if(!validate(url)) return undefined;

  const parsed = _getURL(url);
  
  const host = parsed.hostname.toLowerCase().split('www.').join('');

  let ytid;
  if(host === `youtu.be`) ytid = parsed.pathname.split('/').join('');
  else if(host === `youtube.com` || host === 'music.youtube.com'){
    if(parsed.pathname.startsWith('/watch')) ytid = parsed.searchParams.get('v');
    else if(parsed.pathname.startsWith('/embed/')) ytid = parsed.pathname.split('/embed/').join('');
    else if(parsed.pathname.startsWith('/v/')) ytid = parsed.pathname.split('/v/').join('');
    else if(parsed.pathname.startsWith('/shorts/')) ytid = parsed.pathname.split('/shorts/').join('');
    else ytid = null
  } else ytid = null;

  let reg = /^[A-Za-z0-9-_]*$/;
  if(!reg.test(ytid)) return undefined;
  return ytid;
}

function getURL(id){
  if(typeof id !== 'string') throw new Error(`ID is not a string`);

  let reg = /^[A-Za-z0-9-]*$/;
  if(!reg.test(id)) return undefined;

  return `https://www.youtube.com/watch?v=${id}`;
}

module.exports ={
  getID,
  getURL
}