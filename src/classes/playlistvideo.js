class PlaylistVideo{
    constructor(data, videodata){
        this.title = videodata.title.runs[0].text;
        this.video_id = videodata.videoId;
        this.video_url = `https://www.youtube.com/watch?v=${videodata.videoId}`;
        this.position = parseInt(videodata.index.simpleText);
        this.length_text = videodata.lengthText.simpleText;
        this.length = parseInt(videodata.lengthSeconds) * 1000;
        this.thumbnails = videodata.thumbnail.thumbnails;
        this.default_thumbnail = videodata.thumbnail.thumbnails[videodata.thumbnail.thumbnails.length - 1];
        this.channel = {
            author: videodata.shortBylineText.runs[0].text,
            id: videodata.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId,
            url: `https://www.youtube.com/channel/${videodata.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId}`
          };
        this.playlist_id = videodata.navigationEndpoint.watchEndpoint.playlistId;
        this.playlist_url = data.microformat.microformatDataRenderer.urlCanonical;
    }
}

module.exports = PlaylistVideo;
