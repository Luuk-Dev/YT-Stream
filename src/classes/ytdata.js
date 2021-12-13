class YouTubeData{
    constructor(data, html5player){
        var videoDetails = data.videoDetails;
        var microformat = data.microformat.playerMicroformatRenderer;
        this.id = videoDetails.videoId,
        this.url = `https://www.youtube.com/watch?v=${videoDetails.videoId}`,
        this.author = videoDetails.author,
        this.title = videoDetails.title,
        this.description = {
            short: videoDetails.shortDescription,
            full: microformat.description.simpleText
        }
        this.familySafe = microformat.isFamilySafe,
        this.availableCountries = microformat.availableCountries,
        this.category = microformat.category,
        this.thumbnails = videoDetails.thumbnail.thumbnails,
        this.default_thumbnail = videoDetails.thumbnail.thumbnails[videoDetails.thumbnail.thumbnails.length - 1],
        this.uploaded = microformat.publishDate,
        this.duration = Number(videoDetails.lengthSeconds),
        this.views = Number(videoDetails.viewCount),
        this.channel = {
          author: videoDetails.author,
          id: videoDetails.channelId,
          url: `https://www.youtube.com/channel/${videoDetails.channelId}`
        }
        this.formats = [],
        this.html5player = html5player;

        this.formats.push(...(data.streamingData.formats || []));
        this.formats.push(...(data.streamingData.adaptiveFormats || []));
    }
}

module.exports = YouTubeData;