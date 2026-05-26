// Cliente HTTP centralizado. Em dev usa o mesmo host (vercel dev),
// em produção usa caminho relativo /api/* no mesmo domínio.
const BASE_URL = '';

/**
 * Intercepta TODAS as chamadas fetch que vão pra /api/*:
 * - Injeta Authorization header se há token salvo
 * - Captura 401 e força logout
 *
 * Assim os components antigos com `fetch('/api/...')` continuam funcionando
 * sem precisar refatorar cada um.
 */
export function installFetchInterceptor() {
  if (typeof window === 'undefined') return;
  const original = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof Request
        ? input.url
        : input.toString();

    const isApi = url.startsWith('/api/') || url.includes('/api/');
    const isAuthEndpoint =
      url.endsWith('/api/auth/login') || url.endsWith('/api/auth/register');

    if (isApi) {
      const token = getToken();
      const headers = new Headers(init?.headers);
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      init = { ...init, headers };
    }

    const response = await original(input, init);

    if (response.status === 401 && isApi && !isAuthEndpoint) {
      clearToken();
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    return response;
  };
}

const TOKEN_KEY = 'oficina:token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export interface ApiError extends Error {
  status: number;
  data?: unknown;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // 401 = token inválido/expirado — limpa e força login
  if (response.status === 401) {
    clearToken();
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const err: ApiError = Object.assign(
      new Error((data as { message?: string })?.message || `HTTP ${response.status}`),
      { status: response.status, data }
    );
    throw err;
  }

  return data as T;
}
