const validate = require('./validate.js');
const getInfo = require('./info.js').getInfo;
const getPlaylist = require('./playlist.js').getPlaylist;
const convert = require('./convert.js');
const { Cookie, CookieJar } = require('tough-cookie');
const { YTStreamAgent } = require('./cookieHandler.js');
const stream = require('./stream/createstream.js').stream;
const search = require('./search/index.js').search;

let headers;
let agent = new YTStreamAgent();
let APIKey = null;
let preference = "scrape";
let client = null;

class YTStream{
  constructor(){
    this.validateURL = (...args) => {
      return validate.validateURL(this, ...args)
    };
    this.validateID = (...args) => {
      return validate.validateID(this, ...args);
    };
    this.validateVideoURL = (...args) => {
      return validate.validateVideoURL(this, ...args);
    };
    this.validatePlaylistURL = (...args) => {
      return validate.validatePlaylistURL(this, ...args);
    };
    this.validatePlayListID = (...args) => {
      return validate.validatePlaylistID(this, ...args);
    };
    this.getPlaylist = (...args) => {
      return getPlaylist(this, ...args);
    };
    this.getInfo = (...args) => {
      return getInfo(this, ...args);
    };
    this.getID = (...args) => {
      return convert.getID(this, ...args);
    };
    this.getURL = (...args) => {
      return convert.getURL(this, ...args);
    };
    this.stream = (...args) => {
      return stream(this, ...args);
    };
    this.search = (...args) => {
      return search(this, ...args);
    };
    this.setGlobalAgent = (_agent) => {
      if(typeof _agent === 'object'){
        if(_agent instanceof YTStreamAgent){
          agent = _agent;
        } else {
          agent = {
            agents: {},
            jar: new CookieJar()
          };
          if(typeof _agent.https === 'object' || typeof _agent.http === 'object'){
            agent.agents['https'] = _agent.https ?? _agent.http;
            agent.agents['http'] = _agent.http ?? _agent.https;
          } else {
            agent.agents['https'] = _agent;
            agent.agents['http'] = _agent;
          }
        }
      } else throw new Error(`Agent is not a valid agent`);
    };
    this.setGlobalHeaders = (_headers) => {
      if(typeof _headers !== 'object' || Array.isArray(_headers) || _headers === null) throw new Error(`Invalid headers. Headers must be a type of object and may not be an Array or null.`);
      _headers = {};
      for(const header in _headers){
        headers[header] = _headers[header];
      }
    }
    this.setApiKey = (apiKey) => {
      if(typeof apiKey !== 'string') throw new Error(`API key must be a type of string. Received type of ${typeof apiKey}`);
      APIKey = apiKey;
    }
    this.setPreference = (_preference, _client) => {
      if(typeof _preference !== 'string') throw new Error(`Preference must be a type of string. Received type of ${typeof _preference}`);
      if(['scrape', 'api'].indexOf(_preference.toLowerCase()) < 0) throw new Error(`Preference must be either 'scrape' or 'api'. Received ${_preference}`);
      if(typeof _client === 'string'){
        if(['IOS', 'ANDROID', 'WEB'].indexOf(_client.toUpperCase()) < 0) throw new Error(`Client must be one of IOS, ANDROID or WEB. Received ${_client}`);
        client = _client.toUpperCase();
      }
      preference = _preference.toLowerCase();
    }
    this.Cookie = Cookie;
    this.YTStreamAgent = YTStreamAgent;
    this.userAgent = null;
  }
  get agent(){
    return agent;
  }
  get headers(){
    return headers;
  }
  get apiKey(){
    return APIKey;
  }
  get preference(){
    return preference;
  }
  get client(){
    return client;
  }
}

module.exports = new YTStream();
