## Installation
```
npm install yt-stream
```

## What is YT-Stream?
YT-Stream is a package which can download and search YouTube video's. YT-Stream is based on the codes of [ytdl-core](https://npmjs.com/ytdl-core) and [play-dl](https://npmjs.com/play-dl) and further extended to create a package which met to my needs.

## API or scrape methods
YT-Stream allows both API (youtubei) and scrape methods to be used. By default the scrape method will always be used. To change this, an api key is required, which can be obtained from the [Google Developer Console](https://console.cloud.google.com/apis/dashboard) (YouTube Data API v3). This api key can be set by using the `setApiKey` function. This function requires one argument, which is the api key. Setting the api key does not automatically make the package use the api instead of the scrape method. This must be set by using the `setPreference` function. This function requires one argument, which is the method, and has an optional argument, which is the client which the package should use when making an api request. YT-Stream allows you to make an api request with a IOS, Android or web client, which can be manually set inside the second argument of the `setPreference` function. By default, a random client will be choosen. The client which the package uses does have impact on the data it can receive. If you have application restrictions enabled for your api key, you need to set a client manually.
```js
const ytstream = require('yt-stream');

ytstream.setApiKey(`My Secret api key`); // Only sets the api key
ytstream.setPreference('api', 'WEB'); // Tells the package to use the api and use a web client for requests
...
ytstream.setPreference('scrape'); // Tells the package to use the scrape methods instead of the api, even if an api key has been provided
```

## Downloading
You can download a video by using the `stream` function. The `stream` function has two parameters; the `info` or `url` parameter and the `options` parameter. The `options` parameter is not required. The first parameter must include the video url or the info that has been received from the `info` function. The `stream` function will return a `Promise`. The `Promise` will be fullfilled if the video was successfully downloaded. If there was an error, the `Promise` will be rejected with the error. Once the `Promise` gets fullfilled it will return the `Stream` class. The most important properties in the `Stream` class are:
* stream: The Readable stream
* url: The url to download the video or song
* video_url: The YouTube video url

Optional options are:
* type: If your download preference is video or audio. If one of the types does not exists, it will download the other download type.
* quality: The quality of the video (high or low)
* highWaterMark: The highWaterMark for the Readable stream
* download: A boolean which defines whether to automatically download and push the chunks in the Readable stream (`stream` property of the `Stream` class) the video or not (default `true`)

> Warning: By setting the `download` option to `false`, it is not guaranteed that the provided url contains the requested video/audio. Make sure to check for any possible location headers when making a request to this url.
```js
const ytstream = require('yt-stream');
const fs = require('fs');

(async () => {
    const stream = await ytstream.stream(`https://www.youtube.com/watch?v=dQw4w9WgXcQ`, {
        quality: 'high',
        type: 'audio',
        highWaterMark: 1048576 * 32,
        download: true
    });
    stream.stream.pipe(fs.createWriteStream('some_song.mp3'));
    console.log(stream.video_url);
    console.log(stream.url);
})();
```

## Searching video's
YT-Stream also has a search function. You can easily search a song by using the `search` function. The `search` function has one parameter which is the `query` to search. The `query` parameter is **required**. The `search` function will return a `Promise` which will be fullfilled if there were no errors while trying to search. The `Promise` will return an `Array` with the amount of video's that were found. The items in the `Array` are the video's with the `Video` class. The most important properties of the `Video` class are:
* url: The video url
* id: The id of the video
* author: The author of the video
* title: The title of the video
```js
const ytstream = require('yt-stream');

(async () => {
    const results = await ytstream.search(`Rick Astley Never Gonna Give You Up`);

    console.log(results[0].url); // Output: https://www.youtube.com/watch?v=dQw4w9WgXcQ
    console.log(results[0].id); // Output: dQw4w9WgXcQ
    console.log(results[0].author); // Output: Rick Astley
    console.log(results[0].title); // Output: Rick Astley - Never Gonna Give You Up (Official Music Video)
})();
```

## Get video info
You can also get information about a specific video. You can use the `info` function to do this. The `info` function has one parameter which is the `url` and is **required**. The `info` function will return a `Promise` which will be fullfilled when the info successfully was received. The `Promise` returns the `YouTubeData` class. The most important properties of the `YouTubeData` class are:
* url: The video url
* id: The id of the video
* author: The author of the video
* title: The title of the video
* uploaded: When the video was uploaded
* description: An object of descriptions (short or full)
* duration: The duration of the video in seconds

```js
const ytstream = require('yt-stream');

