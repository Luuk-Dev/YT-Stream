class PlaylistVideo{
    constructor(data, videodata){
        this.title = Array.isArray(videodata?.title?.runs) ? videodata.title.runs[0].text : '';
        this.video_id = videodata.videoId;
        this.video_url = `https://www.youtube.com/watch?v=${videodata.videoId}`;
        if(typeof videodata.index?.simpleText === 'string'){
            this.position = parseInt(videodata.index.simpleText);
        } else if(Array.isArray(videodata.index?.runs)){
            this.position = parseInt(videodata.index.runs[0].text);
        }
        if(typeof videodata.lengthText?.simpleText === 'string'){
            this.length_text = videodata.lengthText.simpleText;
        } else if(Array.isArray(videodata.lengthText?.runs)){
            this.length_text = videodata.lengthText.runs[0].text;
        }
        this.length = parseInt(videodata.lengthSeconds) * 1000;
        this.thumbnails = videodata.thumbnail.thumbnails;
        this.default_thumbnail = videodata.thumbnail.thumbnails[videodata.thumbnail.thumbnails.length - 1];
        this.channel = {
            author: Array.isArray(videodata?.shortBylineText?.runs) ? videodata.shortBylineText.runs[0].text : null,
            id: Array.isArray(videodata?.shortBylineText?.runs) ? videodata.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId : null,
            url: Array.isArray(videodata?.shortBylineText?.runs) ? `https://www.youtube.com/channel/${videodata.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId}` : null
          };
        this.playlist_id = videodata.navigationEndpoint.watchEndpoint.playlistId;
        this.playlist_url = `https://www.youtube.com/playlist?list=${this.playlist_id}`;
    }
}

module.exports = PlaylistVideo;
