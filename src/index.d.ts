export interface UploadResult {
  platform: string;
  success: boolean;
  url: string;
  raw: unknown;
}

export type UploadPhase = "start" | "uploading" | "complete" | "error";

export interface UploadProgress {
  phase: UploadPhase;
  filename: string;
  totalBytes: number;
  bytesTransferred: number;
  percent: number;
  message?: string;
}

export interface UploadContext {
  filePath: string;
  apiKey?: string | null;
  metadata?: Record<string, string>;
  headers?: Record<string, string>;
  onProgress?: ((progress: UploadProgress) => void) | null;
  http: unknown;
}

export interface UploadAdapter {
  upload(context: UploadContext): Promise<UploadResult>;
}

export interface UploadOptions {
  platform?: string;
  apiKey?: string;
  metadata?: Record<string, string>;
  headers?: Record<string, string>;
  timeoutMs?: number;
  onProgress?: (progress: UploadProgress) => void;
}

export interface UploadClientOptions {
  platform?: string;
  apiKey?: string;
  timeoutMs?: number;
}

export declare class UploadClient {
  constructor(options?: UploadClientOptions);
  registerPlatform(name: string, adapter: UploadAdapter): this;
  upload(filePath: string, options?: UploadOptions): Promise<UploadResult>;
}

export interface ShortenResult {
  provider: string;
  success: boolean;
  shortUrl: string;
  raw: unknown;
}

export interface VideoUploadResult {
  provider: string;
  success: boolean;
  videoId: string | null;
  watchUrl: string;
  raw: unknown;
}

export interface ShorturlAdapter {
  shorten(context: unknown): Promise<ShortenResult>;
}

export interface VideoProviderAdapter {
  upload(context: unknown): Promise<VideoUploadResult>;
}

export interface DoodstreamProvider extends VideoProviderAdapter {
  cloneFile(context: unknown): Promise<{ provider: "doodstream"; success: boolean; result: unknown; raw: unknown }>;
  remoteUploadAdd(context: unknown): Promise<{ provider: "doodstream"; success: boolean; filecode: string | null; raw: unknown }>;
  remoteUploadList(context: unknown): Promise<{ provider: "doodstream"; success: boolean; items: unknown[]; raw: unknown }>;
  remoteUploadStatus(context: unknown): Promise<{ provider: "doodstream"; success: boolean; items: unknown[]; raw: unknown }>;
  remoteUploadSlots(context: unknown): Promise<{
    provider: "doodstream";
    success: boolean;
    totalSlots: string | null;
    usedSlots: string | null;
    raw: unknown;
  }>;
  remoteUploadActions(context: unknown): Promise<{ provider: "doodstream"; success: boolean; raw: unknown }>;
}

export interface DownloadJobState {
  job_id: string;
  status: string;
  url?: string | null;
  download?: { percent?: number; label?: string };
  convert?: { percent?: number; label?: string };
  upload?: { percent?: number; label?: string };
  [key: string]: unknown;
}

export interface DownloaderCreateJobResult {
  provider: string;
  jobId: string;
  raw: unknown;
}

export interface DownloaderClientOptions {
  apiKey?: string;
  baseUrl?: string;
  preset?: string;
  timeoutMs?: number;
}

export interface DownloaderJobOptions {
  apiKey?: string;
  uploadDest?: "cdn" | "thirdparty" | "ipfs" | string;
  timeoutMs?: number;
}

export interface DownloaderWaitOptions extends DownloaderJobOptions {
  intervalMs?: number;
  onProgress?: (state: DownloadJobState) => void;
}

export declare class DownloaderClient {
  constructor(options?: DownloaderClientOptions);
  useBaseUrl(baseUrl: string): this;
  usePreset(name: string): this;
  createMp3Job(link: string, options?: DownloaderJobOptions): Promise<DownloaderCreateJobResult>;
  createMp4Job(link: string, options?: DownloaderJobOptions): Promise<DownloaderCreateJobResult>;
  getJob(jobId: string, options?: DownloaderJobOptions): Promise<DownloadJobState>;
  waitForJob(jobId: string, options?: DownloaderWaitOptions): Promise<DownloadJobState>;
  getInfo(url: string, options?: { flat?: boolean; flatPlaylist?: boolean; fields?: "basic" | "full"; cache?: 0 | 1 | number; timeoutMs?: number }): Promise<unknown>;
  searchYouTube(query: string, options?: { limit?: number; timeoutMs?: number }): Promise<unknown>;
  getStreamUrl(url: string): string;
  stream(url: string, options?: { responseType?: string; timeoutMs?: number }): Promise<unknown>;
}

export interface UploadAndShortenResult {
  success: true;
  upload: UploadResult;
  shortlink: ShortenResult;
}

export interface ShortenOptions {
  provider?: string;
  apiKey?: string;
  preset?: string;
  baseUrl?: string;
  alias?: string;
  adsType?: number;
  responseFormat?: "json" | "text";
  timeoutMs?: number;
}

export interface UploadAndShortenOptions {
  uploadPlatform?: string;
  uploadApiKey?: string;
  uploadMetadata?: Record<string, string>;
  uploadHeaders?: Record<string, string>;
  shortenerProvider?: string;
  shortenerApiKey?: string;
  shortenerPreset?: string;
  shortenerBaseUrl?: string;
  alias?: string;
  adsType?: number;
  responseFormat?: "json" | "text";
  timeoutMs?: number;
  onProgress?: (progress: UploadProgress) => void;
}

