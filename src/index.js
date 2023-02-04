const validate = require('./validate.js');
const getInfo = require('./info.js').getInfo;
const getPlaylist = require('./playlist.js').getPlaylist;
const convert = require('./convert.js');
const stream = require('./stream/createstream.js').stream;
const search = require('./search/index.js').search;

class YTStream{
  constructor(){
    this.validateURL = function(...args){
      return validate.validateURL(this, ...args)
    };
    this.validateID = function(...args){
      return validate.validateID(this, ...args);
    };
    this.validateVideoURL = function(...args){
      return validate.validateVideoURL(this, ...args);
    };
    this.validatePlaylistURL = function(...args){
      return validate.validatePlaylistURL(this, ...args);
    };
    this.validatePlayListID = function(...args){
      return validate.validatePlaylistID(this, ...args);
    };
    this.getPlaylist = function(...args){
      return getPlaylist(this, ...args);
    };
    this.getInfo = function(...args){
      return getInfo(this, ...args);
    };
    this.getID = function(...args){
      return convert.getID(this, ...args);
    };
    this.getURL = function(...args){
      return convert.getURL(this, ...args);
    };
    this.stream = function(...args){
      return stream(this, ...args);
    }
    this.search = function(...args){
      return search(this, ...args);
    }
    this.userAgent = null;
    this.storedCookie = null;
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
