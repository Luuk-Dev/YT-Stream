const request = require('../request/index.js').request;
const SearchData = require('../classes/searchdata.js');
const userAgent = require('../request/useragent.js').getRandomUserAgent;

function defaultExtractor(response){
  var res = response;
  res = res.split('var ytInitialData = ')[1];
  if(!res) return console.log(response);

  res = res.split(';</script>')[0];

  const json = JSON.parse(res);

  const videos = json.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;

  const results = [];
  
  for(var i = 0; i < videos.length; i++){
    const data = videos[i].videoRenderer;
    if(data){
      if(data.videoId){
        const video = new SearchData(data);
        results.push(video);
      }
    }
  }

  return results;
}

function search(query, options){
  if(typeof query !== 'string') throw new Error(`Query must be a string`);

  var _options = options || {type: 'music'};

  var host = 'https://www.youtube.com/results?search_query=';

  let url = host + encodeURIComponent(query) + (_options['type'] !== 'music' ? '&sp=EgIQAQ%253D%253D' : '');

  let headers = { 
    'accept-language': 'en-US,en-IN;q=0.9,en;q=0.8,hi;q=0.7',
    'user-agent': userAgent(),
  };

  return new Promise((resolve, reject) => {
    request(url, {
      headers: headers
    }).then(response => {
      resolve(defaultExtractor(response));
    }).catch(err => {
      reject(err);
    });
  });
}

module.exports = {search};
