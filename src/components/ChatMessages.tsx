import { useRef, useEffect, useState } from 'react';
import { Bot, User, AlertCircle, Copy, Check } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import type { Message } from '../types';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onQuickAction?: (prompt: string) => void;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading, onQuickAction }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<string | null>(null);

  const quickActions = [
    {
      icon: '✨',
      title: 'Creative Writing',
      description: 'Stories, poems, and more',
      prompt: 'Help me with creative writing. I\'d like to write a short story or poem. Can you suggest some themes or help me get started with a creative piece?'
    },
    {
      icon: '🔮',
      title: 'Code Assistance',
      description: 'Debug and create code',
      prompt: 'I need help with coding. Can you assist me with writing, debugging, or explaining code? What programming language or problem would you like to work on?'
    },
    {
      icon: '📚',
      title: 'Research Help',
      description: 'Learn and explore topics',
      prompt: 'I\'d like help researching a topic. Can you help me explore and understand a subject in depth? What topic would you like to learn about?'
    },
    {
      icon: '💡',
      title: 'Problem Solving',
      description: 'Analyze and strategize',
      prompt: 'I need help solving a problem. Can you help me analyze a situation and develop strategies or solutions? What challenge are you facing?'
    }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyCodeToClipboard = async (code: string, index: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const renderContent = (content: string, messageId: string) => {
    // Parse content into segments (text and code blocks)
    const segments: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
    
    let lastIndex = 0;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before this code block
      if (match.index > lastIndex) {
        segments.push({
          type: 'text',
          content: content.slice(lastIndex, match.index)
        });
      }
      
      // Add the code block
      segments.push({
        type: 'code',
        language: match[1] || 'text',
        content: match[2].trim()
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after last code block
    if (lastIndex < content.length) {
      segments.push({
        type: 'text',
        content: content.slice(lastIndex)
      });
    }
    
    return (
      <div className="prose-alchemical">
        {segments.map((segment, index) => {
          if (segment.type === 'code') {
            const codeId = `${messageId}-code-${index}`;
            return (
              <CodeBlock
                key={codeId}
                code={segment.content}
                language={segment.language || 'text'}
                onCopy={() => copyCodeToClipboard(segment.content, codeId)}
                copied={copiedCodeIndex === codeId}
              />
            );
          }
          
          // Render text content
          return <div key={index}>{renderTextContent(segment.content)}</div>;
        })}
      </div>
    );
  };

  const renderTextContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-xl font-bold text-[var(--color-gold)] my-2">
            {line.slice(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-lg font-semibold text-[var(--color-gold)] my-2">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-base font-semibold text-[var(--color-gold)] my-1">
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={index} className="ml-4 list-disc">
            {renderInlineFormatting(line.slice(2))}
          </li>
        );
      } else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={index} className="border-l-3 border-[var(--color-gold)] pl-4 my-2 italic text-[var(--color-ethereal)]">
            {renderInlineFormatting(line.slice(2))}
          </blockquote>
        );
      } else if (line.trim() === '') {
        elements.push(<br key={index} />);
      } else {
        elements.push(
          <p key={index} className="my-1">
            {renderInlineFormatting(line)}
          </p>
        );
      }
    });

    return elements;
  };

  const renderInlineFormatting = (text: string): React.ReactNode => {
    // Handle inline code
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="bg-[var(--color-obsidian)] px-1.5 py-0.5 rounded text-sm font-mono text-[var(--color-sage)]">
            {part.slice(1, -1)}
          </code>
        );
      }
      // Handle bold
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bp, j) => {
        if (bp.startsWith('**') && bp.endsWith('**')) {
          return <strong key={`${i}-${j}`}>{bp.slice(2, -2)}</strong>;
        }
        return bp;
      });
    });
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-elixir)] flex items-center justify-center glow-gold animate-float">
            <Bot className="w-10 h-10 text-[var(--color-void)]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-gold)] mb-2">
            Welcome to Arx AI
          </h2>
          <p className="text-[var(--color-ethereal)] mb-4">
            Your premium multi-provider AI assistant. Start a conversation by asking a question below.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => onQuickAction?.(action.prompt)}
                className="card-mystical p-3 text-left hover:glow-arcane transition-all cursor-pointer"
              >
                <p className="text-[var(--color-gold)] font-medium">{action.icon} {action.title}</p>
                <p className="text-[var(--color-ethereal)] text-xs">{action.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {message.role === 'assistant' && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-elixir)] flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-[var(--color-void)]" />
            </div>
          )}
          
          <div
            className={`
              max-w-[80%] rounded-2xl px-4 py-3 relative group
              ${message.role === 'user' ? 'message-user' : 'message-assistant'}
              ${message.isStreaming ? 'animate-pulse-glow' : ''}
            `}
          >
            {message.error ? (
              <div className="flex items-center gap-2 text-[var(--color-ember)]">
                <AlertCircle className="w-5 h-5" />
                <span>{message.error}</span>
              </div>
            ) : (
              <>
                {renderContent(message.content, message.id)}
                {message.isStreaming && (
                  <span className="inline-block w-2 h-4 bg-[var(--color-gold)] ml-1 animate-pulse" />
                )}
              </>
            )}
            
            {!message.isStreaming && message.content && (
              <button
                onClick={() => copyToClipboard(message.content, message.id)}
                className="absolute -bottom-8 right-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-[var(--color-obsidian)] border border-[var(--color-mystic)] transition-all hover:glow-arcane"
              >
                {copiedId === message.id ? (
                  <Check className="w-4 h-4 text-[var(--color-sage)]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {message.role === 'user' && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-arcane)] to-[var(--color-elixir)] flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-[var(--color-spirit)]" />
            </div>
          )}
        </div>
      ))}
      
      {isLoading && messages[messages.length - 1]?.role === 'user' && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-elixir)] flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-[var(--color-void)]" />
          </div>
          <div className="message-assistant rounded-2xl px-4 py-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-[var(--color-gold)] animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-[var(--color-gold)] animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-[var(--color-gold)] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};
