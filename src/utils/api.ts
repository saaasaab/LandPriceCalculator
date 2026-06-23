export const BASE_URL = () => {

  return window.location.hostname.includes("localhost")
    ? "http://localhost:8080"
    : "https://landpricecalculatorapi.onrender.com";
}

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

export const postRequest = async <T>(endpoint: string, body: object): Promise<T> => {
  try {
    const response = await fetch(`${BASE_URL()}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });

    const data: T = await response.json();

    console.log(`data`, data)
    if (!response.ok) {
      throw new Error(data as any);
    }

    return data;
  } catch (error) {
    console.error('❌ API Request Error:', error);
    throw error;
  }
};

export const getRequest = async <T>(endpoint: string): Promise<T> => {
  try {
    const response = await fetch(`${BASE_URL()}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data: T = await response.json();

    if (!response.ok) {
      throw new Error(data as any);
    }

    return data;
  } catch (error) {
    console.error('❌ API Request Error:', error);
    throw error;
  }
};

export const putRequest = async <T>(endpoint: string, body: object): Promise<T> => {
  try {
    const response = await fetch(`${BASE_URL()}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });

    const data: T = await response.json();

    if (!response.ok) {
      throw new Error(data as any);
    }

    return data;
  } catch (error) {
    console.error('❌ API Request Error:', error);
    throw error;
  }
};

export const deleteRequest = async <T>(endpoint: string): Promise<T> => {
  try {
    const response = await fetch(`${BASE_URL()}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data: T = await response.json();

    if (!response.ok) {
      throw new Error(data as any);
    }

    return data;
  } catch (error) {
    console.error('❌ API Request Error:', error);
    throw error;
  }
};
