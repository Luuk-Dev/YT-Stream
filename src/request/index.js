const http = require('http');
const https = require('https');
const { Cookie } = require('tough-cookie');
const { YTStreamAgent } = require('../cookieHandler.js');
const { ValueSaver } = require('valuesaver');

const cache = new ValueSaver();

setInterval(() => {
  cache.clear();
}, 6e4);

const requestType = {https: https, http: http};

const _validate = require('./url.js');

function handleCookies(res, agent){
  if(!(agent instanceof YTStreamAgent)) return;
  const headerKeys = Object.keys(res.headers).map(h => h.toLowerCase());
  const headerValues = Object.values(res.headers);
  
  const cookieIndex = headerKeys.indexOf('set-cookie');
  if(cookieIndex >= 0){
    const cookies = headerValues[cookieIndex];
    if(typeof cookies === 'string'){
      agent.addCookies([Cookie.parse(cookies)]);
    } else if(Array.isArray(cookies)){
      agent.addCookies(cookies.map(c => Cookie.parse(c)));
    }
  }
}

function request(_url, options, agent, retryCount = 0, force = false){
  return new Promise(async (resolve, reject) => {
    if(typeof _url !== 'string') return reject(`URL is not a string`);
    let response = '';

    const url = _validate(_url);
    if(!url) return reject(`Invalid URL`);

    const cachedPage = cache.get(_url);
    if(cachedPage && !force) return resolve(cachedPage);

    const protocol = url.protocol.split(':').join('');
    const prreq = requestType[protocol];

    const http_options = {
      headers: options.headers || {cookie: agent.jar.getCookieStringSync('https://www.youtube.com')},
      path: url.pathname + url.search,
      host: url.hostname,
      method: options.method || 'GET',
      agent: agent instanceof YTStreamAgent ? agent.agents[protocol] : (typeof agent === 'object' ? (typeof agent.agents === 'object' ? agent.agents[protocol] : agent) : undefined),
      localAddress: agent.localAddress
    };

    const req = prreq.request(http_options, res => {
      if(res.statusCode >= 300 || res.statusCode < 200){
        if(res.statusCode >= 300 && res.statusCode < 400 && retryCount < 3){
          const headersKeys = Object.keys(res.headers).map(h => h.toLowerCase());
          const headerValues = Object.values(res.headers);
          const locationIndex = headersKeys.indexOf('location');
          if(locationIndex >= 0){
            request(headerValues[locationIndex], options, agent, ++retryCount, force).then(resolve).catch(reject);
          }
        }
        return reject(`Error while receiving information. Server returned with status code ${res.statusCode}.`);
      }
      handleCookies(res, agent);

      res.on('data', data => {
        response += data;
      });
      res.on('end', () => {
        cache.set(_url, response);
        resolve(response);
      });
      res.on('error', error => {
        reject(error);
      });
    });

    req.on('error', error => {
      reject(error);
    });

    if(typeof options.body === 'string'){
      req.write(options.body);
    }

    req.end();
  });
}

function requestCallback(_url, options, agent, parsedOnly = false){
    return new Promise(async (resolve, reject) => {
        if(typeof _url !== 'string') return reject(`URL is not a string`);
  
        const url = _validate(_url);
        if(!(url instanceof URL)) reject(`Invalid URL`);

        const protocol = url.protocol.split(':').join('');
        const prreq = requestType[protocol];

        const http_options = {
          headers: options.headers || {cookie: agent.jar.getCookieStringSync('https://www.youtube.com')},
          path: url.pathname + url.search,
          host: url.hostname,
          method: options.method || 'GET',
          agent: agent instanceof YTStreamAgent ? agent.agents[protocol] : (typeof agent === 'object' ? (typeof agent.agents === 'object' ? agent.agents[protocol] : agent) : undefined),
          localAddress: agent.localAddress
        };

        if(parsedOnly === false){
          const req = prreq.request(http_options, stream => resolve({stream, req: req}));

          req.on('error', error => {
            reject(error);
          });

          if(typeof options.body === 'string'){
            req.write(options.body);
          }

          req.end();
        } else {
          const req = prreq.request(url, stream => resolve({stream, req: req}));

          req.on('error', error => {
            reject(error);
          });

          if(typeof options.body === 'string'){
            req.write(options.body);
          }

          req.end();
        }
    });
}

module.exports = {request, requestCallback};
