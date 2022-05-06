import { Readable } from "stream";

type convert = string | boolean;
type download = string | object;

type streamType = "audio" | "video";
type quality = "high" | "low" | number;
interface downloadOptions{
    type: streamType;
    highWaterMark: number;
    quality: quality;
}

interface Stream{
    stream: Readable;
    url: string;
    video_url: string;
    quality: number;
    bytes_count: number;
    contentLength: string;
    duration: number;
    type: string;
    req_type: string;
    per_sec_bytes: number;
    info : YouTubeData;
}

interface YouTubeData{
    id: string;
    url: string;
    author: string;
    title: string;
    description: string;
    embedUrl: string;
    familySafe: boolean;
    availableCountries: [string];
    category: string;
    thumbnails: [{url: string, width: number, height: number}];
	default_thumbnail: {url: string, width: number, height: number};
    uploaded: string;
    duration: number;
    views: number;
    viewsText: string;
    channel: {
        author: string;
        id: string;
        url: string;
    };
    formats: [{
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
    }];
    html5player: string;
	userAgent: string;
    cookie: string | null;
}

interface Video{
    id: string;
    url: string;
    title: string;
    author: string;
    channelId: string;
    channelURL: string;
    lengthText: string;
    length: number;
    viewsText: string;
    views: number;
    thumbnail: string;
    userAgent: string;
    cookie: string | null;
}

/**
 * Get information about a song
 * @param url The YouTube url of the song
 */
export declare function getInfo(url: string) : Promise<YouTubeData>;

/**
 * Check whether the YouTube video ID is valid or not
 * @param id The YouTube video ID
 */
export declare function validateID(id: string) : boolean;

/**
 * Check whether the YouTube video URL is valid or not
 * @param url The YouTube video URL
 */
export declare function validateURL(url: string) : boolean;

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
 * Download the YouTube video and create a writeable stream of it
 * @param info 
 * @param options 
 */
export declare function stream(info: download, options: downloadOptions) : Promise<Stream>;

declare var cookie: string;
declare var userAgent: string;
