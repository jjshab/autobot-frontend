// src/LangflowClient.ts

export default class LangflowClient {
  private readonly baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async post<T>(
    endpoint: string,
    body: unknown,
    headers: Record<string, string> = { 'Content-Type': 'application/json' }
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const responseMessage = await response.json();
      if (!response.ok) {
        throw new Error(
          `${response.status} ${response.statusText} - ${JSON.stringify(responseMessage)}`
        );
      }
      return responseMessage as T;
    } catch (error) {
      console.error('Request Error:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  // Additional methods as needed...
}
