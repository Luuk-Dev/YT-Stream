const validate = require('../validate.js').validateVideoURL;
const getInfo = require('../info.js').getInfo;
const Stream = require('../classes/stream.js');
const Data = require('../classes/ytdata.js');
const cipher = require('./decipher.js');

function parseAudio(formats){
    const audio = [];
	var audioFormats = formats.filter(f => f.mimeType.startsWith('audio'));
    for(var i = 0; i < audioFormats.length; i++){
        var format = audioFormats[i];
        const type = format.mimeType;
        if(type.startsWith('audio')){
            format.codec = type.split('codecs=')[1].split('"')[0];
            format.container = type.split('audio/')[1].split(';')[0];
            audio.push(format);
        }
    }
    return audio;
}

function parseVideo(formats){
    const video = [];
	var videoFormats = formats.filter(f => f.mimeType.startsWith('video'));
    for(var i = 0; i < videoFormats.length; i++){
        var format = videoFormats[i];
        const type = format.mimeType;
        if(type.startsWith('video')){
            format.codec = type.split('codecs=')[1].split('"')[0];
            format.container = type.split('video/')[1].split(';')[0];
            video.push(format);
        }
    }
    return video;
}

function getStreamURL(info, options){
    return new Promise((resolve, reject) => {
        const formats = info.formats;
        var selectedFormat = null;
        var _options = options || {};
        var vid = _options['type'] === 'video' ? parseVideo(formats) : parseAudio(formats);

        if(vid.length === 0) vid = _options['type'] === 'video' ? parseAudio(formats) : parseVideo(formats);

        if(vid.length === 0) return reject(`There were no playable formats found`);

        _options['quality'] = typeof _options['quality'] === 'string' ? _options['quality'].toLowerCase() : _options['quality'];
        if(typeof _options['quality'] !== 'number'){
            for(var i = 0; i < vid.length; i++){
                let format = vid[i];
                if(!selectedFormat){
                    selectedFormat = format;
                } else {
                    if(_options['quality'] === 'high'){
                        if(format.bitrate > selectedFormat.bitrate){
                            selectedFormat = format;
                        }
                    } else {
                        if(format.bitrate < selectedFormat.bitrate){
                            selectedFormat = format;
                        }
                    }
                }
            }
        } else {
            if(_options['quality'] > vid.length) _options['quality'] = vid.length - 1;
            else if(_options['quality'] < vid.length) _options['quality'] = 0;
            selectedFormat = vid[_options['quality']];
        }
        var { url } = selectedFormat;
        let type = selectedFormat.codec === 'opus' && selectedFormat.container === 'webm' ? 'webm/opus' : 'arbitrary';
        resolve({
            url: url,
            contentLength: selectedFormat.contentLength,
            type: type,
            quality: typeof _options['quality'] === 'string' ? (_options['quality'] === 'high' ? vid.length - 1 : 0) : (_options['quality'] || 0),
            req_type: (_options['type'] || 'audio'),
            container: selectedFormat.container,
            format: selectedFormat
        });
    });
}

function stream(ytstream, info, options){
    if(typeof info !== 'object' && typeof info !== 'string') throw new Error(`Info is a required parameter and must be an object or a string`);
    var _options = typeof options === 'object' ? options : {};
    var _info = info;
    return new Promise(async (resolve, reject) => {
        var stream_res;
        if(typeof info === 'string'){
            if(!validate(ytstream, info)) return reject(`URL is not a valid YouTube URL`);
            try{
                _info = await getInfo(ytstream, info);
                const _ci = await cipher.format_decipher(_info.formats, _info.html5player);
                _info.formats = _ci;
                stream_res = await getStreamURL(_info, _options);
            } catch (err) {
                return reject(err);
            }
        } else if(info instanceof Data){
            try{
                const _ci = await cipher.format_decipher(_info.formats, _info.html5player);
                _info.formats = _ci;
                stream_res = await getStreamURL(_info, _options);
            } catch (err) {
                return reject(err);
            }
        } else return reject(`Invalid info has been parsed to the stream function`);
        const stream = new Stream(ytstream, stream_res.url, {
            highWaterMark: _options['highWaterMark'] || undefined,
            duration: _info.duration,
            contentLength: stream_res.contentLength,
            type: stream_res.type,
            quality: stream_res.quality,
            video_url: _info.url,
            req_type: stream_res.req_type,
            container: stream_res.container,
            download: typeof _options['download'] === 'boolean' ? _options['download'] : true,
            format: stream_res.format,
            ytstream: ytstream
        }, _info);
        if(stream.ready === true){
            resolve(stream);
        } else {
            stream.once('ready', () => {
                resolve(stream);
            });
        }
    });
}


module.exports = {
    stream: stream
};
