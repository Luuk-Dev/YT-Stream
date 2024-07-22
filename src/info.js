const { validateVideoURL } = require('./validate.js');
const _url = require('./request/url.js');
const request = require('./request/index.js').request;
const YouTubeData = require('./classes/ytdata.js');
const userAgent = require('./request/useragent.js').getRandomUserAgent;
const { getID } = require('./convert.js');
const genClientInfo = require('./genClient.js');

function getHTML5player(response){
  let html5playerRes =
    /<script\s+src="([^"]+)"(?:\s+type="text\/javascript")?\s+name="player_ias\/base"\s*>|"jsUrl":"([^"]+)"/
      .exec(response);
  return html5playerRes ? html5playerRes[1] || html5playerRes[2] : null;
};

function getInfo(ytstream, url, force = false){
  return new Promise((resolve, reject) => {
    if(typeof url !== 'string') throw new Error(`URL is not a string`);

    const validation = validateVideoURL(ytstream, url);
    if(!validation) throw new Error(`Invalid YouTube video URL`);

    var ytid = null;
    let parsed = _url(url);
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

    if(ytstream.preference === 'scrape'){
      const yturl = `https://www.youtube.com/watch?v=${ytid}&has_verified=1&cbrd=1`;

      const userA = typeof ytstream.userAgent === 'string' ? ytstream.userAgent : userAgent();

      let headers = { 
        'accept-language': 'en-US,en-IN;q=0.9,en;q=0.8,hi;q=0.7',
        'user-agent' : userA,
      };

      for(const header in ytstream.headers){
        headers[header] = ytstream.headers[header];
      }
      headers['cookie'] = ytstream.agent.jar.getCookieStringSync('https://www.youtube.com');

      request(yturl, {
        headers: headers
      }, ytstream.agent, 0, force).then(async response => {
        let res = response.split('var ytInitialPlayerResponse = ')[1];
        let html5path = getHTML5player(response);
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
        let seperate = res.split(/}};[a-z]/);
        let jsonObject = (seperate[0] + "}}").split('\\"').join('\"').split("\\'").join("\'").split("\\`").join("\`");
        let splitVars = jsonObject.split(/['|"|`]playerVars['|"|`]:/);
        while(splitVars.length > 1){
          jsonObject = splitVars[0] + splitVars.slice(1).join("\"playersVars\":").split(/}}['|"|`],/).slice(1).join("}}\",");
          splitVars = jsonObject.split(/['|"|`]playerVars['|"|`]:/);
        }
        let data;
        try{
          data = JSON.parse(jsonObject);
        } catch {
          reject(`The YouTube song has no initial player response`);
          return;
        }
        if(data.playabilityStatus.status !== 'OK'){
          let error = data.playabilityStatus.errorScreen.playerErrorMessageRenderer ? data.playabilityStatus.errorScreen.playerErrorMessageRenderer.reason.simpleText : data.playabilityStatus.errorScreen.playerKavRenderer.reason.simpleText;

          reject(`Error while getting video url\n${error}`);
        } else resolve(new YouTubeData(data, html5player, headers, null));
      }).catch(err => {
        reject(err);
      });
    } else if(ytstream.preference === 'api'){
      if(typeof ytstream.apiKey !== 'string') return reject(`No valid API key has been set`);

      const clientInfo = genClientInfo(ytid, ytstream.client);

      request('https://www.youtube.com/youtubei/v1/player?key='+ytstream.apiKey+'&prettyPrint=false', {
        method: 'POST',
        body: JSON.stringify(clientInfo.body),
        headers: clientInfo.headers
      }, ytstream.agent, 0, false).then(res => {
        let data;
        try{
          data = JSON.parse(res);
        } catch {
          reject(`Invalid response from the YouTube API`);
          return;
        }
        if(data.playabilityStatus.status !== 'OK'){
          return reject(data.playabilityStatus.reason);
        }
        resolve(new YouTubeData(data, null, clientInfo.headers, clientInfo.body));
      }).catch(reject);
    }
  });
}

module.exports = {
  getInfo
};
