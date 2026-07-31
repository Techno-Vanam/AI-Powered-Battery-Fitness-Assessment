import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

const BASE_URL = 'https://api.yourserver.com/v1'; // replace with real endpoint
const TIMEOUT_MS = 15_000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1_000;

// Token store — set this after auth is implemented in a future phase
let _bearerToken: string | null = null;

export function setApiToken(token: string | null): void {
  _bearerToken = token;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (_bearerToken) {
    config.headers.Authorization = `Bearer ${_bearerToken}`;
  }
  return config;
});

instance.interceptors.response.use(
  (res: AxiosResponse) => res,
  async error => {
    const config = error.config as AxiosRequestConfig & { _retryCount?: number };
    config._retryCount = config._retryCount ?? 0;

    const isNetworkError = !error.response;
    const isServerError = error.response?.status >= 500;
    const shouldRetry = (isNetworkError || isServerError) && config._retryCount < MAX_RETRIES;

    if (shouldRetry) {
      config._retryCount += 1;
      await sleep(RETRY_DELAY_MS * config._retryCount);
      return instance(config);
    }

    return Promise.reject(normaliseError(error));
  },
);

function normaliseError(error: any): Error {
  if (error.response) {
    const msg = error.response.data?.message ?? error.response.statusText ?? 'Server error';
    return new Error(`[${error.response.status}] ${msg}`);
  }
  if (error.request) {
    return new Error('Network error: no response received');
  }
  return new Error(error.message ?? 'Unknown API error');
}

export const ApiClient = instance;