(async () => {
    const info = await ytstream.getInfo(`https://www.youtube.com/watch?v=dQw4w9WgXcQ`);

    console.log(info.url); // Output: https://www.youtube.com/watch?v=dQw4w9WgXcQ
    console.log(info.id); // Output: dQw4w9WgXcQ
    console.log(info.author); // Output: Rick Astley
    console.log(info.title); // Output: Rick Astley - Never Gonna Give You Up (Official Music Video)
    console.log(info.uploaded); // Output: 2009-10-24
    console.log(info.description); // Output: 'The official video for “Never Gonna Give You Up”...'
    console.log(info.duration); // Output: 212000
})();
```

## Get playlist info
You can get information about a specific playlist. You can use the `getPlaylist` function for this. The `getPlaylist` function requires one parameter which is the `url`. The `getPlaylist` function returns `Promise` which will be fullfilled when the playlist information has successfully been received. The `Promise` returns the `Playlist` class. The most important properties of the `Playlist` class are:
* videos: An `Array` of all the video's (the `PlaylistVideo` class is used for the video's)
* title: The title of the playlist
* author: The author of the playlist

```js
const ytstream = require('yt-stream');

(async () => {
    const info = await ytstream.getPlaylist(`https://www.youtube.com/playlist?list=PLk-dXGDrKWvZMVKjPtGaIqqI5eg3U7KSEA`);

    console.log(info.videos); // Output: [Array]
    console.log(info.title); // Output: Some playlist title
    console.log(info.author); // Output: Some playlist author
})();
```

## Setting a user agent
You can easily set a user agent by changing the `userAgent` property to a user agent.
```js
const ytstream = require('yt-stream');

ytstream.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/94.0";
```

## Setting custom headers
It is possible to add custom headers which will be added to each request made. This is possible by using the `setGlobalHeaders` function.
```js
const ytstream = require('yt-stream');

ytstream.setGlobalHeaders({
    'Accept-Language': 'en-US,en;q=0.5'
});
```

## Agent and cookies
By default, the YT-Stream package automatically handles all cookies. This is being handled by a custom agent. The settings of this agent and the cookies can be configured. This can be done by creating a new instance of the `YTStreamAgent` and changing the settings of this. The first argument of the constructor should eiither contain an array of cookies you'd like to add inside the request or a string which represents the file containing the cookies which will be used and synced. If you don't want to add any cookies, you can use an empty array here. The second argument of the constructor should contain an object with the custom settings for the agent. This custom agent can then be set by using the `setGlobalAgent` function.
```js
const ytstream = require('yt-stream');

const agent = new ytstream.YTStreamAgent([{
    key: 'SOCS',
    value: 'CAI',
    domain: 'youtube.com',
    expires: 'Infinity',
    sameSite: 'lax',
    httpOnly: false,
    hostOnly: false,
    secure: true,
    path: '/'
}], {
    localAddress: '127.0.0.1',
    keepAlive: true,
    keepAliveMsecs: 5e3
});

ytstream.setGlobalAgent(agent);
```

The cookies can afterwards be removed by using the `removeCookies` function of the `YTStreamAgent` class. The `removeCookies` function provides one optional argument which should be a boolean. The boolean determines whether all cookies shall be removed (forced) or only the cookies which were cached from previous requests.
```js
const agent = new ytstream.YTStreamAgent([{
    key: 'SOCS',
    value: 'CAI',
    domain: 'youtube.com',
    expires: 'Infinity',
    sameSite: 'lax',
    httpOnly: false,
    hostOnly: false,
    secure: true,
    path: '/'
}], {
    localAddress: '127.0.0.1',
    keepAlive: true,
    keepAliveMsecs: 5e3
});

