class YouTubeData{
    constructor(data, html5player, headers){
        var videoDetails = data.videoDetails;
        var microformat = data.microformat.playerMicroformatRenderer;
        this.id = videoDetails.videoId;
        this.url = `https://www.youtube.com/watch?v=${videoDetails.videoId}`;
        this.author = videoDetails.author;
        this.title = videoDetails.title;
        this.description = videoDetails.shortDescription;
        this.embedUrl = microformat.embed.iframeUrl;
        this.familySafe = microformat.isFamilySafe;
        this.availableCountries = microformat.availableCountries;
        this.category = microformat.category;
        this.thumbnails = videoDetails.thumbnail.thumbnails;
        this.default_thumbnail = videoDetails.thumbnail.thumbnails[videoDetails.thumbnail.thumbnails.length - 1];
        this.uploaded = microformat.publishDate;
        this.duration = Number(videoDetails.lengthSeconds);
        this.views = Number(videoDetails.viewCount);

        var viewsText = String(videoDetails.viewCount);
        viewsText = viewsText.split('').reverse();
        viewsText = viewsText.reduce((arr, number, index, defaultArray) => {
            if((index + 1) % 3 === 0 && index !== 0 && (index + 1) !== defaultArray.length){
                arr.push(number);
                arr.push('.');
            } else {
                arr.push(number);
            }
            return arr;
        }, []);
        viewsText = viewsText.reverse().join('');

        this.viewsText = viewsText;
        this.channel = {
          author: videoDetails.author,
          id: videoDetails.channelId,
          url: `https://www.youtube.com/channel/${videoDetails.channelId}`
        };
        this.formats = [];
        this.html5player = html5player;

        this.formats.push(...(data.streamingData.formats || []));
        this.formats.push(...(data.streamingData.adaptiveFormats || []));
		this.userAgent = headers['user-agent'];
        if(typeof headers['cookie'] === 'string'){
            this.cookie = headers['cookie'];
        } else {
            this.cookie = null;
        }
    }
}

module.exports = YouTubeData;
