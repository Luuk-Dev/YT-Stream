const { validatePlaylistURL } = require("./validate.js");
const _url = require('./request/url.js');
const { requestCallback, request } = require("./request/index.js");
const userAgent = require("./request/useragent.js").getRandomUserAgent;
const { getID } = require("./convert.js");
const Playlist = require("./classes/playlist.js");
const genClientInfo = require('./genClient.js');

function genNonce(length){
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
    let nonce = "";
    while(nonce.length < length){
      nonce += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    return nonce;
}

function getPlaylist(ytstream, url){
    return new Promise(async (resolve, reject) => {
        if(!validatePlaylistURL(ytstream, url)) throw new Error(`Invalid YouTube playlist url`);

        let listId = null;
        const parsed = _url(url);
        if(['youtube.com', 'music.youtube.com'].includes(parsed.hostname.toLowerCase().split('www.').join(''))) listId = getID(ytstream, url);
        else if(parsed.hostname.toLowerCase().split('www.').join('') === `youtu.be`){
            if(parsed.pathname.toLowerCase().startsWith('/playlist')){
                const newurl = 'https://www.youtube.com'+parsed.pathname+parsed.search;
                listId = getID(ytstream, newurl);
            }
        }

        if(listId === null) return reject(`Invalid YouTube url`);

        if(ytstream.preference === 'scrape'){
            const userA = typeof ytstream.userAgent === 'string' ? ytstream.userAgent : userAgent();

            let headers = { 
                'accept-language': 'en-US,en-IN;q=0.9,en;q=0.8,hi;q=0.7',
                'user-agent' : userA,
            };

            for(const header in ytstream.headers){
                headers[header] = ytstream.headers[header];
            }

            headers['cookie'] = ytstream.agent.jar.getCookieStringSync('https://www.youtube.com');

            var request_url = `https://www.youtube.com/playlist?list=${listId}&has_verified=1`;

            var response;
            try{
                response = await requestPlayList(request_url, headers, ytstream.agent);
            } catch (err){
                reject(err);
            }

            response = response.split('var ytInitialData = ')[1];
            if(!response) return reject(`The YouTube playlist has no initial data response`);

            response = response.split(';</script>')[0];
            if(!response) return reject(`The YouTube playlist has no initial data response`);

            var json = response;
            try{
                json = JSON.parse(json);
            } catch {}
            
            var alerts = (json.alerts || []);
            alerts.push({alertRenderer: {}});
            var errors = alerts.filter(a => {
                return (a.alertRenderer || a.alertWithButtonRenderer).type === 'ERROR';
            });
            if(errors.length > 0) return reject(errors[0].alertRenderer.text.runs[0].text);
            resolve(new Playlist(json, headers, listId));
        } else if(ytstream.preference === 'api'){
            const clientInfo = genClientInfo(undefined, ytstream.client);

            let endPoint = 'https://www.youtube.com/youtubei/v1/browse' + (typeof ytstream.apiKey === 'string' ? '?key='+ytstream.apiKey : '?t='+genNonce(12))+'&prettyPrint=false';
            request(endPoint, {
                method: 'POST',
                body: JSON.stringify({...clientInfo.body, browseId: !listId.startsWith("VL") ? `VL${listId}` : listId}),
                headers: clientInfo.headers
            }, ytstream.agent, 0, false).then(res => {
                let data;
                try{
                data = JSON.parse(res);
                } catch {
                    reject(`Invalid response from the YouTube API`);
                    return;
                }
                resolve(new Playlist(data, clientInfo.headers, listId));
            }).catch(reject);
        }
    });
}

function requestPlayList(url, headers, agent){
    return new Promise(async (resolve, reject) => {
        
        let options = {
            headers: headers,
            method: 'GET'
        };

        var res;
        try{
            res = await requestCallback(url, options, agent, false);
        } catch(err) {
            return reject(err);
        }
        
        while(_url((res.stream.headers.location ?? '')) !== false){
            res = await requestCallback(res.stream.headers.location, options, agent, false);
        }

        var response = '';
        res.stream.on('data', d => {
            response += d;
        });

        res.stream.on('end', () => {
            resolve(response);
        });

        res.stream.on('error', err => {
            reject(err);
        });
    });
}

module.exports = {
    getPlaylist
};
