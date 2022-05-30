const { Readable } = require('stream');
const cipher = require('../stream/decipher.js');
const { requestCallback } = require('../request/index.js');
const getInfo = require('../info.js').getInfo;

function parseAudio(formats){
    const audio = [];
    for(var i = 0; i < formats.length; i++){
        var format = formats[i];
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
    for(var i = 0; i < formats.length; i++){
        var format = formats[i];
        const type = format.mimeType;
        if(type.startsWith('video')){
            format.codec = type.split('codecs=')[1].split('"')[0];
            format.container = type.split('video/')[1].split(';')[0];
            video.push(format);
        }
    }
    return video;
}

class Stream{
    constructor(ytstream, url, options, info){
        this.stream = new Readable({highWaterMark: (options.highWaterMark || 1048576 * 32), read() {}}); 
        this.ytstream = ytstream;
        this.url = url;
        this.video_url = options.video_url;
        this.quality = options.quality;
        this.info = info;

        this.bytes_count = 0;
        this.contentLength = options.contentLength;
        this.duration = options.duration;
        this.type = options.type;

        this.req_type = options.req_type;

        this.per_sec_byte = Math.ceil(this.contentLength / this.duration);
        this.retryCount = 0;
        this.loop();
    }
    async retry(){
        const info = await getInfo(this.ytstream, this.video_url);
        
        const _ci = await cipher.format_decipher(info.formats, info.html5player);

        info.formats = _ci;

        var audioFormat = this.req_type === 'video' ? parseVideo(info.formats) : parseAudio(info.formats);

        if(audioFormat.length === 0) audioFormat = this.req_type === 'video' ? parseAudio(info.formats) : parseVideo(info.formats);

        this.url = typeof this.quality === 'number' ? (audioFormat[this.quality] ? audioFormat[this.quality].url : audioFormat[audioFormat.length - 1].url) : audioFormat[0].url;
        this.loop();
    }
    loop(){
        const end = this.bytes_count + this.per_sec_byte * 300;
        
        requestCallback(this.url, {
            headers: {
                range: `bytes=${this.bytes_count}-${end >= this.content_length ? '' : end}`
            }
        }).then(stream => {
            if(Number(stream.statusCode) >= 400){
                if(this.retryCount === 10){
                    return;
                } else {
                    ++this.retryCount;
                    return this.retry();
                }
            }
            stream.on('data', chunk => {
                this.bytes_count += chunk.length;
                this.stream.push(chunk);
            });

            stream.on('end', () => {
                if(end >= this.contentLength){
                    this.stream.push(null);
                }
            });
        }).catch(err => {
            throw new Error(err);
        });
    }
    pause(){
      this.stream.pause();
    }
    resume(){
      this.stream.resume();
    }
}

module.exports = Stream;
