import { Readable } from "stream";
import { EventEmitter } from "events";
import { Cookie as ToughCookie } from "tough-cookie";
import { HttpsCookieAgent, HttpCookieAgent } from "http-cookie-agent/http";
import { Agent as HttpsAgent } from "https";
import { Agent as HttpAgent } from "http";

type HttpsCookieAgentOptions = ConstructorParameters<typeof HttpsCookieAgent>[0];
type HttpCookieAgentOptions = ConstructorParameters<typeof HttpCookieAgent>[0];

type convert = string | boolean;
type download = string | object;

type CookieType = [Cookie | {
    key?: string;
    name?: string;
    value?: string;
    domain: string;
    httpOnly?: boolean;
    hostOnly?: boolean;
    secure?: boolean;
    path?: string;
    expires?: string;
    expirationDate?: string;
    sameSite?: string;
}]

type streamType = "audio" | "video";
type quality = "high" | "low" | number;

interface downloadOptions{
    type: streamType;
    highWaterMark: number;
    quality: quality;
    download: boolean;
}

interface Stream extends EventEmitter{
    stream: Readable;
    url: string;
	container: string;
    video_url: string;
    quality: number;
    bytes_count: number;
    content_length: string;
    duration: number;
    type: string;
    req_type: string;
    per_sec_bytes: number;
    mimeType: string;
    format: {
        itag: number;
        mimeType: string;
        bitrate: number;
        width: number;
        height: number;
        lastModified: string;
        contentLength: string;
        quality: string;
        fps: number;
        qualityLabel: string;
        projectionType: string;
        avarageBitrate: number;
        audioQuality: string;
        approxDurationMs: string;
        audioSampleRate: string;
        audioChannels: number;
        signatureCipher: string;
		codec: string;
		container: string;
    };
    info: YouTubeData;
}

interface YouTubeData{
    id: string;
    url: string;
    author: string;
    title: string;
    description: string;
    embed_url: string;
    family_safe: boolean;
    available_countries: [string];
    category: string;
    thumbnails: [{url: string, width: number, height: number}];
	default_thumbnail: {url: string, width: number, height: number};
    uploaded: string;
    uploadedTimestamp: number;
    duration: number;
    views: number;
    views_text: string;
    channel: {
        author: string;
        id: string;
        url: string;
    };
    formats: [{
        itag?: number;
        mimeType?: string;
        bitrate?: number;
        width?: number;
        height?: number;
        lastModified?: string;
        contentLength?: string;
        quality?: string;
        fps?: number;
        qualityLabel?: string;
        projectionType?: string;
        avarageBitrate?: number;
        audioQuality?: string;
        approxDurationMs?: string;
        audioSampleRate?: string;
        audioChannels?: number;
        signatureCipher?: string;
		codec?: string;
		container?: string;
    }];
    html5player: string;
	user_agent: string;
    cookie: string;
}

interface Video{
    id: string;
    url: string;
    title: string;
    author: string;
    channel_id: string;
    channel_url: string;
    length_text: string;
    length: number;
    views_text: string;
    views: number;
    thumbnail: string;
    user_agent: string;
    cookie: string | null;
}

interface PlaylistVideo{
    title: string;
    video_url: string;
    video_id: string;
    position: number;
    length_text: string;
    length: number;
    thumbnails: [{url: string, height: number, width: number}];
    default_thumbnail: {url: string, height: number, width: number};
    playlist_id: string;
    playlist_url: string;
}

interface Playlist{
    title: string;
    description: string;
    author: string;
    author_images: [{url: string, height: number, width: number}];
    default_author_images: {url: string, height: number, width: number};
    author_channel: string;
    url: string;
    videos: [PlaylistVideo],
    videos_amount: number;
    cookie: string | null;
    user_agent: string;
}

/**
 * Get information about a song
 * @param url The YouTube url of the song
 * @param boolean A boolean which defines whether the package should force send a request to YouTube to receive the data or whether it can use cached data as well
 */
export declare function getInfo(url: string, force?: boolean) : Promise<YouTubeData>;

/**
 * Check whether the YouTube video ID is valid or not
 * @param id The YouTube video ID
 */
export declare function validateID(id: string) : boolean;

/**
 * Check whether the YouTube URL is valid or not
 * @param url The YouTube URL
 */
export declare function validateURL(url: string) : boolean;

/**
 * Check whether the YouTube video URL is valid or not
 * @param url The YouTube video URL
 */
export declare function validateVideoURL(url: string) : boolean;

/**
 * Check whether the YouTube playlist URL is valid or not
 * @param url The YouTube playlist URL
 */
export declare function validatePlaylistURL(url: string) : boolean;

/**
 * Check whether the YouTube playlist ID is valid or not
 * @param id The YouTube playlist ID
 */
export declare function validatePlaylistID(id: string) : boolean;

/**
 * Get the YouTube video ID from the video URL
 * @param url The YouTube video URL
 */
export declare function getID(url: string) : convert;

/**
 * Get the YouTube video URL from the video ID
 * @param id The YouTube video ID
 */
export declare function getURL(id: string) : convert;

/**
 * Search for YouTube video's
 * @param query The search query to search a video
 */
export declare function search(query: string) : Promise<[Video]>;

/**
 * Download the YouTube video and create a readable stream of it
 * @param info Either the YouTube url of the video or the received information from the getInfo function
 * @param options An object that defines options which the stream function should take into account
 */
export declare function stream(info: download, options: downloadOptions) : Promise<Stream>;

/**
 * Gets the information of a playlist including the video's inside the playlist
 * @param url The url of the playlist
 */
export declare function getPlaylist(url: string) : Promise<Playlist>;

/**
 * Adds custom headers to each request made to YouTube
 * @param headers The headers you'd like to add in each request
 */
export declare function setGlobalHeaders(headers: object) : void;

/**
 * Sets a custom agent which is being used to send the requests with
 * @param agent An instance of the YTStreamAgent class which represents the HTTP agent
 */
export declare function setGlobalAgent(agent: YTStreamAgent | {https: HttpsAgent | HttpsCookieAgent | any, http: HttpAgent | HttpCookieAgent | any} | any) : void;

declare var cookie: string;
declare var userAgent: string;

export declare class Cookie extends ToughCookie{}

export declare class YTStreamAgent{
    constructor(cookies: CookieType, options: HttpsCookieAgentOptions | HttpCookieAgentOptions);

    /**
     * Adds cookies to the cookies headers which is being send in each request to YouTube
     * @param cookies An array or an instance of the Cookie class which represents the cookie you want to add
     */
    addCookies(cookies: [] | ToughCookie) : void;

    /**
     * Removes the cookies which the agent has saved
     * @param force True to remove manually set cookies as well, false to only remove cached cookies (default false)
     */
    removeCookies(force?: boolean) : void;
}
