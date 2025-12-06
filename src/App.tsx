import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ChatMessages } from './components/ChatMessages';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { WelcomeModal } from './components/WelcomeModal';
import { useChat } from './hooks/useChat';
import { generateImage } from './services/imageGenService';
import type { APIKeys } from './types';

const WELCOME_SHOWN_KEY = 'aichemyarx_welcome_shown';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const {
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
  } = useChat();

  // Show welcome modal on first visit or if no API keys are set
  useEffect(() => {
    const welcomeShown = localStorage.getItem(WELCOME_SHOWN_KEY);
    const hasAnyKey = Object.values(settings.apiKeys).some(key => key && key.trim() !== '');
    
    if (!welcomeShown || !hasAnyKey) {
      setWelcomeOpen(true);
    }
  }, []);

  const handleWelcomeClose = () => {
    localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
    setWelcomeOpen(false);
  };

  const handleWelcomeSaveKeys = (keys: APIKeys) => {
    updateSettings({ apiKeys: keys });
    localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
  };

  const currentProvider = currentChat?.provider || settings.defaultProvider;
  const currentModel = currentChat?.model || settings.defaultModel;
  const hasApiKey = Boolean(settings.apiKeys[currentProvider]);

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (error) {
      // Error is handled in the hook
      console.error(error);
    }
  };

  const handleGenerateImage = async (prompt: string) => {
    console.log('🎨 handleGenerateImage called with prompt:', prompt);
    console.log('📋 Current chat:', currentChat?.id);
    console.log('🔧 Current provider:', currentProvider, 'model:', currentModel);
    
    // Start a new chat if needed
    if (!currentChat) {
      console.log('📝 No current chat, starting new one...');
      startNewChat();
    }
    
    setIsGeneratingImage(true);
    try {
      const apiKey = settings.apiKeys[currentProvider];
      if (!apiKey || apiKey.trim() === '') {
        alert('API key not configured for this provider');
        setIsGeneratingImage(false);
        return;
      }

      console.log(`🎨 Generating image with ${currentProvider} (${currentModel})`);
      console.log(`📝 Prompt: "${prompt}"`);
      console.log(`🔑 API key configured: ${apiKey.substring(0, 10)}...`);
      
      const results = await generateImage(currentProvider, currentModel, apiKey, {
        prompt: prompt,
        n: 1,
      });

      if (results.length > 0) {
        console.log(`✅ Image generated successfully: ${results[0].imageUrl.substring(0, 100)}...`);
        // Create a message with the generated image
        const imageMessage = `Generated image for: "${prompt}"\n\n![Generated Image](${results[0].imageUrl})`;
        await sendMessage(imageMessage);
      } else {
        throw new Error('No image URL returned from generation service');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate image';
      console.error('❌ Image generation error:', error);
      
      // Provide helpful error messages
      let userMessage = message;
      if (message.includes('Failed to fetch') || message.includes('Network error')) {
        userMessage = `Network error - please check:\n\n• Your internet connection\n• API key is valid\n• ${currentProvider === 'openai' ? 'OpenAI API' : currentProvider === 'grok' ? 'xAI API' : 'Google API'} is accessible`;
      }
      
      alert(`⚠️ Image generation failed:\n\n${userMessage}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="h-full flex alchemical-bg">
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        currentChatId={currentChat?.id || null}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={() => {
          startNewChat();
          setSidebarOpen(false);
        }}
        onSelectChat={(id) => {
          selectChat(id);
          setSidebarOpen(false);
        }}
        onDeleteChat={deleteChat}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 p-4 border-b border-[var(--color-mystic)] bg-[var(--color-obsidian)]/50 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-[var(--color-mystic)] transition-colors"
            title="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold truncate">
              {currentChat?.title || 'New Chat'}
            </h2>
            {currentChat && (
              <p className="text-xs text-[var(--color-ethereal)]">
                {currentChat.messages.length} message{currentChat.messages.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </header>

        {/* Messages */}
        <ChatMessages
          messages={currentChat?.messages || []}
          isLoading={isLoading}
          onQuickAction={handleSendMessage}
        />

        {/* Input */}
        <ChatInput
          onSend={handleSendMessage}
          onCancel={cancelGeneration}
          isLoading={isLoading}
          provider={currentProvider}
          model={currentModel}
          onProviderChange={changeProvider}
          hasApiKey={hasApiKey}
          apiKeys={settings.apiKeys}
          onOpenSettings={() => setSettingsOpen(true)}
          onGenerateImage={handleGenerateImage}
          isGeneratingImage={isGeneratingImage}
        />
      </main>

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={welcomeOpen}
        onClose={handleWelcomeClose}
        apiKeys={settings.apiKeys}
        onSaveKeys={handleWelcomeSaveKeys}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={updateSettings}
        onClearHistory={clearHistory}
      />
    </div>
  );
}

export default App;
