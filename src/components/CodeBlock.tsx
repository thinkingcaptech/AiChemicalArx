import { useState } from 'react';
import { Code, Eye, Play, Copy, Check, Maximize2, X } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language: string;
  onCopy: () => void;
  copied: boolean;
}

// Languages that can be previewed
const PREVIEWABLE_LANGUAGES = ['html', 'svg', 'jsx', 'tsx', 'react'];

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, onCopy, copied }) => {
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const canPreview = PREVIEWABLE_LANGUAGES.some(l => 
    language.toLowerCase().includes(l)
  );

  const getPreviewContent = (): string => {
    const lang = language.toLowerCase();
    
    if (lang === 'svg' || code.trim().startsWith('<svg')) {
      // SVG - wrap in HTML
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh;
                background: #1a1625;
              }
              svg { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>${code}</body>
        </html>
      `;
    }
    
    if (lang === 'html' || code.trim().startsWith('<!DOCTYPE') || code.trim().startsWith('<html')) {
      // Full HTML document
      if (code.includes('<html') || code.includes('<!DOCTYPE')) {
        return code;
      }
      // HTML fragment - wrap it
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: system-ui, -apple-system, sans-serif;
                background: #1a1625;
                color: #e8e6f0;
              }
              * { box-sizing: border-box; }
            </style>
          </head>
          <body>${code}</body>
        </html>
      `;
    }
    
    if (lang === 'jsx' || lang === 'tsx' || lang === 'react') {
      // React/JSX - create a simple preview with basic styling
      // This is a simplified preview - complex React won't work
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: system-ui, -apple-system, sans-serif;
                background: #1a1625;
                color: #e8e6f0;
              }
              .preview-notice {
                padding: 16px;
                background: rgba(255,215,0,0.1);
                border: 1px solid rgba(255,215,0,0.3);
                border-radius: 8px;
                margin-bottom: 16px;
                font-size: 14px;
                color: #ffd700;
              }
              pre {
                background: #0d0a14;
                padding: 16px;
                border-radius: 8px;
                overflow-x: auto;
                font-size: 13px;
                color: #9ae6b4;
              }
            </style>
          </head>
          <body>
            <div class="preview-notice">
              ⚡ React/JSX Preview - This shows the code structure. For interactive preview, copy to a React environment.
            </div>
            <pre>${escapeHtml(code)}</pre>
          </body>
        </html>
      `;
    }
    
    return '';
  };

  const PreviewFrame = ({ fullscreen = false }: { fullscreen?: boolean }) => (
    <iframe
      srcDoc={getPreviewContent()}
      sandbox="allow-scripts"
      className={`w-full border-0 rounded-lg bg-[var(--color-void)] ${
        fullscreen ? 'h-full' : 'h-64 min-h-[256px]'
      }`}
      title="Code Preview"
    />
  );

  return (
    <div className="my-3 rounded-lg border border-[var(--color-mystic)] overflow-hidden bg-[var(--color-void)]">
      {/* Header with tabs */}
      <div className="flex items-center justify-between px-3 py-2 bg-[var(--color-obsidian)] border-b border-[var(--color-mystic)]">
        <div className="flex items-center gap-1">
          {/* Language badge */}
          <span className="text-xs font-mono text-[var(--color-ethereal)] bg-[var(--color-mystic)] px-2 py-0.5 rounded">
            {language || 'code'}
          </span>
          
          {/* Tabs */}
          {canPreview && (
            <div className="flex ml-3 bg-[var(--color-void)] rounded-lg p-0.5">
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'code'
                    ? 'bg-[var(--color-mystic)] text-[var(--color-gold)]'
                    : 'text-[var(--color-ethereal)] hover:text-[var(--color-spirit)]'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                Code
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'preview'
                    ? 'bg-[var(--color-mystic)] text-[var(--color-gold)]'
                    : 'text-[var(--color-ethereal)] hover:text-[var(--color-spirit)]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1">
          {canPreview && activeTab === 'preview' && (
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 rounded hover:bg-[var(--color-mystic)] transition-colors"
              title="Fullscreen preview"
            >
              <Maximize2 className="w-4 h-4 text-[var(--color-ethereal)]" />
            </button>
          )}
          <button
            onClick={onCopy}
            className="p-1.5 rounded hover:bg-[var(--color-mystic)] transition-colors"
            title="Copy code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-[var(--color-sage)]" />
            ) : (
              <Copy className="w-4 h-4 text-[var(--color-ethereal)]" />
            )}
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative">
        {activeTab === 'code' ? (
          <pre className="p-4 overflow-x-auto max-h-96">
            <code className="text-sm font-mono text-[var(--color-sage)]">{code}</code>
          </pre>
        ) : (
          <div className="p-2">
            <PreviewFrame />
          </div>
        )}
      </div>
      
      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-mystic)]">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-[var(--color-gold)]" />
              <span className="font-medium text-[var(--color-gold)]">Live Preview</span>
              <span className="text-xs text-[var(--color-ethereal)]">({language})</span>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 rounded-lg hover:bg-[var(--color-mystic)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 p-4">
            <PreviewFrame fullscreen />
          </div>
        </div>
      )}
    </div>
  );
};

// Helper to escape HTML for safe display
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
