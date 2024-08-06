const request = require('../request/index.js').request;
const SearchData = require('../classes/searchdata.js');
const userAgent = require('../request/useragent.js').getRandomUserAgent;
const genClientInfo = require('../genClient.js');
const { URL } = require('url');

function toFullNumber(n){
  let defN = (n.match(/[0-9.]/g) ?? ["0"]).join("");
  let numbers = parseInt(defN);
  switch(n.split(defN)[1].toUpperCase()){
    case 'K':
      numbers *= 1e3;
      break;
    case 'M':
      numbers *= 1e6;
      break;
    case 'B':
      numbers *= 1e9;
      break;
  }
  return numbers;
}

function genNonce(length){
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  let nonce = "";
  while(nonce.length < length){
    nonce += chars[Math.round(Math.random() * (chars.length - 1))];
  }
  return nonce;
}

function transformApiData(videoCard){
  let viewsMetaData = videoCard.videoData.metadata.metadataDetails.split(" ");
  let filterViews = viewsMetaData.filter(v => /^[0-9.]+[KMB]{0,1}$/.test(v) && v.length > 1);
  let views = 0;
  if(filterViews.length > 0){
    views = toFullNumber(filterViews[0]);
  }

  let videoId = videoCard.videoData.videoId;
  if(!videoId){
    if(typeof videoCard.videoData.dragAndDropUrl === 'string'){
      if(!videoCard.videoData.dragAndDropUrl.startsWith("https://")){
        if(videoCard.videoData.dragAndDropUrl.startsWith("//")){
          videoCard.videoData.dragAndDropUrl = "https:"+videoCard.videoData.dragAndDropUrl;
        } else if(videoCard.videoData.dragAndDropUrl.startsWith("www.")){
          videoCard.videoData.dragAndDropUrl = "https://"+videoCard.videoData.dragAndDropUrl;
        } else if(videoCard.videoData.dragAndDropUrl.dragAndDropUrl.startsWith("youtube")){
          videoCard.videoData.dragAndDropUrl = "https://www."+videoCard.videoData.dragAndDropUrl;
        }
      }

      try{
        let parseURL = new URL(videoCard.videoData.dragAndDropUrl);
        videoId = parseURL.searchParams.get('v');
        if(!videoId){
          if(typeof videoCard?.onTap?.innertubeCommand?.watchEndpoint === 'object'){
            videoId = videoCard.onTap.innertubeCommand.watchEndpoint.videoId;
          }
        }
      } catch {
        if(typeof videoCard?.onTap?.innertubeCommand?.watchEndpoint === 'object'){
          videoId = videoCard.onTap.innertubeCommand.watchEndpoint.videoId;
        }
      }
    } else if(typeof videoCard?.onTap?.innertubeCommand?.watchEndpoint === 'object'){
      videoId = videoCard.onTap.innertubeCommand.watchEndpoint.videoId;
    }
  }

  return {
    videoRenderer: {
      title: {runs: [{text: videoCard.videoData.metadata.title}]},
      videoId: videoId,
      thumbnail: {thumbnails: videoCard.videoData.thumbnail.image.sources},
      lengthText: {simpleText: videoCard.videoData.thumbnail.timestampText},
      viewCountText: {simpleText: views.toString()},
      ownerText: {runs: [{text: videoCard.videoData.metadata.byline, navigationEndpoint: {browseEndpoint: {browseId: null}}}]}
    }
  };
}