export interface VideoUploadOptions {
  provider?: string;
  apiKey?: string;
  metadata?: Record<string, string>;
  timeoutMs?: number;
  onProgress?: (progress: UploadProgress) => void;
}

export declare class EarningsClient {
  constructor(options?: {
    timeoutMs?: number;
    upload?: UploadClientOptions;
    uploadClient?: UploadClient;
  });
  registerShortener(name: string, adapter: { shorten(context: unknown): Promise<ShortenResult> }): this;
  registerVideoProvider(name: string, adapter: { upload(context: unknown): Promise<VideoUploadResult> }): this;
  shortenUrl(longUrl: string, options?: ShortenOptions): Promise<ShortenResult>;
  uploadAndShorten(filePath: string, options?: UploadAndShortenOptions): Promise<UploadAndShortenResult>;
  uploadVideo(filePath: string, options?: VideoUploadOptions): Promise<VideoUploadResult>;
}

export declare const platforms: {
  upfiles: UploadAdapter;
  fileio: UploadAdapter;
  catbox: UploadAdapter;
  transfersh: UploadAdapter;
};

export declare const shortenerPresets: Record<string, string>;
export declare const downloaderPresets: Record<string, string>;

export interface LivestreamClientOptions {
  apiKey?: string;
  baseUrl?: string;
  preset?: string;
  timeoutMs?: number;
}

export interface LivestreamResult {
  statusCode?: number;
  status?: string;
  username?: string;
  displayname?: string;
  avatar?: string;
  livestream?: {
    online?: boolean;
    bg?: string | null;
    title?: string | null;
    viewer?: number | null;
    game?: string | null;
    preview?: string | null;
    created_at?: string | null;
  };
  followers?: number;
  [key: string]: unknown;
}

export declare class LivestreamClient {
  constructor(options?: LivestreamClientOptions);
  useBaseUrl(baseUrl: string): this;
  usePreset(name: string): this;
  getKick(username: string, options?: { apiKey?: string; timeoutMs?: number }): Promise<LivestreamResult>;
  getTwitch(username: string, options?: { apiKey?: string; timeoutMs?: number }): Promise<LivestreamResult>;
  getDlive(username: string, options?: { apiKey?: string; timeoutMs?: number }): Promise<LivestreamResult>;
  getTrovo(username: string, options?: { apiKey?: string; timeoutMs?: number }): Promise<LivestreamResult>;
  getByPlatform(platform: string, username: string, options?: { apiKey?: string; timeoutMs?: number }): Promise<LivestreamResult>;
}

export interface GamesClientOptions {
  apiKey?: string;
  baseUrl?: string;
  preset?: string;
  timeoutMs?: number;
}

export declare class GamesClient {
  constructor(options?: GamesClientOptions);
  useBaseUrl(baseUrl: string): this;
  usePreset(name: string): this;
  getClashOfClansClan(clanTag: string, options?: { apiKey?: string; timeoutMs?: number }): Promise<unknown>;
  getClashOfClansPlayer(playerTag: string, options?: { apiKey?: string; timeoutMs?: number }): Promise<unknown>;
  getDivision2Player(username: string, platform?: string, options?: { apiKey?: string; timeoutMs?: number }): Promise<unknown>;
  getFortnitePlayer(username: string, timeWindow?: string, options?: { apiKey?: string; timeoutMs?: number }): Promise<unknown>;
  getFortniteCreatorCode(creatorCode: string, options?: { apiKey?: string; timeoutMs?: number }): Promise<unknown>;
  getFortniteItemShop(options?: { apiKey?: string; timeoutMs?: number }): Promise<unknown>;
  getWynncraftProfile(username: string, options?: { apiKey?: string; timeoutMs?: number }): Promise<unknown>;
  getHypixelProfile(username: string, options?: { apiKey?: string; timeoutMs?: number }): Promise<unknown>;
  getRocketLeaguePlayer(username: string, platform?: string, options?: { apiKey?: string; timeoutMs?: number }): Promise<unknown>;
  getApexLegendsPlayer(username: string, platform?: string, options?: { apiKey?: string; timeoutMs?: number }): Promise<unknown>;
  getBattlefield1Player(username: string, platform?: string, options?: { apiKey?: string; timeoutMs?: number }): Promise<unknown>;
  getBattlefield5Player(username: string, platform?: string, options?: { apiKey?: string; timeoutMs?: number }): Promise<unknown>;
  getBattlefield2042Player(username: string, platform?: string, options?: { apiKey?: string; timeoutMs?: number }): Promise<unknown>;
  getBattlefield6Player(username: string, platform?: string, options?: { apiKey?: string; timeoutMs?: number }): Promise<unknown>;
}

export declare const livestreamPresets: Record<string, string>;
export declare const gamesPresets: Record<string, string>;

export declare const upload: {
  Client: typeof UploadClient;
  providers: typeof platforms;
};

export declare const shorturl: {
  providers: {
    "adlinkfly-compatible": ShorturlAdapter;
  };
  presets: typeof shortenerPresets;
};

export declare const video: {
  providers: {
    doodstream: DoodstreamProvider;
  };
};

export declare const downloader: {
  Client: typeof DownloaderClient;
  providers: {
    compatible: unknown;
  };
  presets: typeof downloaderPresets;
};

export declare const livestream: {
  Client: typeof LivestreamClient;
  providers: {
    nekosune: unknown;
  };
  presets: typeof livestreamPresets;
};

export declare const games: {
  Client: typeof GamesClient;
  providers: {
    nekosune: unknown;
  };
  presets: typeof gamesPresets;
};

export declare const earnings: {
  Client: typeof EarningsClient;
};
