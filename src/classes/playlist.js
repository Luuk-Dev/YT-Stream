const PlaylistVideo = require('./playlistvideo.js');

class Playlist{
    constructor(data, headers){
        this.title = data.microformat.microformatDataRenderer.title;
        this.description = data.microformat.microformatDataRenderer.description;

        var getAuthorArrayItem = data.sidebar.playlistSidebarRenderer.items.filter(s => typeof s.playlistSidebarSecondaryInfoRenderer !== 'undefined');
        var authorInfo = getAuthorArrayItem[0].playlistSidebarSecondaryInfoRenderer.videoOwner.videoOwnerRenderer;
        this.author = (authorInfo.title.runs[0].text ?? '');
        this.author_images = authorInfo.thumbnail.thumbnails;
        this.default_author_image = authorInfo.thumbnail.thumbnails[authorInfo.thumbnail.thumbnails.length - 1];
        this.author_channel = `https://www.youtube.com${authorInfo.navigationEndpoint.commandMetadata.webCommandMetadata.url}`;

        this.url = data.microformat.microformatDataRenderer.urlCanonical;

        var videoInfo = data.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents;
        this.videos = [];
        for(var i = 0; i < videoInfo.length; i++){
            if(typeof videoInfo[i].playlistVideoRenderer === 'undefined') continue;
            this.videos.push(new PlaylistVideo(data, videoInfo[i].playlistVideoRenderer));
        }
        this.video_amount = videoInfo.length;
        
        if(typeof headers['cookie'] === 'string'){
            this.cookie = headers['cookie'];
        } else {
            this.cookie = null;
        }
        this.user_agent = headers['user-agent'];
    }
}

module.exports = Playlist;