function getResults(json, headers, api){
  const videos = [];

  const itemSectionRenders = json?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents ?? json?.contents?.sectionListRenderer?.contents ?? [];
  for(const itemSectionRender of itemSectionRenders){
    if(typeof itemSectionRender.itemSectionRenderer !== 'object' && typeof itemSectionRender.shelfRenderer === 'object'){
      if(!Array.isArray(itemSectionRender.shelfRenderer?.content?.verticalListRenderer?.items)) continue;
      for(const item of itemSectionRender.shelfRenderer.content.verticalListRenderer.items){
        if(Array.isArray(item?.elementRenderer?.newElement?.type?.componentType?.model?.horizontalTileShelfModel?.videoCards)){
          for(const videoCard of item.elementRenderer.newElement.type.componentType.model.horizontalTileShelfModel.videoCards){
            videos.push(transformApiData(videoCard));
          }
        } else if(typeof item?.elementRenderer?.newElement?.type?.componentType?.model?.compactVideoModel?.compactVideoData?.videoData === 'object'){
          const videoCard = item.elementRenderer.newElement.type.componentType.model.compactVideoModel.compactVideoData;
          videos.push(transformApiData(videoCard));
        } else if(typeof item?.compactVideoRenderer === 'object'){
          videos.push({
            videoRenderer: item.compactVideoRenderer
          });
        } else continue;
      }
    } else if(typeof itemSectionRender.itemSectionRenderer === 'object') {
      if(typeof itemSectionRender.itemSectionRenderer.contents !== 'object') continue;
      for(const content of itemSectionRender.itemSectionRenderer.contents){
        const contentKeys = Object.keys(content);
        if(contentKeys.indexOf('videoRenderer') >= 0){
          videos.push(content);
        } else if(contentKeys.indexOf('compactVideoRenderer') >= 0){
          videos.push({
            videoRenderer: content.compactVideoRenderer
          });
        } else if(typeof content?.elementRenderer?.newElement?.type?.componentType?.model?.compactVideoModel?.compactVideoData === 'object'){
          const videoCard = content.elementRenderer.newElement.type.componentType.model.compactVideoModel.compactVideoData;
          videos.push(transformApiData(videoCard));
        } else continue;
      }
    } else continue;
  }

  const results = [];
  
  for(var i = 0; i < videos.length; i++){
    const data = videos[i].videoRenderer;
    if(data){
      if(data.videoId){
        const video = new SearchData(data, headers, api);
        results.push(video);
      }
    }
  }

  return results;
}

function defaultExtractor(response, headers){
  var res = response;
  res = res.split('var ytInitialData = ')[1];
  if(!res) return reject(`The YouTube page has no initial data response`);

  res = res.split(';</script>')[0];

  const json = JSON.parse(res);
  return getResults(json, headers, false);
}

function search(ytstream, query, options){
  return new Promise((resolve, reject) => {
    if(typeof query !== 'string') return reject(`Query must be a string`);

    if(ytstream.preference === 'scrape'){
      var _options = options || {type: 'video'};

      var host = 'https://www.youtube.com/results?search_query=';

      let url = host + encodeURIComponent(query) + (_options['type'] !== 'video' ? '&sp=EgIQAQ%253D%253D' : '');

      let headers = { 
        'accept-language': 'en-US,en-IN;q=0.9,en;q=0.8,hi;q=0.7',
      };

      if(typeof ytstream.userAgent === 'string'){
        headers['user-agent'] = ytstream.userAgent;
      } else {
        headers['user-agent'] = userAgent();
      }

      for(const header in ytstream.headers){
        headers[header] = ytstream.headers[header];
      }

      headers['cookie'] = ytstream.agent.jar.getCookieStringSync('https://www.youtube.com');
      request(url, {
        headers: headers
      }, ytstream.agent).then(response => {
        resolve(defaultExtractor(response, headers));
      }).catch(err => {
        reject(err);
      });
    } else if(ytstream.preference === 'api'){
      const clientInfo = genClientInfo(undefined, ytstream.client);

      let endPoint = 'https://www.youtube.com/youtubei/v1/search' + (typeof ytstream.apiKey === 'string' ? '?key='+ytstream.apiKey : '?t='+genNonce(12))+'&prettyPrint=false';
      request(endPoint, {
        method: 'POST',
        body: JSON.stringify({
          ...clientInfo.body,
          query: query
        }),
        headers: clientInfo.headers
      }, ytstream.agent, 0, false).then(res => {
        let data;
        try{
          data = JSON.parse(res);
        } catch {
          reject(`Invalid response from the YouTube API`);
          return;
        }
        resolve(getResults(data, clientInfo.headers, true));
      }).catch(reject);
    }
  });
}

module.exports = {search};
