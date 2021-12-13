const validate = require('./validate.js').validateURL;
const _url = require('./request/url.js');
const request = require('./request/index.js').request;
const YouTubeData = require('./classes/ytdata.js');
const userAgent = require('./request/useragent.js').getRandomUserAgent;

function getytID(url){
  var ytid = null;
  const parsed = _url(url);
  if(parsed.pathname.toLowerCase().startsWith('/watch')){
    ytid = parsed.searchParams.get('v') || null;
  } else if(parsed.pathname.toLowerCase().startsWith('/v/')){
    ytid = parsed.pathname.toLowerCase().split('/v/').join('');
  } else if(parsed.pathname.toLowerCase().startsWith('/shorts/')){
    ytid = parsed.pathname.toLowerCase().split('/shorts/').join('');
  }
  return ytid;
}

function getInfo(url){
  return new Promise((resolve, reject) => {
    if(typeof url !== 'string') throw new Error(`URL is not a string`);

    const validation = validate(url);
    if(!validation) throw new Error(`Invalid YouTube URL`);

    var ytid = null;
    const parsed = _url(url);
    if(['youtube.com', 'music.youtube.com'].includes(parsed.hostname.toLowerCase().split('www.').join(''))) ytid = getytID(url);
    else if(parsed.hostname.toLowerCase().split('www.').join('') === `youtu.be`){
      if(parsed.pathname.toLowerCase().startsWith('/watch')){
        const newurl = 'https://www.youtube.com'+parsed.pathname+parsed.search;
        ytid = getytID(newurl);
      } else {
        const newurl = `https://www.youtube.com/watch?v=`+parsed.pathname.split('/').join('');
        ytid = getytID(newurl);
      }
    }

    if(ytid === null) return reject(`Invalid YouTube url`);

    const yturl = `https://www.youtube.com/watch?v=${ytid}&has_verified=1`;

    let headers = { 
      'accept-language': 'en-US,en-IN;q=0.9,en;q=0.8,hi;q=0.7',
      'user-agent' : userAgent(),
    };

    request(yturl, {
      headers: headers
    }).then(response => {
      if(response.indexOf(`Our systems have detected unusual traffic from your computer network.`) >= 0) return reject(`YouTube has detected that you are a bot. Try it later again.`);
      var res = response.split('var ytInitialPlayerResponse = ')[1];
      const html5player = `https://www.youtube.com${response.split('"jsUrl":"')[1].split('"')[0]}`
      if(!res){
        reject(`The YouTube song has no initial player response`);
        return;
      }
      res = res.split(';</script>')[0];
      if(!res){
        reject(`The YouTube song has no initial player response`);
        return;
      }
      res = res.split(/;\s*(var|const|let)/)[0];
      if(!res){
        reject(`The YouTube song has no initial player response`);
        return;
      }
      var data = JSON.parse(res);
      if (data.playabilityStatus.status !== 'OK'){
        var error = data.playabilityStatus.errorScreen.playerErrorMessageRenderer ? data.playabilityStatus.errorScreen.playerErrorMessageRenderer.reason.simpleText : data.playabilityStatus.errorScreen.playerKavRenderer.reason.simpleText;

        reject(`Error while getting video url\n${error}`);
      } else resolve(new YouTubeData(data, html5player));
    }).catch(err => {
      reject(err);
    })
  });
}

module.exports = {
  getInfo
};