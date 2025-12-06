import React, { useState } from 'react';
import { Sparkles, Key, Eye, EyeOff, ArrowRight, X, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { AI_PROVIDERS } from '../config/providers';
import { testApiKey, type TestResult } from '../services/apiKeyTester';
import type { APIKeys, AIProvider } from '../types';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: APIKeys;
  onSaveKeys: (keys: APIKeys) => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  apiKeys,
  onSaveKeys,
}) => {
  const [localKeys, setLocalKeys] = useState<APIKeys>(apiKeys);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

  if (!isOpen) return null;

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const updateApiKey = (provider: AIProvider, value: string) => {
    setLocalKeys(prev => ({ ...prev, [provider]: value }));
    // Clear test result when key changes
    setTestResults(prev => {
      const newResults = { ...prev };
      delete newResults[provider];
      return newResults;
    });
  };

  const handleTestKey = async (provider: AIProvider) => {
    const key = localKeys[provider];
    if (!key || key.trim() === '') return;

    setTestingProvider(provider);
    try {
      const result = await testApiKey(provider, key);
      setTestResults(prev => ({ ...prev, [provider]: result }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [provider]: { success: false, message: 'Test failed' } 
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const handleContinue = () => {
    onSaveKeys(localKeys);
    onClose();
  };

  const hasAnyKey = Object.values(localKeys).some(key => key && key.trim() !== '');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="card-mystical w-full max-w-lg overflow-hidden relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[var(--color-mystic)] transition-colors opacity-60 hover:opacity-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with animated icon */}
        <div className="pt-8 pb-4 px-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-elixir)] flex items-center justify-center glow-gold animate-float">
            <Sparkles className="w-10 h-10 text-[var(--color-void)]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-gold)] mb-2">
            Welcome to Arx AI
          </h2>
          <p className="text-[var(--color-ethereal)] text-sm">
            Your premium multi-provider AI assistant.<br />
            Enter your API keys to get started.
          </p>
        </div>

        {/* API Key Entry */}
        <div className="px-6 pb-4 space-y-4">
          <div className="flex items-center gap-2 text-sm text-[var(--color-ethereal)] mb-2">
            <Key className="w-4 h-4" />
            <span>Your keys are stored locally and never sent to our servers</span>
          </div>

          {AI_PROVIDERS.map((provider) => {
            const testResult = testResults[provider.id];
            const isTesting = testingProvider === provider.id;
            const hasKey = localKeys[provider.id] && localKeys[provider.id]!.trim() !== '';
            
            return (
              <div key={provider.id} className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: provider.iconColor }}
                  />
                  {provider.displayName}
                  {testResult && (
                    <span className={`text-xs ml-auto flex items-center gap-1 ${testResult.success ? 'text-[var(--color-sage)]' : 'text-[var(--color-ember)]'}`}>
                      {testResult.success ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {testResult.message}
                    </span>
                  )}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKeys[provider.id] ? 'text' : 'password'}
                      value={localKeys[provider.id] || ''}
                      onChange={(e) => updateApiKey(provider.id, e.target.value)}
                      placeholder={`Enter your ${provider.displayName} API key`}
                      className={`w-full input-mystical rounded-lg px-4 py-2.5 pr-12 text-sm ${
                        testResult 
                          ? testResult.success 
                            ? 'border-[var(--color-sage)]' 
                            : 'border-[var(--color-ember)]'
                          : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey(provider.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ethereal)] hover:text-[var(--color-spirit)]"
                    >
                      {showKeys[provider.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTestKey(provider.id)}
                    disabled={!hasKey || isTesting}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-all
                      flex items-center gap-1.5 min-w-[70px] justify-center
                      ${hasKey 
                        ? 'bg-[var(--color-amethyst)] hover:bg-[var(--color-mystic)] text-[var(--color-spirit)]' 
                        : 'bg-[var(--color-mystic)] text-[var(--color-ethereal)] opacity-50 cursor-not-allowed'}
                    `}
                  >
                    {isTesting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Test'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Provider status preview */}
        <div className="px-6 pb-4">
          <p className="text-xs text-[var(--color-ethereal)] mb-2">Available Providers:</p>
          <div className="flex gap-2 flex-wrap">
            {AI_PROVIDERS.map((provider) => {
              const hasKey = localKeys[provider.id] && localKeys[provider.id]!.trim() !== '';
              return (
                <div
                  key={provider.id}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5
                    transition-all duration-300
                    ${hasKey 
                      ? 'opacity-100' 
                      : 'opacity-40 grayscale'}
                  `}
                  style={{ 
                    backgroundColor: hasKey ? provider.iconColor + '30' : 'var(--color-mystic)',
                    borderColor: hasKey ? provider.iconColor : 'transparent',
                    borderWidth: '1px'
                  }}
                >
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: hasKey ? provider.iconColor : 'var(--color-ethereal)' }}
                  />
                  {provider.displayName}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          <button
            onClick={handleContinue}
            disabled={!hasAnyKey}
            className={`
              w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2
              transition-all duration-300
              ${hasAnyKey 
                ? 'btn-alchemical' 
                : 'bg-[var(--color-mystic)] text-[var(--color-ethereal)] cursor-not-allowed'}
            `}
          >
            {hasAnyKey ? (
              <>
                Get Started
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              'Enter at least one API key to continue'
            )}
          </button>
          
          <button
            onClick={onClose}
            className="text-sm text-[var(--color-ethereal)] hover:text-[var(--color-spirit)] transition-colors"
          >
            Skip for now (configure later in Settings)
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-radial from-[var(--color-gold)]/10 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-radial from-[var(--color-elixir)]/10 to-transparent rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
};
