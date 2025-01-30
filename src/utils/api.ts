export const postRequest = async <T>(url: string, body: object): Promise<T> => {
    try {
      const response = await fetch(url, {
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