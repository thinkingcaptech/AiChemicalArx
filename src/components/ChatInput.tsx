import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, ChevronDown, Lock, Wand2 } from 'lucide-react';
import type { AIProvider, APIKeys } from '../types';
import { AI_PROVIDERS } from '../config/providers';
import { canGenerateImages } from '../services/imageGenService';

interface ChatInputProps {
  onSend: (message: string) => void;
  onCancel: () => void;
  isLoading: boolean;
  provider: AIProvider;
  model: string;
  onProviderChange: (provider: AIProvider, model: string) => void;
  hasApiKey: boolean;
  apiKeys: APIKeys;
  onOpenSettings: () => void;
  onGenerateImage?: (prompt: string) => void;
  isGeneratingImage?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onCancel,
  isLoading,
  provider,
  model,
  onProviderChange,
  hasApiKey,
  apiKeys,
  onOpenSettings,
  onGenerateImage,
  isGeneratingImage,
}) => {
  const [message, setMessage] = useState('');
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentProvider = AI_PROVIDERS.find(p => p.id === provider);
  const currentModel = currentProvider?.models.find(m => m.id === model);
  const supportsImageGeneration = canGenerateImages(provider, model);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowProviderMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleProviderSelect = (providerId: AIProvider, modelId: string) => {
    onProviderChange(providerId, modelId);
    setShowProviderMenu(false);
  };

  return (
    <div className="border-t border-[var(--color-mystic)] p-4 bg-[var(--color-obsidian)]/50 backdrop-blur-sm">
      {/* Provider Selector */}
      <div className="flex items-center justify-between mb-3">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProviderMenu(!showProviderMenu)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-amethyst)] hover:bg-[var(--color-mystic)] transition-colors text-sm ${!hasApiKey ? 'border border-[var(--color-ember)]/50' : ''}`}
          >
            <div 
              className={`w-2 h-2 rounded-full ${!hasApiKey ? 'grayscale opacity-50' : ''}`}
              style={{ backgroundColor: currentProvider?.iconColor }}
            />
            <span className={!hasApiKey ? 'opacity-70' : ''}>{currentProvider?.displayName}</span>
            <span className="text-[var(--color-ethereal)]">·</span>
            <span className={`text-[var(--color-ethereal)] ${!hasApiKey ? 'opacity-50' : ''}`}>{currentModel?.name}</span>
            {!hasApiKey && <Lock className="w-3 h-3 text-[var(--color-ember)]" />}
            <ChevronDown className={`w-4 h-4 transition-transform ${showProviderMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProviderMenu && (
            <div className="absolute bottom-full left-0 mb-2 w-80 card-mystical p-2 shadow-xl z-50 max-h-96 overflow-y-auto">
              {AI_PROVIDERS.map((prov) => {
                const providerHasKey = apiKeys[prov.id] && apiKeys[prov.id]!.trim() !== '';
                return (
                  <div key={prov.id} className="mb-2 last:mb-0">
                    <div className={`flex items-center gap-2 px-2 py-1.5 text-sm font-medium ${providerHasKey ? 'text-[var(--color-gold)]' : 'text-[var(--color-ethereal)] opacity-60'}`}>
                      <div 
                        className={`w-3 h-3 rounded-full ${!providerHasKey ? 'grayscale opacity-50' : ''}`}
                        style={{ backgroundColor: prov.iconColor }}
                      />
                      {prov.displayName}
                      {!providerHasKey && (
                        <span className="ml-auto flex items-center gap-1 text-xs">
                          <Lock className="w-3 h-3" />
                          No API key
                        </span>
                      )}
                      {providerHasKey && (
                        <span className="ml-auto text-xs text-[var(--color-sage)]">✓</span>
                      )}
                    </div>
                    {prov.models.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => providerHasKey && handleProviderSelect(prov.id, m.id)}
                        disabled={!providerHasKey}
                        className={`
                          w-full text-left px-4 py-2 rounded-lg text-sm transition-colors
                          ${!providerHasKey 
                            ? 'opacity-40 cursor-not-allowed grayscale' 
                            : provider === prov.id && model === m.id 
                              ? 'bg-[var(--color-mystic)] text-[var(--color-gold)]' 
                              : 'hover:bg-[var(--color-amethyst)]'}
                        `}
                      >
                        <div className="font-medium">{m.name}</div>
                        {m.description && (
                          <div className="text-xs text-[var(--color-ethereal)]">{m.description}</div>
                        )}
                      </button>
                    ))}
                  </div>
                );
              })}
              
              {/* Add API key button */}
              <div className="border-t border-[var(--color-mystic)] mt-2 pt-2">
                <button
                  onClick={() => {
                    setShowProviderMenu(false);
                    onOpenSettings();
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg text-sm text-[var(--color-ethereal)] hover:bg-[var(--color-amethyst)] hover:text-[var(--color-gold)] transition-colors"
                >
                  ⚙️ Manage API Keys...
                </button>
              </div>
            </div>
          )}
        </div>

        {!hasApiKey && (
          <div className="text-xs text-[var(--color-ember)] flex items-center gap-1">
            <span>⚠️ API key required</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasApiKey ? "Begin your incantation..." : "Set your API key in settings first..."}
            disabled={!hasApiKey}
            rows={1}
            className="w-full input-mystical rounded-xl px-4 py-3 pr-12 resize-none text-[var(--color-spirit)] placeholder-[var(--color-ethereal)]/50 disabled:opacity-50"
          />
        </div>

        {/* Image Generation Button */}
        {supportsImageGeneration && (
          <button
            type="button"
            onClick={() => {
              console.log('🖱️ Image gen button clicked!');
              console.log('📝 Message:', message.trim());
              console.log('🔧 onGenerateImage:', !!onGenerateImage);
              console.log('⏳ isLoading:', isLoading, 'isGeneratingImage:', isGeneratingImage);
              if (message.trim() && onGenerateImage && !isLoading && !isGeneratingImage) {
                console.log('✅ Calling onGenerateImage...');
                onGenerateImage(message.trim());
              } else {
                console.log('❌ Conditions not met for image generation');
              }
            }}
            disabled={!message.trim() || !hasApiKey || isLoading || isGeneratingImage}
            title={supportsImageGeneration ? 'Generate image from prompt' : 'Model does not support image generation'}
            className="p-3 rounded-xl bg-[var(--color-amethyst)] hover:bg-[var(--color-mystic)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Wand2 className={`w-5 h-5 ${isGeneratingImage ? 'animate-spin' : ''}`} />
          </button>
        )}

        {isLoading ? (
          <button
            type="button"
            onClick={onCancel}
            className="p-3 rounded-xl bg-[var(--color-ember)] hover:bg-[var(--color-ember)]/80 transition-colors"
          >
            <Square className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!message.trim() || !hasApiKey}
            className="p-3 rounded-xl btn-alchemical disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            <Send className="w-5 h-5" />
          </button>
        )}
      </form>

      <p className="text-xs text-center text-[var(--color-ethereal)] mt-3 opacity-75">
        Arx AI · Your keys, your data, your privacy ✨
      </p>
    </div>
  );
};
