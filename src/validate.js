const validate = require('./request/url.js');


function validateID(ytstream, id) {
  if (typeof id !== 'string') return false;
  let reg = /^[A-Za-z0-9-_]*$/;
  if (!reg.test(id)) return false;
  if(id.length > 16 || id.length < 8) return false;
  return true;
}

function validateURL(ytstream, url) {
  if (typeof url !== 'string') return false;

  const _url = validate(url);
  if (!_url) return false;

  const hosts = ['music.youtube.com', 'youtube.com', 'youtu.be'];

  let ytid;

  const host = _url.hostname.toLowerCase().split('www.').join('');
  const index = hosts.indexOf(host);
  if (index < 0) return false;

  if (!_url.pathname.toLowerCase().startsWith('/watch')) {
    if (hosts[index] === `youtu.be` && _url.pathname.length > 0) ytid = _url.pathname.split('/').join('');
    else if (_url.pathname.startsWith('/embed/')) ytid = _url.pathname.split('/embed/').join('');
    else if (_url.pathname.startsWith('/v/')) ytid = _url.pathname.split('/v/').join('');
    else if(_url.pathname.startsWith('/shorts/')) ytid = _url.pathname.split('/v/').join('');
  } else {
    if (!_url.searchParams.get('v')) return false;
    ytid = _url.searchParams.get('v');
  }

  if(!validateID(ytstream, ytid)) return false
  else return true;
}

module.exports = { validateURL, validateID };
