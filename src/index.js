const validate = require('./validate.js');
const getInfo = require('./info.js').getInfo;
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
    this.cookie = null;
		this.userAgent = null;
  }
}

var ytstream = new YTStream();

module.exports = ytstream;
