import { Readable } from "stream";
import { EventEmitter } from "events";

type convert = string | boolean;
type download = string | object;

type streamType = "audio" | "video";
type quality = "high" | "low" | number;
interface downloadOptions{
    type: streamType;
    highWaterMark: number;
    quality: quality;
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
    duration: number;
    views: number;
    views_text: string;
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
		codec: string;
		container: string;
    }];
    html5player: string;
	user_agent: string;
    cookie: string | null;
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
 */
export declare function getInfo(url: string) : Promise<YouTubeData>;

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
 * @param info 
 * @param options 
 */
export declare function stream(info: download, options: downloadOptions) : Promise<Stream>;

export declare function getPlaylist(url: string) : Promise<Playlist>;

declare var cookie: string;
declare var userAgent: string;
