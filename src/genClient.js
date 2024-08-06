const androidUserAgents = [{
    agent: 'com.google.android.youtube/19.28.35(Linux; U; Android 13; en_US; sdk_gphone64_x86_64 Build/UPB4.230623.005) gzip',
    clientVersion: '19.28.35',
    deviceModel: 'sdk_gphone64_x86_64',
    sdkVersion: 33
}, {
    agent: 'com.google.android.youtube/19.28.35(Linux; U; Android 13; en_US; M2103K19G Build/TP1A.220624.014) gzip',
    clientVersion: '19.28.35',
    deviceModel: 'M2103K19G',
    sdkVersion: 33
}, {
    agent: 'com.google.android.youtube/19.28.35(Linux; U; Android 14; en_US; 23073RPBFG Build/UKQ1.231003.002) gzip',
    clientVersion: '19.28.35',
    deviceModel: '23073RPBFG',
    sdkVersion: 33
}, {
    agent: 'com.google.android.youtube/19.28.35(Linux; U; Android 13; en_US; CPH2557 Build/TP1A.220905.001) gzip',
    clientVersion: '19.28.35',
    deviceModel: 'CPH2557',
    sdkVersion: 33
}];
const iosUserAgents = [{
    agent: 'com.google.ios.youtube/18.06.35 (iPhone; CPU iPhone OS 14_4 like Mac OS X; en_US)',
    clientVersion: '18.06.35',
    deviceModel: 'iPhone10,6'
}, {
    agent: 'com.google.ios.youtube/19.09.3 (iPhone14,3; U; CPU iOS 15_6 like Mac OS X en_US)',
    clientVersion: '19.09.3',
    deviceModel: 'iPhone14,3'
}, {
    agent: 'com.google.ios.youtube/19.28.1 (iPhone16,2; U; CPU IOS 17_5_1 like Mac OS X; en_US)',
    clientVersion: '19.28.1',
    deviceModel: 'iPhone16,2'
}];

function genNonce(length){
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
    let nonce = "";
    while(nonce.length < length){
      nonce += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    return nonce;
}

function genClientInfo(videoId, preferedClient){

    const clientTypes = ['ANDROID', 'IOS'];
    const client = preferedClient ?? clientTypes[Math.round(Math.random() * (clientTypes.length - 1))];

    let headers = {
        'x-youtube-client-name': '',
        'x-youtube-client-version': '',
        'origin': 'https://www.youtube.com',
        'user-agent': '',
        'content-type': 'application/json'
    };
    
    let userAgent, clientVersion;
    let contextBuilder = {
        context: {
            client: {
                cpn: genNonce(16),
                clientName: client,
                clientVersion: undefined,
                deviceModel: undefined,
                userAgent: undefined,
                hl: 'en',
                timeZone: 'UTC',
                utcOffsetMinutes: 0,
                acceptLanguage: 'en-US',
                acceptRegion: 'US'
            }
        },
        contentCheckOk: true,
        racyCheckOk: true,
        attestationRequest: {
            omitBotguardData: true
        }
    };
    if(typeof videoId === 'string'){
        contextBuilder = {
            ...contextBuilder,
            videoId: videoId,
            playbackContext: {
                contentPlaybackContext: {
                    html5Preference: 'HTML5_PREF_WANTS',
                    vis: 0,
                    splay: false,
                    referer: `https://www.youtube.com/watch?v=${videoId}`,
                    currentUrl: `/watch?v=${videoId}`,
                    autonavState: 'STATE_ON',
                    autoCaptionsDefaultOn: false,
                    lactMilliseconds: '-1'
                }
            }
        };
    }
    switch(client){
        case 'ANDROID':
            let androidRandomAgent = androidUserAgents[Math.round(Math.random() * (androidUserAgents.length - 1))];
            userAgent = androidRandomAgent.agent;
            clientVersion = androidRandomAgent.clientVersion;
            contextBuilder.context.client.deviceModel = androidRandomAgent.deviceModel;
            contextBuilder.context.client['androidSdkVersion'] = androidRandomAgent.sdkVersion;
            headers['x-youtube-client-name'] = '3';
            headers['x-goog-api-format-version'] = '2';
            break;
        case 'IOS':
            let iosRandomAgent = iosUserAgents[Math.round(Math.random() * (iosUserAgents.length - 1))];
            userAgent = iosRandomAgent.agent;
            clientVersion = iosRandomAgent.clientVersion;
            contextBuilder.context.client.deviceModel = iosRandomAgent.deviceModel;
            headers['x-youtube-client-name'] = '5';
            break;
    }
    contextBuilder.context.client.userAgent = userAgent;
    contextBuilder.context.client.clientVersion = clientVersion;
    headers['user-agent'] = userAgent;
    headers['x-youtube-client-version'] = clientVersion;

    return {
        headers,
        body: contextBuilder
    };
}

module.exports = genClientInfo;
