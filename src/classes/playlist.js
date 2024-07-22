const PlaylistVideo = require('./playlistvideo.js');

class Playlist{
    constructor(data, headers, listId){
        if(typeof data.microformat === 'object'){
            this.title = data.microformat.microformatDataRenderer.title;
            this.description = data.microformat.microformatDataRenderer.description;
        } else if(typeof data.header === 'object') {
            this.title = Array.isArray(data.header?.playlistHeaderRenderer?.title?.runs) ? data.header.playlistHeaderRenderer.title.runs[0].text : '';
            this.description = Array.isArray(data.header?.playlistHeaderRenderer?.descriptionText?.runs) ? data.header.playlistHeaderRenderer.descriptionText.runs[0].text : '';
        }

        if(typeof data?.sidebar === 'object'){
            let getAuthorArrayItem = data.sidebar.playlistSidebarRenderer.items.filter(s => typeof s.playlistSidebarSecondaryInfoRenderer !== 'undefined');
            if(!!getAuthorArrayItem.length){
                let authorInfo = getAuthorArrayItem[0]?.playlistSidebarSecondaryInfoRenderer?.videoOwner?.videoOwnerRenderer;
                this.author = (authorInfo?.title?.runs[0]?.text ?? '');
                this.author_images = authorInfo?.thumbnail?.thumbnails;
                this.default_author_image = authorInfo?.thumbnail?.thumbnails[authorInfo.thumbnail?.thumbnails?.length - 1];
                this.author_channel = `https://www.youtube.com${authorInfo?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url}`;
            } else {
                this.author = "YouTube";
                this.author_images = [];
                this.default_author_image = undefined;
                this.author_channel = `https://www.youtube.com/@YouTube`;
            }
        } else if(typeof data.header === 'object'){
            this.author = Array.isArray(data.header?.playlistHeaderRenderer?.ownerText?.runs) ? data.header.playlistHeaderRenderer.ownerText.runs[0].text : '';
            this.author_images = [];
            this.default_author_image = undefined;
            this.author_channel = `https://www.youtube.com/${data.header?.playlistHeaderRenderer?.ownerEndpoint?.browseEndpoint?.browseId}`;
        } else {
            this.author = "YouTube";
            this.author_images = [];
            this.default_author_image = undefined;
            this.author_channel = `https://www.youtube.com/@YouTube`;
        }

        this.url = `https://www.youtube.com/playlist?list=${listId}`;

        this.videos = [];
        let contentTab = data?.contents?.twoColumnBrowseResultsRenderer ?? data?.contents?.singleColumnBrowseResultsRenderer;
        let videoInfo = [];
        if(contentTab){
            if(Array.isArray(contentTab?.tabs)){
                for(const tab of contentTab.tabs){
                    if(Array.isArray(tab?.tabRenderer?.content?.sectionListRenderer?.contents)){
                        for(const content of tab.tabRenderer.content.sectionListRenderer.contents){
                            if(Array.isArray(content?.playlistVideoListRenderer?.contents)){
                                for(const videoContent of content.playlistVideoListRenderer.contents){
                                    if(typeof videoContent?.playlistVideoRenderer === 'object') videoInfo.push(videoContent);
                                }
                            } else if(Array.isArray(content?.itemSectionRenderer?.contents)){
                                for(const itemSectionRender of content.itemSectionRenderer.contents){
                                    if(Array.isArray(itemSectionRender?.playlistVideoListRenderer?.contents)){
                                        for(const videoContent of itemSectionRender.playlistVideoListRenderer.contents){
                                            if(typeof videoContent?.playlistVideoRenderer === 'object') videoInfo.push(videoContent);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        for(let i = 0; i < videoInfo.length; i++){
            if(typeof videoInfo[i]?.playlistVideoRenderer === 'undefined') continue;
            this.videos.push(new PlaylistVideo(data, videoInfo[i].playlistVideoRenderer));
        }
        this.video_amount = this.videos.length;
        
        if(typeof headers['cookie'] === 'string'){
            this.cookie = headers['cookie'];
        } else {
            this.cookie = null;
        }
        this.user_agent = headers['user-agent'];
    }
}

module.exports = Playlist;
