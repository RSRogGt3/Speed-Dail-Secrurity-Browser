import React, { useState, useEffect } from 'react';
import { useBrowser } from '../context/BrowserContext';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  LayoutGrid,
  Shield,
  ShieldCheck,
  Lock,
  Star,
  Download,
  KeyRound,
  SlidersHorizontal,
  Cloud,
  Check,
  Search,
  Sparkles,
  User,
  Database,
} from 'lucide-react';

export const Omnibar: React.FC = () => {
  const {
    activeTab,
    navigateActiveTab,
    goBack,
    goForward,
    reloadTab,
    createTab,
    isDarkMode,
    vpnEnabled,
    activeNode,
    adblockEnabled,
    adsBlockedCount,
    dnsProvider,
    passwords,
    bookmarks,
    addBookmark,
    removeBookmark,
    setEditingBookmark,
    userAccount,
    setActiveModal,
    setSidebarPanel,
  } = useBrowser();

  const [inputUrl, setInputUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (activeTab.url === 'aura://speeddial') {
      setInputUrl('');
    } else {
      setInputUrl(activeTab.url);
    }
  }, [activeTab.url]);

  useEffect(() => {
    const q = inputUrl.trim();
    if (!isFocused || !q || q.startsWith('http') || q.startsWith('aura://') || q.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d && Array.isArray(d.suggestions)) {
            setSuggestions(d.suggestions);
            setShowSuggestions(true);
          }
        })
        .catch(() => {});
    }, 120);
    return () => clearTimeout(timer);
  }, [inputUrl, isFocused]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      setShowSuggestions(false);
      navigateActiveTab(inputUrl);
    }
  };

  const currentBookmark = bookmarks.find((b) => b.url === activeTab.url);
  const isBookmarked = !!currentBookmark;

  const handleStarClick = () => {
    if (isBookmarked && currentBookmark) {
      setEditingBookmark(currentBookmark);
    } else {
      setEditingBookmark(null);
    }
    setActiveModal('bookmark');
  };

  return (
    <div
      className={`h-11 px-3 flex items-center gap-2 select-none border-b transition-colors ${
        isDarkMode
          ? 'bg-slate-900 border-slate-800/80 text-slate-200'
          : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      {/* Navigation Controls: Back, Forward, Reload, Speed Dial */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={goBack}
          disabled={!activeTab.canGoBack}
          title="Zurück"
          className={`p-1.5 rounded-md transition-colors ${
            activeTab.canGoBack
              ? isDarkMode
                ? 'text-slate-200 hover:bg-slate-800'
                : 'text-slate-700 hover:bg-slate-100'
              : 'text-slate-500/40 cursor-not-allowed'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button
          onClick={goForward}
          disabled={!activeTab.canGoForward}
          title="Vorwärts"
          className={`p-1.5 rounded-md transition-colors ${
            activeTab.canGoForward
              ? isDarkMode
                ? 'text-slate-200 hover:bg-slate-800'
                : 'text-slate-700 hover:bg-slate-100'
              : 'text-slate-500/40 cursor-not-allowed'
          }`}
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={reloadTab}
          title="Neu laden"
          className={`p-1.5 rounded-md transition-colors ${
            isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${activeTab.isLoading ? 'animate-spin text-blue-400' : ''}`} />
        </button>

        <button
          onClick={() => navigateActiveTab('aura://speeddial')}
          title="Speed Dial Startseite"
          className={`p-1.5 rounded-md transition-colors ${
            activeTab.url === 'aura://speeddial'
              ? 'text-red-500 bg-red-500/10'
              : isDarkMode
              ? 'hover:bg-slate-800 text-slate-300'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        <button
          onClick={() => navigateActiveTab('aura://indexer')}
          title="Browser-Inhalts-Index (aura://indexer) - Volltextsuche & Indizierung"
          className={`p-1.5 rounded-md transition-colors ${
            activeTab.url === 'aura://indexer'
              ? 'text-blue-500 bg-blue-500/10'
              : isDarkMode
              ? 'hover:bg-slate-800 text-slate-300'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Database className="w-4 h-4" />
        </button>
      </div>

      {/* Omnibar / Address Bar */}
      <form onSubmit={handleSubmit} className="flex-1 flex items-center relative">
        <div
          className={`w-full h-8.5 rounded-full flex items-center px-2.5 gap-2 transition-all border ${
            isFocused
              ? isDarkMode
                ? 'bg-slate-950 border-blue-500 ring-2 ring-blue-500/20'
                : 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
              : isDarkMode
              ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60'
              : 'bg-slate-100 hover:bg-slate-100/90 border-slate-200'
          }`}
        >
          {/* VPN Badge - Directly inside the address bar matching Opera */}
          <button
            type="button"
            onClick={() => setActiveModal('vpn')}
            title={`VPN: ${vpnEnabled ? `Aktiv (${activeNode.city})` : 'Deaktiviert'}`}
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide flex items-center gap-1 transition-all ${
              vpnEnabled
                ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-500'
                : isDarkMode
                ? 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
          >
            <span className="text-[10px]">VPN</span>
            {vpnEnabled && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>}
          </button>

          {/* Cloudflare DoH & Security Lock Indicator */}
          <button
            type="button"
            onClick={() => setActiveModal('dns')}
            title="Cloudflare 1.1.1.1 DoH & Ultra-Verschlüsselung aktiv"
            className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            {dnsProvider === 'cloudflare' && (
              <span className="hidden sm:inline text-[10px] font-mono text-orange-400 font-medium">1.1.1.1</span>
            )}
          </button>

          {/* Search Icon if empty */}
          {!inputUrl && !isFocused && (
            <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          )}

          {/* Address Bar Text Input */}
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Google-Suche auf Deutsch oder Webadresse eingeben"
            className="flex-1 bg-transparent border-none outline-none text-xs text-inherit placeholder:text-slate-400 font-sans"
          />

          {/* Adblocker Shield Button */}
          <button
            type="button"
            onClick={() => setActiveModal('adblock')}
            title={`Aura Adblocker: ${adblockEnabled ? `${adsBlockedCount} geblockt` : 'Aus'}`}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] transition-colors ${
              adblockEnabled
                ? 'text-emerald-400 hover:bg-emerald-500/10'
                : 'text-slate-500 hover:bg-slate-700/50'
            }`}
          >
            {adblockEnabled ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Shield className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="text-[10px] font-mono font-medium">{adsBlockedCount}</span>
          </button>

          {/* Password Manager Vault Button */}
          <button
            type="button"
            onClick={() => setActiveModal('password')}
            title={`Passwort-Tresor (AES-256): ${passwords.length} Passwörter`}
            className={`p-1 rounded transition-colors ${
              isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
          </button>

          {/* Bookmark Star Button */}
          {activeTab.url !== 'aura://speeddial' && (
            <button
              type="button"
              onClick={handleStarClick}
              title={
                isBookmarked
                  ? 'Lesezeichen in Firestore bearbeiten oder löschen'
                  : 'Lesezeichen zur Firestore-Datenbank hinzufügen'
              }
              className={`p-1 rounded transition-colors ${
                isBookmarked
                  ? 'text-amber-400 hover:bg-amber-400/10'
                  : isDarkMode
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          )}
        </div>

        {/* Google Search Auto-Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            className={`absolute top-10 left-0 right-0 rounded-xl shadow-2xl border py-1.5 z-50 overflow-hidden ${
              isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                onMouseDown={() => {
                  setShowSuggestions(false);
                  setInputUrl(item);
                  navigateActiveTab(item);
                }}
                className={`px-3.5 py-2 flex items-center gap-2.5 cursor-pointer text-xs font-medium transition-colors ${
                  isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}
      </form>

      {/* Right Controls: Downloads, Windows Setup, Settings, Google Sync Avatar */}
      <div className="flex items-center gap-1 pl-1">
        {/* Gemini AI Assistant Quick Launch */}
        <button
          onClick={() => {
            setActiveModal('none');
            setSidebarPanel('chat');
          }}
          type="button"
          title="Google Gemini 3.8 Flash KI-Assistent"
          className={`p-1.5 rounded-md transition-colors ${
            isDarkMode ? 'hover:bg-slate-800 text-blue-400' : 'hover:bg-slate-100 text-blue-600'
          }`}
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Windows Setup.exe Certified Download */}
        <button
          onClick={() => setActiveModal('windowsSetup')}
          title="Windows Setup.exe & Zertifikat-Center (Authenticode SHA-256)"
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Setup.exe</span>
        </button>

        {/* Cloudflare DoH Quick Status */}
        <button
          onClick={() => setActiveModal('dns')}
          title="Cloudflare 1.1.1.1 DNS Status"
          className={`p-1.5 rounded-md transition-colors ${
            isDarkMode ? 'hover:bg-slate-800 text-orange-400' : 'hover:bg-slate-100 text-orange-500'
          }`}
        >
          <Cloud className="w-4 h-4" />
        </button>

        {/* Easy Setup / Customize Settings */}
        <button
          onClick={() => setActiveModal('settings')}
          title="Browser-Einstellungen"
          className={`p-1.5 rounded-md transition-colors ${
            isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* User Account / Sync Profile Button */}
        {userAccount.isLoggedIn ? (
          <button
            onClick={() => setActiveModal('sync')}
            title={`Angemeldet als ${userAccount.name || userAccount.email} (In Datenbank synchronisiert)`}
            className="flex items-center gap-1.5 pl-1 pr-1.5 py-1 rounded-full hover:bg-slate-800/40 transition-all border border-slate-700/50"
          >
            <div className="relative">
              <img
                src={userAccount.avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'}
                alt={userAccount.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-500"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-slate-900"></span>
            </div>
            <span className="text-[11px] font-medium hidden sm:inline text-slate-200 pr-1">
              {userAccount.name || userAccount.email.split('@')[0]}
            </span>
          </button>
        ) : (
          <button
            onClick={() => setActiveModal('sync')}
            title="Eigenständig anmelden oder registrieren"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all"
          >
            <User className="w-3.5 h-3.5" />
            <span>Anmelden</span>
          </button>
        )}
      </div>
    </div>
  );
};
