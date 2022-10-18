class Video{
    constructor(data, headers){
        this.id = data.videoId;
        this.url = `https://www.youtube.com/watch?v=${this.id}`;
        this.title = data.title.runs[0].text;
        this.author = data.ownerText.runs[0].text;
        this.channel_id = data.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId;
        this.channel_url = `https://www.youtube.com${data.ownerText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`;
        this.user_agent = headers['user-agent'];
        if(typeof headers['cookie'] === 'string'){
            this.cookie = headers['cookie'];
        } else {
            this.cookie = null;
        }

        if(data.lengthText){
            this.length_text = data.lengthText.simpleText;
            const length = this.lengthText.split(':').reverse();
            var timestampLength = 0;
            for(var i = 0; i < length.length; i++){
            const l = length[i];
            if(i < 3) timestampLength += l * Math.pow(60, i) * 1000;
            else if(i === 3) timestampLength += l * 24 * Math.pow(60, i) * 1000;
            }
            this.length = timestampLength;
        } else {
            this.length_text = 'Unknown length';
            this.length = 0;
        }

        if(data.viewCountText){
            this.views_text = data.viewCountText.simpleText;
            if(data.viewCountText.simpleText) this.views = parseInt(data.viewCountText.simpleText.toLowerCase().split(',').join('').split(' ')[0]);
            else this.views_text = 'Unknown views';
        } else {
            this.view_text = 'Unknown views';
            this.views = 0;
        }
        
        this.thumbnail = data.thumbnail.thumbnails[0].url;
    }
}

module.exports = Video;