agent.removeCookies(false) // Only removes cached cookies
agent.removeCookies(true) // Also removes manually set cookies inside the constructor
```

You can also sync the cookies with a file. The cookies inside this file will be imported and if YouTube sets new cookies or updates existing ones, these will be changed inside this file as well. You can use the `syncFile` function to synchronize a file containing the cookies. This file **must** be a json file and should contain an array with the cookies inside of it. The `syncFile` function requires one argument, which should be the path to the file. The path should either be absolute or relative from the root folder of the process. Otherwise the agent won't be able to find the file.

```js
const path = require('path');

const agent = new ytstream.YTStreamAgent([], {
    localAddress: '127.0.0.1',
    keepAlive: true,
    keepAliveMsecs: 5e3
});

agent.syncFile(path.join(__dirname, `./cookies.json`)) // This is an absolute path which will always work
agent.syncFile(`./cookies.json`) // This is a relative path which will only work if the cookies.json file is inside the root folder of the process
```

## Validate YouTube url
You can validate a YouTube url by using the `validateURL` function. The function requires one parameter which is the string to check whether it is a valid YouTube url or not.
> Important: This also validates playlists, to only validate video's use the `validateVideoURL` function.
```js
const ytstream = require('yt-stream');

console.log(ytstream.validateURL('SomeString')) // Output: false
console.log(ytstream.validateURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')); // Output: true
```

## Validate YouTube video url
You can validate a YouTube video url by using the `validateVideoURL` function. The function requires one parameter which is the string to check whether it is a valid YouTube video url or not.
```js
const ytstream = require('yt-stream');

console.log(ytstream.validateVideoURL('SomeString')) // Output: false
console.log(ytstream.validateVideoURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')); // Output: true
```

## Validate YouTube video ID
You can validate a YouTube video ID by using the `validateID` function. The function requires one parameter which is the string to check whether it is a valid YouTube video ID or not.
```js
const ytstream = require('yt-stream');

console.log(ytstream.validateID('SomeString')) // Output: false
console.log(ytstream.validateID('dQw4w9WgXcQ')); // Output: true
```

## Validate YouTube playlist url
You can validate a YouTube playlist url by using the `validatePlaylistURL` function. The function requires one parameter which is the string to check whether it is a valid YouTube playlist url or not.
```js
const ytstream = require('yt-stream');

console.log(ytstream.validatePlaylistURL('SomeString')) // Output: false
console.log(ytstream.validatePlaylistURL('https://www.youtube.com/playlist?list=PLk-dXGDrKWvZMVKjPtGaIqqI5eg3U7KSEA')); // Output: true
```

## Validate YouTube playlist ID
You can validate a YouTube playlist ID by using the `validatePlaylistID` function. The function requires one parameter which is the string to check whether it is a valid YouTube playlist ID or not.
```js
const ytstream = require('yt-stream');

console.log(ytstream.validatePlaylistID('SomeString')) // Output: false
console.log(ytstream.validatePlaylistID('PLk-dXGDrKWvZMVKjPtGaIqqI5eg3U7KSEA')); // Output: true
```

## Get YouTube ID
You can easily convert a YouTube url to a YouTube ID by using the `getID` function. The function requires one parameter which is the string to get the YouTube ID from. If the string is an invalid YouTube url, the function will return `undefined`.
```js
const ytstream = require('yt-stream');

console.log(ytstream.getID('https://www.youtube.com/watch?v=dQw4w9WgXcQ')); // Output: dQw4w9WgXcQ
```

## Get video url
You can easily convert a YouTube video ID to a YouTube video url by using the `getURL` function. The function requires one parameter which is the string to get the YouTube video url from. If the string is an invalid YouTube video ID, the function will return `undefined`.
```js
const ytstream = require('yt-stream');

console.log(ytstream.getURL('dQw4w9WgXcQ')); // Output: https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

For more questions or problems, visit the [issue page](https://github.com/Luuk-Dev/yt-stream/issues) or send me a DM on Discord (Luuk#8524)
