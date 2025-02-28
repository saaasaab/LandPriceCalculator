export const BASE_URL = () => {

  return window.location.hostname.includes("localhost")
    ? "http://localhost:8080"
    : "https://landpricecalculatorapi.onrender.com";
}


export const postRequest = async <T>(endpoint: string, body: object): Promise<T> => {
  try {
    const response = await fetch(`${BASE_URL()}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

export const getRequest = async <T>(endpoint: string): Promise<T> => {
  try {
    const response = await fetch(`${BASE_URL()}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
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