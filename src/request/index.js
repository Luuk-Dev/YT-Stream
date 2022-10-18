const http = require('http');
const https = require('https');
const dns = require('dns');
const { promisify } = require("util");

const lookup = promisify(dns.lookup);

const requestType = {https: https, http: http};

const _validate = require('./url.js');

function request(_url, options){
  return new Promise(async (resolve, reject) => {
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

    var dnsInfo;
    try{
      dnsInfo = await lookup(url.hostname, {hints: 0});
    } catch {
      dnsInfo = {family: 4};
    }

    const http_options = {
      headers: options.headers || {},
      path: url.pathname + url.search,
      host: url.hostname,
      method: options.method || 'GET',
      agent: agent,
      family: dnsInfo.family
    };

    const req = prreq.request(http_options, res => {
      res.on('data', data => {
        response += data;
      });
      res.on('end', () => {
        resolve(response);
      });
      res.on('error', error => {
        reject(error);
      });
    });

    req.on('error', error => {
      reject(error);
    });

    req.end();
  });
}

function requestCallback(_url, options, parsedOnly = false){
    return new Promise(async (resolve, reject) => {
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
    
        var dnsInfo;
        try{
          dnsInfo = await lookup(url.hostname, {hints: 0});
        } catch {
          dnsInfo = {family: 4};
        }

        const http_options = {
          headers: options.headers || {},
          path: url.pathname + url.search,
          host: url.hostname,
          method: options.method || 'GET',
          agent: agent,
          family: dnsInfo.family
        };

        if(parsedOnly === false){
          const req = prreq.request(http_options, resolve);

          req.on('error', error => {
              reject(error);
          });

          req.end();
        } else {
          const req = prreq.request(url, resolve);

          req.on('error', error => {
              reject(error);
          });

          req.end();
        }
    });
}

module.exports = {request, requestCallback};
