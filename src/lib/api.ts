const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error('Unable to connect to server. Start backend with: npm run backend:dev');
  }

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';
    let message = '';

    if (contentType.includes('application/json')) {
      const payload = await response.json().catch(() => ({}));
      message = payload?.message ?? '';
    } else {
      message = (await response.text().catch(() => '')).trim();
    }

    // Vite proxy typically returns 502/503/504 when backend is down.
    if ([502, 503, 504].includes(response.status)) {
      throw new Error('Backend is not running. Start it with: npm run backend:dev');
    }

    if (!message || message.toLowerCase() === 'request failed') {
      throw new Error(`Request failed (${response.status}). Check backend server and environment config.`);
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export { API_BASE_URL };
