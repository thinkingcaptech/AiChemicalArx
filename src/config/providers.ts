import type { AIProviderConfig } from '../types';

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'openai',
    name: 'openai',
    displayName: 'OpenAI',
    apiKeyName: 'OPENAI_API_KEY',
    baseUrl: 'https://api.openai.com/v1',
    iconColor: '#10a37f',
    models: [
      { id: 'gpt-5.1', name: 'GPT-5.1', maxTokens: 200000, description: 'Best for coding & agentic tasks', canGenerateImages: true },
      { id: 'gpt-5-mini', name: 'GPT-5 Mini', maxTokens: 200000, description: 'Fast, cost-efficient for defined tasks', canGenerateImages: true },
      { id: 'gpt-5-nano', name: 'GPT-5 Nano', maxTokens: 128000, description: 'Fastest, most cost-efficient', canGenerateImages: false },
      { id: 'gpt-4o', name: 'GPT-4o', maxTokens: 128000, description: 'Previous flagship, complex tasks', canGenerateImages: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', maxTokens: 128000, description: 'Fast and efficient', canGenerateImages: true },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', maxTokens: 128000, description: 'Previous generation', canGenerateImages: true },
    ],
  },
  {
    id: 'anthropic',
    name: 'anthropic',
    displayName: 'Anthropic',
    apiKeyName: 'ANTHROPIC_API_KEY',
    baseUrl: 'https://api.anthropic.com/v1',
    iconColor: '#d4a574',
    models: [
      { id: 'claude-opus-4-0-20250514', name: 'Claude Opus 4.5', maxTokens: 200000, description: 'Most intelligent, complex tasks & research' },
      { id: 'claude-sonnet-4-0-20250514', name: 'Claude Sonnet 4.5', maxTokens: 200000, description: 'Balanced intelligence and speed' },
      { id: 'claude-haiku-4-0-20250514', name: 'Claude Haiku 4.5', maxTokens: 200000, description: 'Fastest and most cost-effective' },
      { id: 'claude-opus-4-20250415', name: 'Claude Opus 4.1', maxTokens: 200000, description: 'Previous gen most capable' },
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4.1', maxTokens: 200000, description: 'Previous gen balanced' },
      { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', maxTokens: 200000, description: 'Extended thinking capable' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', maxTokens: 200000, description: 'Excellent speed and capability' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', maxTokens: 200000, description: 'Fast and efficient' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', maxTokens: 200000, description: 'Legacy fast model' },
    ],
  },
  {
    id: 'grok',
    name: 'grok',
    displayName: 'xAI Grok',
    apiKeyName: 'XAI_API_KEY',
    baseUrl: 'https://api.x.ai/v1',
    iconColor: '#1da1f2',
    models: [
      { id: 'grok-4-1-fast-reasoning', name: 'Grok 4.1 Fast Reasoning', maxTokens: 2000000, description: 'Latest with fast reasoning' },
      { id: 'grok-4-1-fast-non-reasoning', name: 'Grok 4.1 Fast', maxTokens: 2000000, description: 'Latest fast non-reasoning' },
      { id: 'grok-4-fast-reasoning', name: 'Grok 4 Fast Reasoning', maxTokens: 2000000, description: 'Fast with reasoning' },
      { id: 'grok-4-fast-non-reasoning', name: 'Grok 4 Fast', maxTokens: 2000000, description: 'Fast non-reasoning' },
      { id: 'grok-4-0709', name: 'Grok 4', maxTokens: 256000, description: 'Flagship model' },
      { id: 'grok-code-fast-1', name: 'Grok Code Fast', maxTokens: 256000, description: 'Optimized for coding' },
      { id: 'grok-3', name: 'Grok 3', maxTokens: 131072, description: 'Previous generation' },
      { id: 'grok-3-mini', name: 'Grok 3 Mini', maxTokens: 131072, description: 'Compact and efficient' },
      { id: 'grok-2-vision-1212', name: 'Grok 2 Vision', maxTokens: 32768, description: 'Vision capable' },
    ],
  },
  {
    id: 'gemini',
    name: 'gemini',
    displayName: 'Google Gemini',
    apiKeyName: 'GOOGLE_API_KEY',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    iconColor: '#4285f4',
    models: [
      { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', maxTokens: 1048576, description: 'Most intelligent model, multimodal & agentic', canGenerateImages: true },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', maxTokens: 1048576, description: 'Best price-performance, fast thinking', canGenerateImages: true },
      { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', maxTokens: 1048576, description: 'Ultra fast, cost-efficient', canGenerateImages: false },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', maxTokens: 2097152, description: 'Advanced thinking, code & STEM reasoning', canGenerateImages: true },
    ],
  },
];

export const DEFAULT_SYSTEM_PROMPT = `You are a highly capable AI assistant. You provide clear, accurate, and helpful responses. You are knowledgeable across many domains including coding, writing, research, analysis, and problem-solving. You are helpful, harmless, and honest.`;

export const DEFAULT_SETTINGS = {
  apiKeys: {},
  defaultProvider: 'openai' as const,
  defaultModel: 'gpt-4o-mini',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  streamResponses: true,
  saveHistory: true,
  maxHistoryChats: 50,
};

export const STORAGE_KEYS = {
  SETTINGS: 'aichemyarx_settings',
  CHATS: 'aichemyarx_chats',
  CURRENT_CHAT: 'aichemyarx_current_chat',
};
