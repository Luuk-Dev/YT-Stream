const request = require('../request/index.js').request;
const SearchData = require('../classes/searchdata.js');
const userAgent = require('../request/useragent.js').getRandomUserAgent;

function defaultExtractor(response, headers){
  var res = response;
  res = res.split('var ytInitialData = ')[1];
  if(!res) return reject(`The YouTube page has no initial data response`);

  res = res.split(';</script>')[0];

  const json = JSON.parse(res);

  const videos = json.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;

  const results = [];
  
  for(var i = 0; i < videos.length; i++){
    const data = videos[i].videoRenderer;
    if(data){
      if(data.videoId){
        const video = new SearchData(data, headers);
        results.push(video);
      }
    }
  }

  return results;
}

function search(ytstream, query, options){
  if(typeof query !== 'string') throw new Error(`Query must be a string`);

  var _options = options || {type: 'video'};

  var host = 'https://www.youtube.com/results?search_query=';

  let url = host + encodeURIComponent(query) + (_options['type'] !== 'vidoe' ? '&sp=EgIQAQ%253D%253D' : '');

  let headers = { 
    'accept-language': 'en-US,en-IN;q=0.9,en;q=0.8,hi;q=0.7',
  };

  if(typeof ytstream.userAgent === 'string'){
    headers['user-agent'] = ytstream.userAgent;
  } else {
    headers['user-agent'] = userAgent();
  }

  if(typeof ytstream.cookie === 'string'){
    headers['cookie'] = ytstream.cookie;
  }

  return new Promise((resolve, reject) => {
    request(url, {
      headers: headers
    }).then(response => {
      resolve(defaultExtractor(response, headers));
    }).catch(err => {
      reject(err);
    });
  });
}

module.exports = {search};
