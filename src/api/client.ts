import { API_CONFIG } from './config';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

class ApiClient {
  private pendingRequests = new Map<string, Promise<any>>();
  private requestCounts = new Map<string, { count: number; resetTime: number }>();

  private async checkRateLimit(endpoint: string): Promise<void> {
    const now = Date.now();
    const key = endpoint.split('?')[0];
    const current = this.requestCounts.get(key) || { count: 0, resetTime: now + API_CONFIG.RATE_LIMIT.WINDOW_MS };

    if (now > current.resetTime) {
      current.count = 0;
      current.resetTime = now + API_CONFIG.RATE_LIMIT.WINDOW_MS;
    }

    if (current.count >= API_CONFIG.RATE_LIMIT.MAX_REQUESTS) {
      const waitTime = current.resetTime - now;
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    current.count++;
    this.requestCounts.set(key, current);
  }

  private async fetchWithRetry(url: string, options: RequestOptions, attempt = 1): Promise<Response> {
    const { timeout = 30000, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok && attempt < API_CONFIG.RETRY.MAX_ATTEMPTS) {
        const delay = API_CONFIG.RETRY.BASE_DELAY * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, options, attempt + 1);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (attempt < API_CONFIG.RETRY.MAX_ATTEMPTS && !(error instanceof Error && error.name === 'AbortError')) {
        const delay = API_CONFIG.RETRY.BASE_DELAY * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, options, attempt + 1);
      }

      throw error;
    }
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    
    const url = new URL(endpoint, endpoint.startsWith('http') ? undefined : API_CONFIG.WATCHMODE_BASE_URL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    if (endpoint.includes('watchmode.com')) {
      url.searchParams.append('apiKey', API_CONFIG.WATCHMODE_API_KEY);
    }

    const cacheKey = url.toString();
    
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    const requestPromise = (async () => {
      try {
        await this.checkRateLimit(endpoint);
        const response = await this.fetchWithRetry(url.toString(), fetchOptions);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data as T;
      } finally {
        this.pendingRequests.delete(cacheKey);
      }
    })();

    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }
}

export const apiClient = new ApiClient();