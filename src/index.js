const validate = require('./validate.js');
const getInfo = require('./info.js').getInfo;
const getPlaylist = require('./playlist.js').getPlaylist;
const convert = require('./convert.js');
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
    }
    this.search = (...args) => {
      return search(this, ...args);
    }
    this.storedCookie = null;
		this.userAgent = null;
  }
  get cookie(){
    return this.storedCookie || process.env.YT_COOKIE;
  }
  set cookie(newCookie){
    this.storedCookie = newCookie;
  }
}

var ytstream = new YTStream();

module.exports = ytstream;
