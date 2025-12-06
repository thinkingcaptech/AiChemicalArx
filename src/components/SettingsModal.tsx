import React, { useState } from 'react';
import { X, Key, Save, Trash2, Eye, EyeOff, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { AppSettings, AIProvider } from '../types';
import { AI_PROVIDERS, DEFAULT_SYSTEM_PROMPT } from '../config/providers';
import { testApiKey, type TestResult } from '../services/apiKeyTester';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: Partial<AppSettings>) => void;
  onClearHistory: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  onClearHistory,
}) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const updateApiKey = (provider: AIProvider, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      apiKeys: { ...prev.apiKeys, [provider]: value },
    }));
    // Clear test result when key changes
    setTestResults(prev => {
      const newResults = { ...prev };
      delete newResults[provider];
      return newResults;
    });
  };

  const handleTestKey = async (provider: AIProvider) => {
    const key = localSettings.apiKeys[provider];
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

  const handleClearHistory = () => {
    onClearHistory();
    setShowClearConfirm(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card-mystical w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-mystic)]">
          <h2 className="text-xl font-bold text-[var(--color-gold)]">⚙️ Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-mystic)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* API Keys Section */}
          <section>
            <h3 className="text-lg font-semibold text-[var(--color-gold)] mb-3 flex items-center gap-2">
              <Key className="w-5 h-5" />
              API Keys
            </h3>
            <p className="text-sm text-[var(--color-ethereal)] mb-4">
              Your API keys are stored locally in your browser and never sent to any server except the AI provider's API.
            </p>
            
            <div className="space-y-4">
              {AI_PROVIDERS.map((provider) => {
                const testResult = testResults[provider.id];
                const isTesting = testingProvider === provider.id;
                const hasKey = localSettings.apiKeys[provider.id] && localSettings.apiKeys[provider.id]!.trim() !== '';
                
                return (
                  <div key={provider.id} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: provider.iconColor }}
                      />
                      {provider.displayName} API Key
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
                          value={localSettings.apiKeys[provider.id] || ''}
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
          </section>

          {/* System Prompt Section */}
          <section>
            <h3 className="text-lg font-semibold text-[var(--color-gold)] mb-3">
              🔮 System Prompt
            </h3>
            <p className="text-sm text-[var(--color-ethereal)] mb-4">
              Customize the AI's personality and behavior.
            </p>
            <textarea
              value={localSettings.systemPrompt}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, systemPrompt: e.target.value }))}
              rows={4}
              className="w-full input-mystical rounded-lg px-4 py-2.5 text-sm resize-none"
            />
            <button
              onClick={() => setLocalSettings(prev => ({ ...prev, systemPrompt: DEFAULT_SYSTEM_PROMPT }))}
              className="text-xs text-[var(--color-ethereal)] hover:text-[var(--color-gold)] mt-2"
            >
              Reset to default
            </button>
          </section>

          {/* Preferences Section */}
          <section>
            <h3 className="text-lg font-semibold text-[var(--color-gold)] mb-3">
              ⚙️ Preferences
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-amethyst)]">
                <div>
                  <span className="font-medium">Stream Responses</span>
                  <p className="text-xs text-[var(--color-ethereal)]">Show responses as they're generated</p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.streamResponses}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, streamResponses: e.target.checked }))}
                  className="w-5 h-5 accent-[var(--color-gold)]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-amethyst)]">
                <div>
                  <span className="font-medium">Save Chat History</span>
                  <p className="text-xs text-[var(--color-ethereal)]">Keep conversations in local storage</p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.saveHistory}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, saveHistory: e.target.checked }))}
                  className="w-5 h-5 accent-[var(--color-gold)]"
                />
              </label>

              <div className="p-3 rounded-lg bg-[var(--color-amethyst)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Max History Chats</span>
                  <span className="text-sm text-[var(--color-gold)]">{localSettings.maxHistoryChats}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={localSettings.maxHistoryChats}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, maxHistoryChats: parseInt(e.target.value) }))}
                  className="w-full accent-[var(--color-gold)]"
                />
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <h3 className="text-lg font-semibold text-[var(--color-ember)] mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </h3>
            
            {showClearConfirm ? (
              <div className="p-4 rounded-lg border border-[var(--color-ember)] bg-[var(--color-ember)]/10">
                <p className="text-sm mb-3">Are you sure you want to delete all chat history? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearHistory}
                    className="px-4 py-2 rounded-lg bg-[var(--color-ember)] text-white text-sm font-medium hover:bg-[var(--color-ember)]/80"
                  >
                    Yes, Delete All
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-4 py-2 rounded-lg bg-[var(--color-mystic)] text-sm font-medium hover:bg-[var(--color-amethyst)]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--color-ember)] text-[var(--color-ember)] hover:bg-[var(--color-ember)]/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Chat History
              </button>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--color-mystic)]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg hover:bg-[var(--color-mystic)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-alchemical px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
