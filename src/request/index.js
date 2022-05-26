const http = require('http');
const https = require('https');

const requestType = {https: https, http: http};

const _validate = require('./url.js');

function request(_url, options){
  return new Promise((resolve, reject) => {
    if(typeof _url !== 'string') return reject(`URL is not a string`);
    let response = '';

    const url = _validate(_url);
    if(!url) reject(`Invalid URL`);

    const protocol = url.protocol.split(':').join('');
    const prreq = requestType[protocol];

    const agent = new prreq.Agent({
      keepAlive: true,
      keepAliveMsecs: (Math.round(Math.random() * 10) + 10),
      timeout: 2000
    });

    const http_options = {
      headers: options.headers || {},
      path: url.pathname + url.search,
      host: url.hostname,
      method: options.method || 'GET',
      agent: agent
    };

    const req = prreq.request(http_options, res => {
      res.on('data', data => {
        response += data;
      });
      res.on('end', () => {
        resolve(response);
      });
    });

    req.on('error', error => {
      reject(error);
    });

    req.end();
  });
}

function requestCallback(_url, options){
    return new Promise((resolve, reject) => {
        if(typeof _url !== 'string') return reject(`URL is not a string`);
  
        const url = _validate(_url);
        if(!(url instanceof URL)) reject(`Invalid URL`);

        const protocol = url.protocol.split(':').join('');
        const prreq = requestType[protocol];

        const agent = new prreq.Agent({
          keepAlive: true,
          keepAliveMsecs: (Math.round(Math.random() * 3) + 5),
          timeout: 5000
        });

        const http_options = {
          headers: options.headers || {},
          path: url.pathname + url.search,
          host: url.hostname,
          method: options.method || 'GET',
          agent: agent
        };

        const req = prreq.request(http_options, resolve);

        req.on('error', error => {
            reject(error);
        });

        req.end();
    });
}

module.exports = {request, requestCallback};
