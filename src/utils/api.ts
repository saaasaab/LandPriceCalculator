export const BASE_URL = () => {
  return window.location.hostname.includes("localhost")
    ? "http://localhost:8080"
    : "https://landpricecalculatorapi.onrender.com";
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const isUnauthorizedError = (error: unknown) =>
  error instanceof ApiError && error.status === 401;

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user?.token) {
        headers.Authorization = `Bearer ${user.token}`;
      }
    }
  } catch {
    // ignore malformed local storage
  }

  return headers;
};

const parseResponseBody = async (response: Response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const request = async <T>(endpoint: string, init: RequestInit): Promise<T> => {
  const response = await fetch(`${BASE_URL()}${endpoint}`, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...(init.headers ?? {}),
    },
  });

  const data = await parseResponseBody(response);
  if (response.ok) {
    return data as T;
  }

  const message = typeof data?.message === 'string' ? data.message : response.statusText;
  const error = new ApiError(message, response.status);
  if (response.status !== 401) {
    console.error('❌ API Request Error:', error);
  }
  throw error;
};

export const postRequest = async <T>(endpoint: string, body: object): Promise<T> => {
  return request<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const getRequest = async <T>(endpoint: string): Promise<T> => {
  return request<T>(endpoint, { method: 'GET' });
};

export const putRequest = async <T>(endpoint: string, body: object): Promise<T> => {
  return request<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
};

export const deleteRequest = async <T>(endpoint: string): Promise<T> => {
  return request<T>(endpoint, { method: 'DELETE' });
};
