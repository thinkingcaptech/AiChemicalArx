import type { AIProvider } from '../types';
import { AI_PROVIDERS } from '../config/providers';

export interface TestResult {
  success: boolean;
  message: string;
}

export async function testApiKey(provider: AIProvider, apiKey: string): Promise<TestResult> {
  if (!apiKey || apiKey.trim() === '') {
    return { success: false, message: 'No API key provided' };
  }

  const config = AI_PROVIDERS.find(p => p.id === provider);
  if (!config) {
    return { success: false, message: 'Unknown provider' };
  }

  try {
    if (provider === 'anthropic') {
      // Anthropic - test with a minimal messages request
      const response = await fetch(`${config.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      });

      if (response.ok) {
        return { success: true, message: 'API key is valid!' };
      }

      const error = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        return { success: false, message: 'Invalid API key' };
      } else if (response.status === 403) {
        return { success: false, message: 'API key lacks permissions' };
      } else if (response.status === 429) {
        // Rate limited means the key is valid
        return { success: true, message: 'API key is valid! (rate limited)' };
      }
      
      return { success: false, message: error.error?.message || `Error: ${response.status}` };
      
    } else if (provider === 'gemini') {
      // Gemini - test with models list endpoint
      const response = await fetch(`${config.baseUrl}/models?key=${apiKey}`, {
        method: 'GET',
      });

      if (response.ok) {
        return { success: true, message: 'API key is valid!' };
      }

      const error = await response.json().catch(() => ({}));
      
      if (response.status === 400 || response.status === 401 || response.status === 403) {
        return { success: false, message: error.error?.message || 'Invalid API key' };
      } else if (response.status === 429) {
        // Rate limited means the key is valid
        return { success: true, message: 'API key is valid! (rate limited)' };
      }
      
      return { success: false, message: error.error?.message || `Error: ${response.status}` };
      
    } else {
      // OpenAI and Grok use similar API structure
      // Test with models endpoint which is lightweight
      const response = await fetch(`${config.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (response.ok) {
        return { success: true, message: 'API key is valid!' };
      }

      const error = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        return { success: false, message: 'Invalid API key' };
      } else if (response.status === 403) {
        return { success: false, message: 'API key lacks permissions' };
      } else if (response.status === 429) {
        // Rate limited means the key is valid
        return { success: true, message: 'API key is valid! (rate limited)' };
      }
      
      return { success: false, message: error.error?.message || `Error: ${response.status}` };
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return { success: false, message: 'Network error - check your connection' };
    }
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}
