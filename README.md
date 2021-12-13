# YT-Stream
YT-Stream is a fast YouTube downloader and searcher.

## Installation
```
npm install yt-stream
```

## How to use YT-Stream?
You probably will use the `stream` function the most. The `stream` function has two parameters and only the first one is required. The first parameter is the YouTube URL or the info that you've received in the `getInfo` function. The second parameter are optional options which you can use to make the quality of the stream higher. Here is an example of how to use the `stream` function.
```js
const ytstream = require('yt-stream');

(async () => {
    const stream = await ytstream.stream(`https://www.youtube.com/watch?v=dQw4w9WgXcQ`, {
        quality: 'high',
        type: 'audio',
        highWaterMark: 1048576 * 32
    });
})();
```

This function will return the `Stream` class. The most important properties are:
* `stream`: The readable stream itself which you can use to play the YouTube video
* `url`: The actual url of the YouTube video
* `type`: The type of the stream
* `duration`: The duration of the song in seconds

## Searching video's
YT-Stream has a build-in YouTube video search function. The function has only one parameter which is the search query for the video. The `search` function returns an array of video results.
```js
const ytstream = require('yt-stream');

(async () => {
    const results = await ytstream.search(`Rick Astley Never Gonna Give You Up`);

    console.log(results[0].url); // Output: https://www.youtube.com/watch?v=dQw4w9WgXcQ
})();
```
The video result will return the `Video` class. The most important properties are:
* `url`: The YouTube url of the video
* `author`: The author of the video
* `title`: The title of the video

For more questions or problems, visit the [issue page](https://github.com/Luuk-Dev/yt-stream/issues) or send me a DM on Discord (Luuk#8524)