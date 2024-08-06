class YouTubeData{
    constructor(data, cver, html5player, headers, clientInfo){
        let videoDetails = data.videoDetails;
        this.id = videoDetails.videoId;
        this.url = `https://www.youtube.com/watch?v=${videoDetails.videoId}`;
        this.author = videoDetails.author;
        this.title = videoDetails.title;
        this.description = videoDetails.shortDescription;
        this.embed_url = `https://www.youtube.com/embed/${videoDetails.videoId}`;
        this.thumbnails = videoDetails.thumbnail.thumbnails;
        this.default_thumbnail = videoDetails.thumbnail.thumbnails[videoDetails.thumbnail.thumbnails.length - 1];
        this.duration = parseInt(videoDetails.lengthSeconds) * 1000;
        this.views = parseInt(videoDetails.viewCount);

        if(typeof data.microformat === 'object'){
            let microformat = data.microformat.playerMicroformatRenderer;
            const uploadedTime = new Date(microformat.publishDate);
            this.uploaded = `${uploadedTime.getDate()}-${uploadedTime.getMonth() + 1}-${uploadedTime.getFullYear()}`;
            this.uploadedTimestamp = uploadedTime.getTime();
            this.family_safe = microformat.isFamilySafe;
            this.available_countries = microformat.availableCountries;
            this.category = microformat.category;
        } else {
            this.uploaded = null;
            this.uploadedTimestamp = 0;
            this.family_safe = null;
            this.available_countries = [];
            this.category = null;
        }

        let viewsText = videoDetails.viewCount.toString();
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

        this.views_text = viewsText;
        this.channel = {
          author: videoDetails.author,
          id: videoDetails.channelId,
          url: `https://www.youtube.com/channel/${videoDetails.channelId}`
        };
        this.formats = [];
        this.html5player = html5player;
        this.clientInfo = clientInfo;

        this.formats.push(...(data.streamingData.formats || []));
        this.formats.push(...(data.streamingData.adaptiveFormats || []));
		this.user_agent = headers['user-agent'];
        if(typeof headers['cookie'] === 'string'){
            this.cookie = headers['cookie'];
        } else {
            this.cookie = null;
        }
        this.cver = cver;
        this.streamingURL = data.streamingData.serverAbrStreamingUrl;
    }
}

module.exports = YouTubeData;
