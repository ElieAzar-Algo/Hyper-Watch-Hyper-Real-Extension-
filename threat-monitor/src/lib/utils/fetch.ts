/**
 * Generic fetch wrapper with timeout, error handling, and type safety
 */

interface FetchOptions extends RequestInit {
  timeout?: number;
}

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Generic fetch wrapper with timeout support
 */
export async function apiFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = 10000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      throw new APIError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        'HTTP_ERROR'
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new APIError('Request timeout', undefined, 'TIMEOUT');
      }
      throw new APIError(error.message, undefined, 'FETCH_ERROR');
    }
    throw new APIError('Unknown error', undefined, 'UNKNOWN');
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * GET request helper
 */
export const getJSON = <T>(url: string, options?: FetchOptions) =>
  apiFetch<T>(url, { ...options, method: 'GET' });

/**
 * POST request helper
 */
export const postJSON = <T>(url: string, data: unknown, options?: FetchOptions) =>
  apiFetch<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: JSON.stringify(data),
  });
