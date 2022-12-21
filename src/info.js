const { validateVideoURL } = require('./validate.js');
const _url = require('./request/url.js');
const request = require('./request/index.js').request;
const YouTubeData = require('./classes/ytdata.js');
const userAgent = require('./request/useragent.js').getRandomUserAgent;
const { getID } = require('./convert.js');

function getHTML5player(response){
  let html5playerRes =
    /<script\s+src="([^"]+)"(?:\s+type="text\/javascript")?\s+name="player_ias\/base"\s*>|"jsUrl":"([^"]+)"/
      .exec(response);
  return html5playerRes ? html5playerRes[1] || html5playerRes[2] : null;
};

function getInfo(ytstream, url){
  return new Promise((resolve, reject) => {
    if(typeof url !== 'string') throw new Error(`URL is not a string`);

    const validation = validateVideoURL(ytstream, url);
    if(!validation) throw new Error(`Invalid YouTube video URL`);

    var ytid = null;
    const parsed = _url(url);
    if(['youtube.com', 'music.youtube.com'].includes(parsed.hostname.toLowerCase().split('www.').join(''))) ytid = getID(ytstream, url);
    else if(parsed.hostname.toLowerCase().split('www.').join('') === `youtu.be`){
      if(parsed.pathname.toLowerCase().startsWith('/watch')){
        const newurl = 'https://www.youtube.com'+parsed.pathname+parsed.search;
        ytid = getID(ytstream, newurl);
      } else {
        const newurl = `https://www.youtube.com/watch?v=`+parsed.pathname.split('/').join('');
        ytid = getID(ytstream, newurl);
      }
    }

    if(ytid === null) return reject(`Invalid YouTube url`);

    const yturl = `https://www.youtube.com/watch?v=${ytid}&has_verified=1`;

		const userA = typeof ytstream.userAgent === 'string' ? ytstream.userAgent : userAgent();

    let headers = { 
      'accept-language': 'en-US,en-IN;q=0.9,en;q=0.8,hi;q=0.7',
      'user-agent' : userA,
    };

    if(typeof ytstream.cookie === 'string'){
      headers['cookie'] = ytstream.cookie;
    }

    request(yturl, {
      headers: headers
    }).then(async response => {
      if(response.indexOf(`Our systems have detected unusual traffic from your computer network.`) >= 0) return reject(`YouTube has detected that you are a bot. Try it later again.`);
      var res = response.split('var ytInitialPlayerResponse = ')[1];
			var html5path = getHTML5player(response);
      const html5player = typeof html5path === 'string' ? `https://www.youtube.com${html5path}` : null;
      if(!res){
        reject(`The YouTube song has no initial player response`);
        return;
      }
      res = res.split(';</script>')[0];
      if(!res){
        reject(`The YouTube song has no initial player response`);
        return;
      }
      try{
        res = decodeURI(res);
      } catch {}
      res = res.split(`\\"`).join("");
      res = res.split(`,"interpreterSafeScript"`)[0];
      if(!res){
        reject(`The YouTube song has no initial player response`);
        return;
      }
      var seperate = res.split(`,"uploadDate":`);
      var uploadDateValue = seperate[1].split("}}")[0];
      res = seperate[0] + `,"uploadDate":${uploadDateValue}}}}`;
      var data = JSON.parse(res);
      if (data.playabilityStatus.status !== 'OK'){
        var error = data.playabilityStatus.errorScreen.playerErrorMessageRenderer ? data.playabilityStatus.errorScreen.playerErrorMessageRenderer.reason.simpleText : data.playabilityStatus.errorScreen.playerKavRenderer.reason.simpleText;

        reject(`Error while getting video url\n${error}`);
      } else resolve(new YouTubeData(data, html5player, headers));
    }).catch(err => {
      reject(err);
    })
  });
}

module.exports = {
  getInfo
};
