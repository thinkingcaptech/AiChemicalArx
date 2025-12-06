# ⚗️ AiChemy Arx

A mystical **BYOK (Bring Your Own Key)** AI chat interface built as a Progressive Web App. Connect to OpenAI, Anthropic Claude, and xAI Grok with your own API keys.

## ✨ Features

- 🔑 **BYOK Architecture** - Your API keys stay local, never sent to any server except the AI provider
- 🤖 **Multiple AI Providers** - Support for OpenAI (GPT-4o, GPT-4), Anthropic (Claude), and xAI (Grok)
- 💬 **Streaming Responses** - Real-time response streaming for a smooth chat experience
- 📱 **PWA Support** - Install as a standalone app on desktop or mobile
- 🌙 **Alchemical Theme** - Beautiful dark mystical design with gold accents
- 💾 **Local Storage** - Chat history saved locally in your browser
- 📋 **Markdown Support** - Rich text formatting with code highlighting
- 🔄 **Model Switching** - Easy switching between different AI models
- ⚙️ **Customizable** - Adjustable system prompt and preferences

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API key from at least one provider:
  - [OpenAI API Key](https://platform.openai.com/api-keys)
  - [Anthropic API Key](https://console.anthropic.com/)
  - [xAI API Key](https://x.ai/)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/aichemy-arx.git
cd aichemy-arx
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

5. Click the Settings ⚙️ button and add your API key(s)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder, ready to deploy to any static hosting service.

## 🎨 Theme Colors

The app uses an alchemical color palette:

| Color | Hex | Usage |
|-------|-----|-------|
| Void | `#0d0a14` | Deep background |
| Obsidian | `#1a1625` | Primary background |
| Amethyst | `#2d2640` | Secondary background |
| Mystic | `#3d3557` | Borders, hover states |
| Ethereal | `#9d8dc7` | Secondary text |
| Gold | `#d4af37` | Accent, highlights |
| Elixir | `#7b68ee` | Primary accent |
| Spirit | `#e8e4f0` | Primary text |

## 🔧 Configuration

### System Prompt

Customize the AI's behavior through the Settings modal. The default prompt gives the AI an "Alchemical Assistant" personality.

### Preferences

- **Stream Responses** - Toggle real-time streaming
- **Save History** - Enable/disable chat persistence
- **Max History** - Control how many chats are stored

## 📁 Project Structure

```
src/
├── components/       # React components
│   ├── ChatInput.tsx
│   ├── ChatMessages.tsx
│   ├── SettingsModal.tsx
│   └── Sidebar.tsx
├── config/
│   └── providers.ts  # AI provider configurations
├── hooks/
│   └── useChat.ts    # Main chat logic hook
├── services/
│   ├── aiService.ts  # AI API communication
│   └── storageService.ts # Local storage management
├── types/
│   └── index.ts      # TypeScript type definitions
├── App.tsx           # Main application component
├── index.css         # Global styles & theme
└── main.tsx          # Application entry point
```

## 🔒 Privacy & Security

- **Local-First**: All API keys and chat history are stored in your browser's localStorage
- **Direct Communication**: API calls go directly from your browser to the AI provider
- **No Server**: This is a static PWA with no backend server
- **Open Source**: Full transparency - inspect the code yourself

## 🛠️ Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **vite-plugin-pwa** - PWA support

## 📜 License

MIT License - feel free to use, modify, and distribute!

---

**✨ Transmute your ideas into reality with AiChemy Arx ✨**
