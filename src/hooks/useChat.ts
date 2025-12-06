import { useState, useEffect, useCallback } from 'react';
import type { Chat, AIProvider, AppSettings, APIKeys } from '../types';
import { aiService } from '../services/aiService';
import { storageService, createNewChat, createMessage, generateChatTitle } from '../services/storageService';
import { AI_PROVIDERS } from '../config/providers';

// Get first provider with an available API key
function getAvailableProvider(apiKeys: APIKeys): { provider: AIProvider; model: string } | null {
  for (const providerConfig of AI_PROVIDERS) {
    const key = apiKeys[providerConfig.id as keyof APIKeys];
    if (key && key.trim() !== '') {
      return {
        provider: providerConfig.id as AIProvider,
        model: providerConfig.models[0]?.id || ''
      };
    }
  }
  return null;
}

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());

  // Load chats on mount
  useEffect(() => {
    const loadedChats = storageService.getChats();
    setChats(loadedChats);

    const currentChatId = storageService.getCurrentChatId();
    if (currentChatId) {
      const chat = loadedChats.find(c => c.id === currentChatId);
      if (chat) {
        setCurrentChat(chat);
      }
    }
  }, []);

  // Save settings when changed
  useEffect(() => {
    storageService.saveSettings(settings);
  }, [settings]);

  // Auto-switch to available provider when API keys change and current provider has no key
  useEffect(() => {
    const currentProvider = currentChat?.provider || settings.defaultProvider;
    const hasCurrentKey = settings.apiKeys[currentProvider] && settings.apiKeys[currentProvider]!.trim() !== '';
    
    if (!hasCurrentKey) {
      const available = getAvailableProvider(settings.apiKeys);
      if (available && currentChat) {
        // Update current chat to use available provider
        const updatedChat = {
          ...currentChat,
          provider: available.provider,
          model: available.model,
        };
        setCurrentChat(updatedChat);
        storageService.saveChat(updatedChat);
        setChats(prev => prev.map(c => c.id === updatedChat.id ? updatedChat : c));
      }
    }
  }, [settings.apiKeys]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const startNewChat = useCallback(() => {
    // Try to use a provider with an available API key
    const available = getAvailableProvider(settings.apiKeys);
    const provider = available?.provider || settings.defaultProvider;
    const model = available?.model || settings.defaultModel;
    
    const chat = createNewChat(provider, model);
    setCurrentChat(chat);
    storageService.setCurrentChatId(chat.id);
    return chat;
  }, [settings.apiKeys, settings.defaultProvider, settings.defaultModel]);

  const selectChat = useCallback((chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChat(chat);
      storageService.setCurrentChatId(chat.id);
    }
  }, [chats]);

  const deleteChat = useCallback((chatId: string) => {
    storageService.deleteChat(chatId);
    setChats(prev => prev.filter(c => c.id !== chatId));
    
    if (currentChat?.id === chatId) {
      setCurrentChat(null);
      storageService.setCurrentChatId(null);
    }
  }, [currentChat]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const apiKey = settings.apiKeys[currentChat?.provider || settings.defaultProvider];
    if (!apiKey) {
      throw new Error(`Please set your API key for ${currentChat?.provider || settings.defaultProvider} in settings.`);
    }

    let chat = currentChat;
    if (!chat) {
      chat = createNewChat(settings.defaultProvider, settings.defaultModel);
      setCurrentChat(chat);
    }

    // Add user message
    const userMessage = createMessage('user', content);
    const updatedMessages = [...chat.messages, userMessage];
    
    // Create assistant message placeholder
    const assistantMessage = createMessage('assistant', '');
    assistantMessage.isStreaming = true;
    assistantMessage.provider = chat.provider;
    assistantMessage.model = chat.model;

    const chatWithUserMessage: Chat = {
      ...chat,
      messages: [...updatedMessages, assistantMessage],
      updatedAt: Date.now(),
    };

    setCurrentChat(chatWithUserMessage);
    setIsLoading(true);

    try {
      let fullContent = '';
      
      const stream = aiService.streamChat(
        chat.provider,
        apiKey,
        chat.model,
        updatedMessages,
        settings.systemPrompt
      );

      for await (const chunk of stream) {
        if (chunk.error) {
          assistantMessage.error = chunk.error;
          assistantMessage.isStreaming = false;
          break;
        }

        if (chunk.content) {
          fullContent += chunk.content;
          assistantMessage.content = fullContent;
          
          setCurrentChat(prev => {
            if (!prev) return prev;
            const messages = [...prev.messages];
            messages[messages.length - 1] = { ...assistantMessage };
            return { ...prev, messages };
          });
        }

        if (chunk.done) {
          assistantMessage.isStreaming = false;
        }
      }

      // Finalize the chat
      assistantMessage.content = fullContent;
      assistantMessage.isStreaming = false;

      const finalChat: Chat = {
        ...chat,
        messages: [...updatedMessages, assistantMessage],
        title: chat.messages.length === 0 ? generateChatTitle([userMessage]) : chat.title,
        updatedAt: Date.now(),
      };

      setCurrentChat(finalChat);
      
      if (settings.saveHistory) {
        storageService.saveChat(finalChat);
        setChats(prev => {
          const filtered = prev.filter(c => c.id !== finalChat.id);
          return [finalChat, ...filtered];
        });
      }

      storageService.setCurrentChatId(finalChat.id);

    } catch (error) {
      console.error('Error sending message:', error);
      assistantMessage.error = error instanceof Error ? error.message : 'An error occurred';
      assistantMessage.isStreaming = false;
      
      setCurrentChat(prev => {
        if (!prev) return prev;
        const messages = [...prev.messages];
        messages[messages.length - 1] = { ...assistantMessage };
        return { ...prev, messages };
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentChat, settings, isLoading]);

  const cancelGeneration = useCallback(() => {
    aiService.cancelRequest();
    setIsLoading(false);
    
    if (currentChat) {
      const messages = [...currentChat.messages];
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.isStreaming) {
        lastMessage.isStreaming = false;
        lastMessage.content += '\n\n*[Generation cancelled]*';
        setCurrentChat({ ...currentChat, messages });
      }
    }
  }, [currentChat]);

  const changeProvider = useCallback((provider: AIProvider, model: string) => {
    if (currentChat) {
      const updatedChat = { ...currentChat, provider, model };
      setCurrentChat(updatedChat);
    }
    updateSettings({ defaultProvider: provider, defaultModel: model });
  }, [currentChat, updateSettings]);

  const clearHistory = useCallback(() => {
    setChats([]);
    storageService.saveChats([]);
  }, []);

  return {
    chats,
    currentChat,
    isLoading,
    settings,
    updateSettings,
    startNewChat,
    selectChat,
    deleteChat,
    sendMessage,
    cancelGeneration,
    changeProvider,
    clearHistory,
  };
}
