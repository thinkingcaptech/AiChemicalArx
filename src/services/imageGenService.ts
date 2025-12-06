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
  const response = await fetch('https://api.openai.com/v1/images/generations', {
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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI image generation failed: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.data.map((item: { url: string; revised_prompt?: string }) => ({
    imageUrl: item.url,
    revisedPrompt: item.revised_prompt,
  }));
}

async function generateImageWithGemini(
  apiKey: string,
  request: ImageGenerationRequest
): Promise<ImageGenerationResponse[]> {
  // Gemini uses the Imagen 3 model via generateContent
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImages?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt,
        number_of_images: request.n || 1,
        aspectRatio: '1:1', // Default square images
        safetyFilterLevel: 'block_some',
        personGenerationMode: 'dont_allow',
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini image generation failed: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.images?.map((item: { url?: string; gcsUri?: string }) => ({
    imageUrl: item.url || item.gcsUri || '',
  })) || [];
}

export async function generateImage(
  providerId: string,
  modelId: string,
  apiKey: string,
  request: ImageGenerationRequest
): Promise<ImageGenerationResponse[]> {
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
