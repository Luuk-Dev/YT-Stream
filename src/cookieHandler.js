const { Cookie, CookieJar, canonicalDomain } = require('tough-cookie');
const { HttpCookieAgent, HttpsCookieAgent } = require('http-cookie-agent/http');
const fs = require('fs');
const path = require('path');

function toDate(cookie){
    if(typeof cookie.expirationDate === 'string'){
        if(cookie.expirationDate.toLowerCase() === 'infinity') return 'Infinity';
        return new Date(cookie.expirationDate);
    } else if(typeof cookie.expires === 'string'){
        if(cookie.expires.toLowerCase() === 'infinity') return 'Infinity';
        return new Date(cookie.expires);
    } else if(typeof cookie.expirationDate === 'number'){
        return new Date(cookie.expirationDate * 1000);
    } else if(typeof cookie.expires === 'number'){
        return new Date(cookie.expires * 1000);
    } else return 'Infinity';
}

function addCookiesToJar(cookies, jar){
    for(const cookie of cookies){
        if(cookie instanceof Cookie) jar.setCookieSync(cookie, 'https://www.youtube.com');
        else if(typeof cookie === 'object' && !Array.isArray(cookie) && cookie !== null){
            if(typeof cookie.key !== 'string' && typeof cookie.name !== 'string') throw new Error(`Invalid cookie. A cookie must have a key or name.`);
            if(typeof cookie.domain !== 'string') throw new Error(`Invalid cookie. A cookie must have a domain.`);
            jar.setCookieSync(new Cookie({
                key: cookie.key ?? cookie.name,
                value: typeof cookie.value === 'string' ? cookie.value : "",
                domain: canonicalDomain(cookie.domain),
                httpOnly: typeof cookie.httpOnly === 'boolean' ? cookie.httpOnly : false,
                hostOnly: typeof cookie.hostOnly === 'boolean' ? cookie.hostOnly : false,
                secure: typeof cookie.secure === 'boolean' ? cookie.secure : false,
                path: typeof cookie.path === 'string' ? cookie.path : '/',
                expires: toDate(cookie),
                sameSite: ['lax', 'samesite'].indexOf((cookie.sameSite ?? "").toLowerCase()) >= 0 ? cookie.sameSite : 'None'
            }), 'https://www.youtube.com');
        } else throw new Error(`Invalid cookie. Cookie must be an instance of Cookie class or an object.`);
    }

    return jar;
}

class YTStreamAgent {
    constructor(cookies, options){
        if(typeof options !== 'object' || Array.isArray(options) || options === null) options = {timeout: 5000, keepAlive: true, keepAliveMsecs: (Math.round(Math.random() * 3) + 5)};

        if(!(options.cookies?.jar instanceof CookieJar)){
            options.cookies = {};
            options.cookies.jar = new CookieJar();
        }
        this.jar = options.cookies.jar;
        this._options = options;

        if(typeof cookies === 'string') this.syncFile(cookies);
        else if(!Array.isArray(cookies)) cookies = [];
        else {
            if(!!!cookies.filter(c => c.name === 'SOCS').length){
                options.cookies.jar.setCookieSync(new Cookie({
                    key: 'SOCS',
                    value: 'CAI',
                    sameSite: 'lax',
                    hostOnly: false,
                    secure: true,
                    path: '/',
                    httpOnly: false,
                    domain: 'youtube.com'
                }), 'https://www.youtube.com');
            }
            options.cookies.jar = addCookiesToJar(cookies, options.cookies.jar);
        }

        this.agents = {
            https: new HttpsCookieAgent(options),
            http: new HttpCookieAgent(options)
        };
        this.localAddress = options.localAddress;
        this._cookies = this.jar.getCookiesSync('https://www.youtube.com')?? [];
        this.syncedFile = '';
    }
    addCookies(cookies){
        if(!Array.isArray(cookies)) cookies = [];
        if(!(this.jar instanceof CookieJar)) throw new Error(`Jar property is not an instance of CookieJar`);
        this.jar = addCookiesToJar(cookies, this.jar);
        this._options.cookies.jar = this.jar;
        if(this.syncedFile.length > 0){
            fs.writeFileSync(this.syncedFile, JSON.stringify(this.jar.getCookiesSync('https://www.youtube.com'), null, 2));
        }
    }
    removeCookies(force){
        if(force){
            if(Object.keys(this._options).indexOf('cookies') >= 0) delete this._options.cookies;
            this.jar = new CookieJar();
            let options = {..._this._options, cookies: {jar: this.jar}};
            this.agents = {
                https: new HttpsCookieAgent(options),
                http: new HttpCookieAgent(options)
            };
        } else {
            if(!(this._options.cookies?.jar instanceof CookieJar)){
                this._options.cookies = {};
                this._options.cookies.jar = new CookieJar();
            }
    
            if(!!!this._cookies.filter(c => c.name === 'SOCS').length){
                this._options.cookies.jar.setCookieSync(new Cookie({
                    key: 'SOCS',
                    value: 'CAI',
                    sameSite: 'lax',
                    hostOnly: false,
                    secure: true,
                    path: '/',
                    httpOnly: false,
                    domain: 'youtube.com'
                }), 'https://www.youtube.com');
            }
            this._options.cookies.jar = addCookiesToJar(this._cookies, this._options.cookies.jar);
    
            this.jar = this._options.cookies.jar;
            this.agents = {
                https: new HttpsCookieAgent(this._options),
                http: new HttpCookieAgent(this._options)
            };
        }
    }
    syncFile(filePath){
        if(typeof filePath !== 'string') throw new Error(`Expected the file path to be a type of string, received ${typeof filePath}`);
        if(path.extname(filePath) !== ".json") throw new Error(`File expected to have .json extension name, received ${path.extname(filePath)}`);
        if(!path.isAbsolute(filePath)) filePath = path.join(process.cwd(), filePath);
        if(!fs.existsSync(filePath)) throw new Error(`Couldn't find a file with the path '${filePath}'. Make sure that the file exists and the path is either absolute or relative to the root of the process`);
        let cookies = fs.readFileSync(filePath);
        try{
            cookies = JSON.parse(cookies);
        } catch {
            throw new Error(`Cookies from imported file is not a valid json object`);
        }
        if(!Array.isArray(cookies)) throw new Error(`Imported cookies expected to be an array, received type of ${typeof cookies}, but no array`);
        this.syncedFile = filePath;
        this.jar = addCookiesToJar(cookies, this.jar);
        this._options.cookies.jar = this.jar;
    }
}

module.exports = { YTStreamAgent };
