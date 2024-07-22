class Video{
    constructor(data, headers, api){
        this.id = data.videoId;
        this.url = `https://www.youtube.com/watch?v=${this.id}`;
        this.title = Array.isArray(data.title?.runs) ? data.title.runs[0].text : '';
        let authorObj = (data.ownerText ?? data.longBylineText);
        this.author = Array.isArray(authorObj?.runs) ? authorObj.runs[0].text : '';
        let channelObj = (data.ownerText ?? data.longBylineText);
        this.channel_id = Array.isArray(channelObj?.runs) ? channelObj.runs[0].navigationEndpoint.browseEndpoint.browseId : null;
        this.channel_url = this.channel_id ? `https://www.youtube.com/channel/`+this.channel_id : null;
        this.user_agent = headers['user-agent'];
        if(typeof headers['cookie'] === 'string'){
            this.cookie = headers['cookie'];
        } else {
            this.cookie = null;
        }

        if(data.lengthText){
            if(typeof data.lengthText.simpleText === 'string'){
                this.length_text = data.lengthText.simpleText;
            } else if(Array.isArray(data.lengthText?.runs)){
                this.length_text = data.lengthText.runs[0].text;
            }
            const length = this.length_text.split(':').reverse();
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
            if(typeof data.viewCountText.simpleText === 'string'){
                this.views_text = data.viewCountText.simpleText;
            } else if(Array.isArray(data.viewCountText?.runs)){
                this.views_text = data.viewCountText.runs[0].text;
            }
            if(this.views_text) this.views = parseInt(this.views_text.toLowerCase().split(',').join('').split(' ')[0]);
            else this.views_text = 'Unknown views';
        } else {
            this.view_text = 'Unknown views';
            this.views = 0;
        }
        
        this.thumbnail = data.thumbnail.thumbnails[0].url;
    }
}

module.exports = Video;
