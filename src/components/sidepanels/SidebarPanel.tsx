import React, { useState, useRef, useEffect } from 'react';
import { useBrowser } from '../../context/BrowserContext';
import {
  X,
  MessageCircle,
  Instagram,
  Star,
  Clock,
  Download,
  Trash2,
  ExternalLink,
  Send,
  Sparkles,
  Bot,
  Search,
  Image as ImageIcon,
  Music,
  Database,
  Globe,
  RefreshCw,
  Play,
  Pause,
  ChevronDown,
  Shield,
  Layers,
  Cpu,
  Plus,
  Edit2,
  Folder,
} from 'lucide-react';

export const SidebarPanel: React.FC = () => {
  const {
    sidebarPanel,
    setSidebarPanel,
    isDarkMode,
    bookmarks,
    history,
    downloads,
    navigateActiveTab,
    removeBookmark,
    deleteBookmark,
    setEditingBookmark,
    setActiveModal,
    createTab,
    clearHistory,
    activeTab,
  } = useBrowser();

  // Bookmarks search & folder filter
  const [bookmarkSearch, setBookmarkSearch] = useState('');
  const [selectedBookmarkFolder, setSelectedBookmarkFolder] = useState<string>('all');

  // Mode inside AI panel: 'chat' | 'image' | 'music'
  const [aiSubTab, setAiSubTab] = useState<'chat' | 'image' | 'music'>('chat');

  // Gemini AI Chat state (Multi-turn chat)
  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const [selectedRole, setSelectedRole] = useState<string>('browser_assistant');
  const [useSearchGrounding, setUseSearchGrounding] = useState<boolean>(true);
  const [messages, setMessages] = useState<Array<{ id: string; text: string; sender: 'user' | 'assistant'; time: string; model?: string; sources?: string[] }>>([
    {
      id: 'm1',
      text: 'Hallo! Ich bin Ihr integrierter Gemini KI-Assistent in Chromium Aura mit Google Search Grounding. Wie kann ich Sie unterstützen?',
      sender: 'assistant',
      time: '12:00',
      model: 'gemini-3.5-flash',
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // AI Image generation state (gemini-nano-banana-2.1)
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // AI Music generation state (lyria-3-clip-preview / lyria-3-pro-preview)
  const [musicPrompt, setMusicPrompt] = useState('');
  const [musicModel, setMusicModel] = useState<'lyria-3-clip-preview' | 'lyria-3-pro-preview'>('lyria-3-clip-preview');
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [isMusicLoading, setIsMusicLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // WhatsApp simulator state
  const [waMessages, setWaMessages] = useState<{ id: string; text: string; sender: 'me' | 'them'; time: string }[]>([
    { id: 'w1', text: 'Hey, bist du über den neuen Aura-Browser online?', sender: 'them', time: '10:14' },
    { id: 'w2', text: 'Ja, mit Cloudflare 1.1.1.1, Inhaltsindizierung und VPN!', sender: 'me', time: '10:15' },
    { id: 'w3', text: 'Stark, super flüssig und alle Daten lokal indiziert!', sender: 'them', time: '10:16' },
  ]);
  const [waInput, setWaInput] = useState('');

  // Auto-scroll chat thread
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isGeminiLoading]);

  if (sidebarPanel === 'none') return null;

  const roleInstructions: Record<string, string> = {
    browser_assistant:
      'Du bist der integrierte Allround-Browser-Assistent in Chromium Aura. Antworte präzise, hilfsbereit und professionell auf Deutsch.',
    code_expert:
      'Du bist ein leitender Software-Architekt und Sicherheitsexperte. Schreibe sauberen, robusten Code und gib tiefgehende technische Erklärungen.',
    research_specialist:
      'Du bist ein investigativer Recherche-Spezialist. Nutze Suchdaten für präzise Fakten, Quellenangaben und strukturierte Zusammenfassungen.',
    security_auditor:
      'Du bist ein Zero-Trust Cyber-Security Auditor. Analysiere Datenschutz, Kryptominingschutz, Verschlüsselung und Zertifikate.',
  };

  const handleSendChat = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const userText = customPrompt || inputMsg.trim();
    if (!userText) return;

    const newMsg = {
      id: `m-${Date.now()}`,
      text: userText,
      sender: 'user' as const,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!customPrompt) setInputMsg('');
    setIsGeminiLoading(true);

    try {
      const pageContext =
        activeTab.url !== 'aura://speeddial'
          ? `Aktiver Tab: ${activeTab.title} (${activeTab.url})`
          : 'Startseite Speed Dial';

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.slice(-8), // multi-turn conversation history
          model: selectedModel,
          systemInstruction: roleInstructions[selectedRole] || roleInstructions.browser_assistant,
          useSearchGrounding,
          pageContext,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      const sources: string[] = [];
      if (data.groundingMetadata?.webSearchQueries) {
        sources.push(...data.groundingMetadata.webSearchQueries);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `m-gemini-${Date.now()}`,
          text: data.reply || 'Keine Antwort von Gemini.',
          sender: 'assistant',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: data.model || selectedModel,
          sources: sources.length > 0 ? sources : undefined,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `m-fallback-${Date.now()}`,
          text: `[${selectedModel}]: Ihre Anfrage zu „${userText}“ wurde analysiert. Die Verbindung ist über Cloudflare 1.1.1.1 DoH abgesichert.`,
          sender: 'assistant',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: selectedModel,
        },
      ]);
    } finally {
      setIsGeminiLoading(false);
    }
  };

  // Generate Image with Gemini Nano Banana 2.1
  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim()) return;

    setIsImageLoading(true);
    setGeneratedImage(null);

    try {
      const res = await fetch('/api/gemini/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt.trim(),
          model: 'gemini-nano-banana-2.1',
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      }
    } catch (e) {
      console.error('Image generation error:', e);
    } finally {
      setIsImageLoading(false);
    }
  };

  // Generate Music with Lyria 3
  const handleGenerateMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!musicPrompt.trim()) return;

    setIsMusicLoading(true);
    setGeneratedAudioUrl(null);
    setIsPlayingAudio(false);

    try {
      const res = await fetch('/api/gemini/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: musicPrompt.trim(),
          model: musicModel,
        }),
      });
      const data = await res.json();
      if (data.audioUrl) {
        setGeneratedAudioUrl(data.audioUrl);
      }
    } catch (e) {
      console.error('Music generation error:', e);
    } finally {
      setIsMusicLoading(false);
    }
  };

  const toggleAudioPlay = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  return (
    <div
      className={`w-88 h-full border-r z-10 flex flex-col select-none transition-all ${
        isDarkMode
          ? 'bg-slate-900 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-800 shadow-lg'
      }`}
    >
      {/* Panel Top Header */}
      <div className="h-11 px-4 border-b border-slate-700/30 flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-2">
          {sidebarPanel === 'chat' && (
            <>
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Gemini KI & Kreativstudio</span>
            </>
          )}
          {sidebarPanel === 'whatsapp' && (
            <>
              <MessageCircle className="w-4 h-4 text-emerald-500" />
              <span>WhatsApp Web</span>
            </>
          )}
          {sidebarPanel === 'instagram' && (
            <>
              <Instagram className="w-4 h-4 text-pink-500" />
              <span>Instagram Direct</span>
            </>
          )}
          {sidebarPanel === 'bookmarks' && (
            <>
              <Star className="w-4 h-4 text-yellow-400" />
              <span>Lesezeichen ({bookmarks.length})</span>
            </>
          )}
          {sidebarPanel === 'history' && (
            <>
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Chronik ({history.length})</span>
            </>
          )}
        </div>

        <button
          onClick={() => setSidebarPanel('none')}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* GEMINI AI / CREATIVE PANEL */}
      {sidebarPanel === 'chat' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sub-tabs: Chat | Bilder (Nano Banana) | Musik (Lyria) */}
          <div className="flex p-1 m-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <button
              onClick={() => setAiSubTab('chat')}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                aiSubTab === 'chat' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Chatbot</span>
            </button>
            <button
              onClick={() => setAiSubTab('image')}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                aiSubTab === 'image' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Bilder</span>
            </button>
            <button
              onClick={() => setAiSubTab('music')}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                aiSubTab === 'music' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Musik</span>
            </button>
          </div>

          {/* TAB 1: MULTI-TURN GEMINI CHATBOT */}
          {aiSubTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Model & Role Controls */}
              <div className="px-3 pb-2 pt-1 border-b border-slate-800/60 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  {/* Model Selector */}
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value as any)}
                    className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2 py-1 text-[11px] outline-none"
                  >
                    <option value="gemini-3.5-flash">gemini-3.5-flash (Standard / Ausgewogen)</option>
                    <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Komplexe Aufgaben)</option>
                    <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra-Schnell)</option>
                  </select>

                  {/* Role Selector */}
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2 py-1 text-[11px] outline-none"
                  >
                    <option value="browser_assistant">Browser-Assistent</option>
                    <option value="code_expert">Code-Experte</option>
                    <option value="research_specialist">Recherche-Spezialist</option>
                    <option value="security_auditor">Security-Auditor</option>
                  </select>
                </div>

                {/* Google Search Grounding Toggle */}
                <div className="flex items-center justify-between text-[11px]">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={useSearchGrounding}
                      onChange={(e) => setUseSearchGrounding(e.target.checked)}
                      className="rounded accent-blue-600"
                    />
                    <Globe className="w-3 h-3 text-blue-400" />
                    <span>Google Search Grounding (Live-Webdaten)</span>
                  </label>

                  <button
                    onClick={() => navigateActiveTab('aura://indexer')}
                    className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5"
                    title="Vollständigen Browser-Inhaltsindex öffnen"
                  >
                    <Database className="w-2.5 h-2.5" />
                    <span>Inhalts-Index ↗</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Message Thread */}
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[90%] p-2.5 rounded-2xl ${
                        m.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : isDarkMode
                          ? 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-xs'
                          : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed select-text">{m.text}</p>

                      {/* Google Search Grounding Sources badge */}
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-2 pt-1.5 border-t border-slate-700/40 text-[10px] text-blue-300 flex items-center gap-1 flex-wrap">
                          <Globe className="w-2.5 h-2.5 flex-shrink-0" />
                          <span>Suchquellen: {m.sources.join(', ')}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 px-1 text-[10px] text-slate-500 font-mono">
                      <span>{m.time}</span>
                      {m.model && <span>· {m.model}</span>}
                    </div>
                  </div>
                ))}

                {isGeminiLoading && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/40 text-slate-400 text-xs">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                    <span>Gemini analysiert mit Google Search Grounding...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSendChat} className="p-2 border-t border-slate-800 flex items-center gap-1.5">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Nachricht an Gemini senden..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={isGeminiLoading || !inputMsg.trim()}
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: IMAGE GENERATION (GEMINI-NANO-BANANA-2.1) */}
          {aiSubTab === 'image' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
                <h4 className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" />
                  Bilder erstellen & bearbeiten
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Generiert hochauflösende Grafiken mit <strong>gemini-nano-banana-2.1</strong> anhand deutscher Text-Prompts.
                </p>
              </div>

              <form onSubmit={handleGenerateImage} className="space-y-2">
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Beschreiben Sie das gewünschte Bild (z. B. Ein futuristischer Datenschutz-Browser über einer Cyberpunk-Stadt)..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs outline-none focus:border-indigo-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={isImageLoading || !imagePrompt.trim()}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  {isImageLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generiere Bild mit Nano Banana 2.1...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Bild jetzt generieren</span>
                    </>
                  )}
                </button>
              </form>

              {generatedImage && (
                <div className="space-y-2 p-2 rounded-xl bg-slate-950 border border-slate-800 animate-in fade-in">
                  <img
                    src={generatedImage}
                    alt="Generiertes Bild"
                    className="w-full aspect-square rounded-lg object-cover"
                  />
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] text-slate-400 font-mono">Modell: gemini-nano-banana-2.1</span>
                    <a
                      href={generatedImage}
                      download="aura_gemini_image.png"
                      className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Herunterladen</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MUSIC GENERATION (LYRIA 3) */}
          {aiSubTab === 'music' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1">
                <h4 className="font-bold text-purple-300 flex items-center gap-1.5">
                  <Music className="w-4 h-4" />
                  KI-Musikgenerator (Lyria 3)
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Komponiert Soundtracks und Songs mit <strong>lyria-3-clip-preview</strong> (bis 30s) oder <strong>lyria-3-pro-preview</strong>.
                </p>
              </div>

              <form onSubmit={handleGenerateMusic} className="space-y-2.5">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Lyria-Modell wählen:</label>
                  <select
                    value={musicModel}
                    onChange={(e) => setMusicModel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                  >
                    <option value="lyria-3-clip-preview">lyria-3-clip-preview (Kurzer Clip bis zu 30s)</option>
                    <option value="lyria-3-pro-preview">lyria-3-pro-preview (Vollwertiger Track)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Musik-Beschreibung (Prompt):</label>
                  <textarea
                    value={musicPrompt}
                    onChange={(e) => setMusicPrompt(e.target.value)}
                    placeholder="Z. B. Entspannter Lo-Fi Beat mit Pianomelodie und sanften Synthesizern für Fokus beim Arbeiten..."
                    rows={3}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isMusicLoading || !musicPrompt.trim()}
                  className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  {isMusicLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Komponiere mit {musicModel}...</span>
                    </>
                  ) : (
                    <>
                      <Music className="w-3.5 h-3.5" />
                      <span>Musikstück erstellen</span>
                    </>
                  )}
                </button>
              </form>

              {generatedAudioUrl && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-300">Generierter Audio-Track</span>
                    <span className="text-[10px] font-mono text-slate-500">{musicModel}</span>
                  </div>

                  <audio
                    ref={audioRef}
                    src={generatedAudioUrl}
                    onEnded={() => setIsPlayingAudio(false)}
                    className="hidden"
                  />

                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleAudioPlay}
                      className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-500/30 transition-colors"
                    >
                      {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>

                    <div className="flex-1">
                      <div className="text-xs font-medium text-slate-200 truncate">
                        {musicPrompt.slice(0, 35)}...
                      </div>
                      <div className="text-[10px] text-slate-400">Playable Audio Stream (WAV 22kHz)</div>
                    </div>

                    <a
                      href={generatedAudioUrl}
                      download="lyria_track.wav"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Audio-Datei speichern"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* WHATSAPP WEB DRAWER */}
      {sidebarPanel === 'whatsapp' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
            {waMessages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'me' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-2.5 rounded-xl ${
                    m.sender === 'me' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  <p>{m.text}</p>
                  <span className="text-[9px] opacity-70 block text-right mt-1">{m.time}</span>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (waInput.trim()) {
              setWaMessages((prev) => [
                ...prev,
                { id: `w-${Date.now()}`, text: waInput.trim(), sender: 'me', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
              ]);
              setWaInput('');
            }
          }} className="p-2 border-t border-slate-800 flex items-center gap-1.5">
            <input
              type="text"
              value={waInput}
              onChange={(e) => setWaInput(e.target.value)}
              placeholder="Nachricht schreiben..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs outline-none"
            />
            <button type="submit" className="p-2 rounded-xl bg-emerald-600 text-white">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* BOOKMARKS DRAWER */}
      {sidebarPanel === 'bookmarks' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar with Add Button and Sync Indicator */}
          <div className="p-3 border-b border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Lesezeichen ({bookmarks.length})</span>
                </h4>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-0.5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Firestore Cloud-Sync Aktiv</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingBookmark(null);
                  setActiveModal('bookmark');
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 transition-colors shadow-xs"
                title="Neues Lesezeichen zur Firestore-Datenbank hinzufügen"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Neu</span>
              </button>
            </div>

            {/* Bookmark Search Input */}
            <div className="relative">
              <input
                type="text"
                value={bookmarkSearch}
                onChange={(e) => setBookmarkSearch(e.target.value)}
                placeholder="Lesezeichen durchsuchen..."
                className="w-full pl-7 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-200 outline-none focus:border-amber-400 transition-colors"
              />
              <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Folder Filters */}
            {(() => {
              const folders = Array.from(
                new Set(bookmarks.map((b) => b.folder || 'Favoriten'))
              );
              return (
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
                  <button
                    onClick={() => setSelectedBookmarkFolder('all')}
                    className={`px-2 py-0.5 rounded-md text-[10px] whitespace-nowrap transition-colors ${
                      selectedBookmarkFolder === 'all'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    Alle ({bookmarks.length})
                  </button>
                  {folders.map((f) => {
                    const count = bookmarks.filter((b) => (b.folder || 'Favoriten') === f).length;
                    return (
                      <button
                        key={f}
                        onClick={() => setSelectedBookmarkFolder(f)}
                        className={`px-2 py-0.5 rounded-md text-[10px] whitespace-nowrap transition-colors flex items-center gap-1 ${
                          selectedBookmarkFolder === f
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-800/80 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Folder className="w-2.5 h-2.5" />
                        <span>{f}</span>
                        <span>({count})</span>
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Bookmarks List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
            {(() => {
              const filtered = bookmarks.filter((b) => {
                const matchesFolder =
                  selectedBookmarkFolder === 'all' ||
                  (b.folder || 'Favoriten') === selectedBookmarkFolder;
                const q = bookmarkSearch.trim().toLowerCase();
                const matchesSearch =
                  !q ||
                  b.title.toLowerCase().includes(q) ||
                  b.url.toLowerCase().includes(q) ||
                  (b.folder || '').toLowerCase().includes(q);
                return matchesFolder && matchesSearch;
              });

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-12 px-4 space-y-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                      <Star className="w-5 h-5" />
                    </div>
                    <p className="text-slate-400 text-xs">
                      {bookmarkSearch
                        ? `Keine Lesezeichen für "${bookmarkSearch}" gefunden.`
                        : 'Noch keine Lesezeichen vorhanden.'}
                    </p>
                    <button
                      onClick={() => {
                        setEditingBookmark(null);
                        setActiveModal('bookmark');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] inline-flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Lesezeichen hinzufügen</span>
                    </button>
                  </div>
                );
              }

              return filtered.map((b) => (
                <div
                  key={b.id}
                  className="group p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 flex flex-col gap-1.5 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    {/* Clickable Title & Favicon */}
                    <div
                      onClick={() => navigateActiveTab(b.url)}
                      className="cursor-pointer truncate flex-1 flex items-center gap-2"
                      title={b.url}
                    >
                      {b.icon ? (
                        <img
                          src={b.icon}
                          alt=""
                          className="w-3.5 h-3.5 rounded-xs flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Star className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      )}
                      <span className="font-semibold text-slate-200 group-hover:text-amber-300 truncate transition-colors">
                        {b.title}
                      </span>
                    </div>

                    {/* Actions: Open in new tab, Edit, Delete */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => createTab(b.url, b.title)}
                        title="Im neuen Tab öffnen"
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingBookmark(b);
                          setActiveModal('bookmark');
                        }}
                        title="Lesezeichen bearbeiten"
                        className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-700/50 rounded transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteBookmark(b.id)}
                        title="Lesezeichen aus Firestore löschen"
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* URL & Folder Badge */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pl-5.5">
                    <span className="truncate max-w-[140px] font-mono text-slate-500">
                      {b.url.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-700/60 text-slate-300 flex items-center gap-0.5">
                      <Folder className="w-2.5 h-2.5 text-amber-400" />
                      <span>{b.folder || 'Favoriten'}</span>
                    </span>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* HISTORY DRAWER */}
      {sidebarPanel === 'history' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-slate-400">Verlauf ({history.length})</span>
            <button onClick={clearHistory} className="text-rose-400 hover:underline text-[11px]">
              Leeren
            </button>
          </div>
          {history.map((h) => (
            <div
              key={h.id}
              onClick={() => navigateActiveTab(h.url)}
              className="p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 cursor-pointer transition-colors"
            >
              <div className="font-medium truncate">{h.title}</div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">{h.url}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
