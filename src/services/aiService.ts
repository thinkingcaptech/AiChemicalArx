import type { AIProvider, Message, StreamChunk } from '../types';
import { AI_PROVIDERS } from '../config/providers';

export class AIService {
  private abortController: AbortController | null = null;

  getProviderConfig(providerId: AIProvider) {
    return AI_PROVIDERS.find(p => p.id === providerId);
  }

  async *streamChat(
    provider: AIProvider,
    apiKey: string,
    model: string,
    messages: Message[],
    systemPrompt?: string
  ): AsyncGenerator<StreamChunk> {
    const config = this.getProviderConfig(provider);
    if (!config) {
      yield { content: '', done: true, error: 'Invalid provider' };
      return;
    }

    this.abortController = new AbortController();

    try {
      const formattedMessages = this.formatMessages(provider, messages, systemPrompt);
      const response = await this.makeRequest(provider, apiKey, model, formattedMessages, config.baseUrl, systemPrompt);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `API Error: ${response.status}`;
        yield { content: '', done: true, error: errorMessage };
        return;
      }

      if (!response.body) {
        yield { content: '', done: true, error: 'No response body' };
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              yield { content: '', done: true };
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = this.extractContent(provider, parsed);
              if (content) {
                yield { content, done: false };
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      yield { content: '', done: true };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        yield { content: '', done: true, error: 'Request cancelled' };
      } else {
        yield { content: '', done: true, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  }

  cancelRequest() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  private formatMessages(
    provider: AIProvider,
    messages: Message[],
    systemPrompt?: string
  ): { role: string; content: string }[] {
    const formatted: { role: string; content: string }[] = [];

    // Gemini and Anthropic handle system prompts separately
    if (systemPrompt && provider !== 'anthropic' && provider !== 'gemini') {
      formatted.push({ role: 'system', content: systemPrompt });
    }

    for (const msg of messages) {
      if (msg.role !== 'system') {
        formatted.push({ role: msg.role, content: msg.content });
      }
    }

    return formatted;
  }

  private async makeRequest(
    provider: AIProvider,
    apiKey: string,
    model: string,
    messages: { role: string; content: string }[],
    baseUrl: string,
    systemPrompt?: string
  ): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    let url: string;
    let body: Record<string, unknown>;

    if (provider === 'anthropic') {
      url = `${baseUrl}/messages`;
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      headers['anthropic-dangerous-direct-browser-access'] = 'true';

      const systemMessage = messages.find(m => m.role === 'system');
      const otherMessages = messages.filter(m => m.role !== 'system');

      body = {
        model,
        max_tokens: 4096,
        stream: true,
        messages: otherMessages,
        ...(systemMessage && { system: systemMessage.content }),
      };
    } else if (provider === 'gemini') {
      // Gemini uses REST API with API key as query param
      url = `${baseUrl}/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
      
      // Convert messages to Gemini format (role: 'user' or 'model')
      const contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      body = {
        contents,
        ...(systemPrompt && { 
          systemInstruction: { 
            parts: [{ text: systemPrompt }] 
          } 
        }),
        generationConfig: {
          maxOutputTokens: 8192,
        },
      };
    } else {
      url = `${baseUrl}/chat/completions`;
      headers['Authorization'] = `Bearer ${apiKey}`;

      body = {
        model,
        messages,
        stream: true,
        max_tokens: 4096,
      };
    }

    return fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: this.abortController?.signal,
    });
  }

  private extractContent(provider: AIProvider, parsed: Record<string, unknown>): string {
    if (provider === 'anthropic') {
      if (parsed.type === 'content_block_delta') {
        const delta = parsed.delta as { text?: string } | undefined;
        return delta?.text || '';
      }
      return '';
    } else if (provider === 'gemini') {
      // Gemini stream format
      const candidates = parsed.candidates as Array<{ content?: { parts?: Array<{ text?: string }> } }> | undefined;
      return candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      // OpenAI and Grok format
      const choices = parsed.choices as Array<{ delta?: { content?: string } }> | undefined;
      return choices?.[0]?.delta?.content || '';
    }
  }
}

export const aiService = new AIService();
