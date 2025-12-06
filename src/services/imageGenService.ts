import { AI_PROVIDERS } from '../config/providers';
import type { AIProviderConfig } from '../types';

export interface ImageGenerationRequest {
  prompt: string;
  size?: string;
  quality?: string;
  n?: number; // number of images
}

export interface ImageGenerationResponse {
  imageUrl: string;
  revisedPrompt?: string;
}

async function generateImageWithOpenAI(
  apiKey: string,
  request: ImageGenerationRequest
): Promise<ImageGenerationResponse[]> {
  console.log('[OpenAI Image Gen] Starting request with prompt:', request.prompt);
  
  let response: Response;
  try {
    response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: request.prompt,
        size: request.size || '1024x1024',
        quality: request.quality || 'standard',
        n: request.n || 1,
      }),
    });
  } catch (error) {
    console.error('[OpenAI Image Gen] Network error:', error);
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Failed to fetch'}`);
  }

  console.log('[OpenAI Image Gen] Response status:', response.status);

  if (!response.ok) {
    let errorMsg = 'Unknown error';
    try {
      const error = await response.json();
      console.error('[OpenAI Image Gen] API error response:', error);
      errorMsg = error.error?.message || error.message || JSON.stringify(error);
    } catch (e) {
      errorMsg = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(`OpenAI: ${errorMsg}`);
  }

  const data = await response.json();
  console.log('[OpenAI Image Gen] Success, received data:', data);
  
  if (!data.data || data.data.length === 0) {
    throw new Error('No images returned from OpenAI');
  }
  
  return data.data.map((item: { url: string; revised_prompt?: string }) => ({
    imageUrl: item.url,
    revisedPrompt: item.revised_prompt,
  }));
}

async function generateImageWithGemini(
  apiKey: string,
  request: ImageGenerationRequest
): Promise<ImageGenerationResponse[]> {
  console.log('[Gemini Image Gen] Starting request with prompt:', request.prompt);
  
  // Gemini image generation uses the standard generateContent endpoint
  // with response_modalities set to include Image
  const model = 'gemini-2.0-flash-exp'; // Image generation model
  
  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate an image: ${request.prompt}`
                }
              ]
            }
          ],
          generationConfig: {
            responseModalities: ['Text', 'Image'],
          }
        }),
      }
    );
  } catch (error) {
    console.error('[Gemini Image Gen] Network error:', error);
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Failed to fetch'}`);
  }

  console.log('[Gemini Image Gen] Response status:', response.status);

  if (!response.ok) {
    let errorMsg = 'Unknown error';
    try {
      const error = await response.json();
      console.error('[Gemini Image Gen] API error response:', error);
      errorMsg = error.error?.message || error.message || JSON.stringify(error);
    } catch (e) {
      errorMsg = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(`Gemini: ${errorMsg}`);
  }

  const data = await response.json();
  console.log('[Gemini Image Gen] Success, received data:', JSON.stringify(data, null, 2));
  
  // Parse the response to extract image data
  const images: ImageGenerationResponse[] = [];
  
  if (data.candidates && data.candidates.length > 0) {
    const candidate = data.candidates[0];
    if (candidate.content && candidate.content.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
          // Convert base64 image data to a data URL
          const dataUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          images.push({ imageUrl: dataUrl });
        }
      }
    }
  }
  
  if (images.length === 0) {
    console.error('[Gemini Image Gen] No images found in response:', data);
    throw new Error('No images returned from Gemini. The model may not support image generation for this prompt.');
  }
  
  return images;
}

export async function generateImage(
  providerId: string,
  modelId: string,
  apiKey: string,
  request: ImageGenerationRequest
): Promise<ImageGenerationResponse[]> {
  console.log('[Image Gen] Request:', { providerId, modelId, promptLength: request.prompt?.length });
  
  if (!apiKey) {
    throw new Error('API key is required');
  }

  if (!request.prompt || request.prompt.trim().length === 0) {
    throw new Error('Prompt is required');
  }

  // Find the provider configuration
  const provider = AI_PROVIDERS.find(p => p.id === providerId) as AIProviderConfig | undefined;
  if (!provider) {
    throw new Error(`Provider ${providerId} not found`);
  }

  // Find the model configuration
  const model = provider.models.find(m => m.id === modelId);
  if (!model) {
    throw new Error(`Model ${modelId} not found`);
  }

  // Check if model supports image generation
  if (!model.canGenerateImages) {
    throw new Error(`Model ${model.name} does not support image generation`);
  }

  console.log('[Image Gen] Routing to provider:', providerId);

  // Route to appropriate provider's image generation
  switch (providerId) {
    case 'openai':
      return generateImageWithOpenAI(apiKey, request);
    case 'gemini':
      return generateImageWithGemini(apiKey, request);
    default:
      throw new Error(`Image generation not supported for provider: ${providerId}`);
  }
}

export function canGenerateImages(providerId: string, modelId: string): boolean {
  const provider = AI_PROVIDERS.find(p => p.id === providerId);
  if (!provider) return false;

  const model = provider.models.find(m => m.id === modelId);
  return model?.canGenerateImages ?? false;
}
