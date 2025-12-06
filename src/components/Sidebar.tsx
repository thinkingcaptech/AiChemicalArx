import React from 'react';
import { 
  MessageSquarePlus, 
  Settings, 
  Trash2, 
  ChevronLeft,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import type { Chat } from '../types';

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  currentChatId,
  isOpen,
  onToggle,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onOpenSettings,
}) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const groupedChats = chats.reduce((groups, chat) => {
    const dateKey = formatDate(chat.updatedAt);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(chat);
    return groups;
  }, {} as Record<string, Chat[]>);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-72 sidebar-mystical flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--color-mystic)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[var(--color-gold)] animate-pulse-glow" />
              <h1 className="text-lg font-bold text-[var(--color-gold)]">Arx AI</h1>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-[var(--color-mystic)] transition-colors lg:hidden"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={onNewChat}
            className="w-full btn-alchemical py-2.5 px-4 rounded-lg flex items-center justify-center gap-2"
          >
            <MessageSquarePlus className="w-5 h-5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2">
          {Object.entries(groupedChats).map(([dateKey, groupChats]) => (
            <div key={dateKey} className="mb-4">
              <h3 className="text-xs font-medium text-[var(--color-ethereal)] px-2 py-1 uppercase tracking-wider">
                {dateKey}
              </h3>
              {groupChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`
                    group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer
                    transition-all duration-200 mb-1
                    ${currentChatId === chat.id 
                      ? 'bg-[var(--color-mystic)] glow-arcane' 
                      : 'hover:bg-[var(--color-amethyst)]'}
                  `}
                  onClick={() => onSelectChat(chat.id)}
                >
                  <MessageCircle className="w-4 h-4 flex-shrink-0 text-[var(--color-ethereal)]" />
                  <span className="flex-1 truncate text-sm">{chat.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--color-obsidian)] transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-[var(--color-ember)]" />
                  </button>
                </div>
              ))}
            </div>
          ))}

          {chats.length === 0 && (
            <div className="text-center text-[var(--color-ethereal)] py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs opacity-75">Start a new conversation</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-mystic)]">
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-[var(--color-amethyst)] transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
};
