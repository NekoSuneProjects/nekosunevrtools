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

export declare const earnings: {
  Client: typeof EarningsClient;
};
