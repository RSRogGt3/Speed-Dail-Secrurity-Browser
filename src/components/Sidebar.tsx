import React from 'react';
import { useBrowser } from '../context/BrowserContext';
import {
  LayoutGrid,
  Star,
  MessageCircle,
  MessageSquare,
  Instagram,
  Music,
  Clock,
  Settings,
  MoreHorizontal,
  Moon,
  Sun,
  ShieldAlert,
  Sparkles,
  Laptop,
  Database,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    isDarkMode,
    toggleTheme,
    navigateActiveTab,
    activeTab,
    sidebarPanel,
    setSidebarPanel,
    setActiveModal,
  } = useBrowser();

  const handlePanelToggle = (
    panel: 'chat' | 'whatsapp' | 'instagram' | 'bookmarks' | 'history' | 'downloads' | 'settings'
  ) => {
    if (sidebarPanel === panel) {
      setSidebarPanel('none');
    } else {
      setSidebarPanel(panel);
    }
  };

  return (
    <div
      className={`w-12 flex flex-col items-center py-2 select-none border-r z-20 transition-colors ${
        isDarkMode
          ? 'bg-slate-950 border-slate-800 text-slate-400'
          : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}
    >
      {/* Top Group: Speed Dial / Home & Bookmarks & Index */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => {
            navigateActiveTab('aura://speeddial');
            setSidebarPanel('none');
          }}
          title="Speed Dial Startseite"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            activeTab.url === 'aura://speeddial' && sidebarPanel === 'none'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : isDarkMode
              ? 'hover:bg-slate-800 hover:text-white'
              : 'hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            navigateActiveTab('aura://indexer');
            setSidebarPanel('none');
          }}
          title="Browser-Inhalts-Index (Volltextsuche)"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            activeTab.url === 'aura://indexer' && sidebarPanel === 'none'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : isDarkMode
              ? 'hover:bg-slate-800 text-cyan-400 hover:text-white'
              : 'hover:bg-slate-200 text-cyan-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
        </button>

        <button
          onClick={() => handlePanelToggle('bookmarks')}
          title="Lesezeichen"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            sidebarPanel === 'bookmarks'
              ? 'bg-blue-600 text-white'
              : isDarkMode
              ? 'hover:bg-slate-800 hover:text-white'
              : 'hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <Star className="w-4 h-4" />
        </button>
      </div>

      {/* Separator */}
      <div className="w-5 h-px bg-slate-700/40 my-3"></div>

      {/* Messengers and Sidebar Apps (matching screenshot) */}
      <div className="flex flex-col items-center gap-2 flex-1">
        {/* Google Gemini 3.8 Flash AI */}
        <button
          onClick={() => handlePanelToggle('chat')}
          title="Google Gemini 3.8 Flash KI-Assistent"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            sidebarPanel === 'chat'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
              : 'text-blue-400 hover:bg-blue-500/10'
          }`}
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Windows Setup.exe Certified */}
        <button
          onClick={() => setActiveModal('windowsSetup')}
          title="Windows Setup.exe (Zertifiziert & Authenticode SHA-256)"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-cyan-400 hover:bg-cyan-500/10 transition-all"
        >
          <Laptop className="w-4 h-4" />
        </button>

        {/* WhatsApp */}
        <button
          onClick={() => handlePanelToggle('whatsapp')}
          title="WhatsApp Web"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            sidebarPanel === 'whatsapp'
              ? 'bg-emerald-600 text-white'
              : 'text-emerald-500 hover:bg-emerald-500/10'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
        </button>

        {/* Instagram */}
        <button
          onClick={() => handlePanelToggle('instagram')}
          title="Instagram Direct"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            sidebarPanel === 'instagram'
              ? 'bg-pink-600 text-white'
              : 'text-pink-500 hover:bg-pink-500/10'
          }`}
        >
          <Instagram className="w-4 h-4" />
        </button>

        {/* Player / Music */}
        <button
          onClick={() => {
            navigateActiveTab('https://soundcloud.com');
            setSidebarPanel('none');
          }}
          title="Audio Player & SoundCloud"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            isDarkMode ? 'hover:bg-slate-800 hover:text-amber-400' : 'hover:bg-slate-200 hover:text-amber-600'
          }`}
        >
          <Music className="w-4 h-4" />
        </button>

        {/* History */}
        <button
          onClick={() => handlePanelToggle('history')}
          title="Verlauf"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            sidebarPanel === 'history'
              ? 'bg-blue-600 text-white'
              : isDarkMode
              ? 'hover:bg-slate-800 hover:text-white'
              : 'hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Group: Theme Toggle & Settings */}
      <div className="flex flex-col items-center gap-2 pt-2 border-t border-slate-700/30">
        {/* Dark/Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          title={isDarkMode ? 'Heller Modus' : 'Dunkler Modus'}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            isDarkMode
              ? 'hover:bg-slate-800 text-amber-400'
              : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Ultra-Security Status */}
        <button
          onClick={() => setActiveModal('security')}
          title="Sicherheitsstatus: Ultra-Priorität (Verschlüsselt)"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors"
        >
          <ShieldAlert className="w-4 h-4" />
        </button>

        {/* Settings Cog */}
        <button
          onClick={() => setActiveModal('settings')}
          title="Einstellungen"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveModal('settings')}
          title="Mehr Optionen"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            isDarkMode ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-200 text-slate-500'
          }`}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
