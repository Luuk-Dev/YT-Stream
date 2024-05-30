const validate = require('./validate.js');
const getInfo = require('./info.js').getInfo;
const getPlaylist = require('./playlist.js').getPlaylist;
const convert = require('./convert.js');
const { Cookie } = require('tough-cookie');
const { YTStreamAgent } = require('./cookieHandler.js');
const stream = require('./stream/createstream.js').stream;
const search = require('./search/index.js').search;

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
    this.setGlobalAgent = (agent) => {
      if(!(agent instanceof YTStreamAgent)) throw new Error(`Global agent must be an instance of YTStreamAgent`);
      this.agent = agent;
    };
    this.setGlobalHeaders = (headers) => {
      if(typeof headers !== 'object' || Array.isArray(headers) || headers === null) throw new Error(`Invalid headers. Headers must be a type of object and may not be an Array or null.`);
      this.headers = {};
      for(const header in headers){
        this.headers[header] = headers[header];
      }
    }
		this.userAgent = null;
    this.headers = {};
    this.Cookie = Cookie;
    this.YTStreamAgent = YTStreamAgent;
    this.agent = new YTStreamAgent();
  }
}

module.exports = new YTStream();
