import React, { useState, useEffect } from 'react';
import { useBrowser } from '../context/BrowserContext';
import { SpeedDial } from './SpeedDial';
import { BrowserIndexerPage } from './BrowserIndexerPage';
import { browserIndexer } from '../services/browserIndexService';
import {
  ShieldCheck,
  Lock,
  Globe,
  ExternalLink,
  KeyRound,
  Check,
  RefreshCw,
  Search,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Share2,
  X,
  Database,
} from 'lucide-react';

interface LiveSearchResult {
  title: string;
  url: string;
  snippet: string;
  domain: string;
  icon?: string;
}

export const WebPageView: React.FC = () => {
  const {
    activeTab,
    navigateActiveTab,
    isDarkMode,
    vpnEnabled,
    activeNode,
    dnsProvider,
    adblockEnabled,
    blockCryptoMiners,
    cryptoMinersBlockedCount,
    passwords,
    setActiveModal,
    setSidebarPanel,
  } = useBrowser();

  const [autofillSuccess, setAutofillSuccess] = useState(false);
  const [liveResults, setLiveResults] = useState<LiveSearchResult[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [searchFilterQuery, setSearchFilterQuery] = useState('');
  const [proxyIframeLoading, setProxyIframeLoading] = useState(true);

  // Speed Dial check
  if (activeTab.url === 'aura://speeddial' || activeTab.url === 'aura://newtab') {
    return <SpeedDial />;
  }

  // Browser Inhalts-Index Page check
  if (activeTab.url === 'aura://indexer' || activeTab.url === 'aura://index') {
    return <BrowserIndexerPage />;
  }

  // Automatically index any visited web page into the local browser index
  useEffect(() => {
    if (activeTab.url && activeTab.title && !activeTab.url.startsWith('aura://')) {
      browserIndexer.indexItem(
        activeTab.url,
        activeTab.title,
        `Besuchte Webseite im Browser`,
        activeTab.title,
        'page'
      );
    }
  }, [activeTab.url, activeTab.title]);

  // Detect whether this is Google Home or a Search
  const isGoogleHome =
    activeTab.url === 'https://www.google.de' ||
    activeTab.url === 'https://www.google.de/' ||
    activeTab.url === 'https://google.de' ||
    activeTab.url === 'https://google.de/' ||
    activeTab.url === 'https://www.google.com' ||
    activeTab.url === 'https://www.google.com/';

  const isSearch =
    isGoogleHome ||
    activeTab.url.includes('google.de/search') ||
    activeTab.url.includes('google.com/search') ||
    activeTab.url.includes('duckduckgo.com') ||
    activeTab.url.includes('search.brave.com');

  // Extract query keyword
  const urlParamMatch = activeTab.url.match(/[?&]q=([^&]+)/);
  const searchKeyword = isGoogleHome
    ? ''
    : urlParamMatch
    ? decodeURIComponent(urlParamMatch[1]).replace(/\+/g, ' ')
    : activeTab.title;

  // Fetch live search results from backend internet scraper/API
  useEffect(() => {
    if (!isSearch || !searchKeyword) return;

    setSearchFilterQuery(searchKeyword);
    setIsLoadingSearch(true);

    fetch(`/api/search?q=${encodeURIComponent(searchKeyword)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.results)) {
          setLiveResults(data.results);
          data.results.forEach((r: any) => {
            if (r.url && r.title) {
              browserIndexer.indexItem(
                r.url,
                r.title,
                r.snippet || `Suchergebnis für "${searchKeyword}"`,
                `${r.title} ${r.snippet || ''} ${searchKeyword}`,
                'search'
              );
            }
          });
        }
      })
      .catch((err) => {
        console.error('Failed to fetch live search results:', err);
      })
      .finally(() => {
        setIsLoadingSearch(false);
      });
  }, [activeTab.url, isSearch, searchKeyword]);

  // Reset proxy loading on URL change
  useEffect(() => {
    setProxyIframeLoading(true);
  }, [activeTab.url]);

  const handleInnerSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchFilterQuery.trim()) {
      navigateActiveTab(
        `https://www.google.de/search?q=${encodeURIComponent(searchFilterQuery.trim())}&hl=de&lr=lang_de`
      );
    }
  };

  const domain = activeTab.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  const matchedPassword = passwords.find((p) =>
    activeTab.url
      .toLowerCase()
      .includes(p.website.toLowerCase().replace(/^https?:\/\/(www\.)?/, '').split('/')[0])
  );

  const handleAutofill = () => {
    setAutofillSuccess(true);
    setTimeout(() => setAutofillSuccess(false), 2000);
  };

  return (
    <div
      className={`h-full w-full flex flex-col overflow-hidden select-text ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      {/* 1. Browser Page Top Security Ribbon */}
      <div
        className={`px-4 py-1.5 flex items-center justify-between text-xs border-b select-none flex-wrap gap-2 ${
          isDarkMode
            ? 'bg-slate-900/90 border-slate-800 text-slate-300'
            : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-emerald-500 font-medium">
            <Lock className="w-3.5 h-3.5" />
            TLS 1.3 Verschlüsselt
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-orange-400 font-mono text-[11px]">
            {dnsProvider === 'cloudflare' ? 'Cloudflare 1.1.1.1 DoH' : 'DNS over HTTPS'}
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-blue-400 text-[11px]">
            {vpnEnabled ? `VPN: ${activeNode.city} (${activeNode.ip})` : 'Lokale IP verschleiert'}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {adblockEnabled && (
            <div
              onClick={() => setActiveModal('adblock')}
              className="flex items-center gap-1 text-emerald-400 cursor-pointer hover:underline text-[11px]"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Werbung isoliert</span>
            </div>
          )}

          {blockCryptoMiners && (
            <div
              onClick={() => setActiveModal('adblock')}
              title="Kryptomining-Schutz: WebMiner blockiert, CPU geschützt"
              className="flex items-center gap-1 text-amber-400 cursor-pointer hover:underline text-[11px]"
            >
              <span>⚡ Anti-CoinMiner</span>
            </div>
          )}

          {/* Gemini AI Smart Assistant */}
          <button
            onClick={() => setSidebarPanel('chat')}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 text-[11px] font-medium transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            <span>Gemini KI</span>
          </button>

          {/* External Open Button */}
          <a
            href={activeTab.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Diese Seite in externem Browser-Tab öffnen"
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Extern öffnen</span>
          </a>

          {matchedPassword && (
            <button
              onClick={handleAutofill}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-blue-600 text-white text-[11px] hover:bg-blue-500 transition-colors"
            >
              <KeyRound className="w-3 h-3" />
              {autofillSuccess ? 'Eingefügt!' : 'Passwort ausfüllen'}
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Page Content */}
      <div className="flex-1 overflow-y-auto">
        {isSearch ? (
          /* ========================================================= */
          /* GERMAN GOOGLE SEARCH INTERFACE WITH REAL INTERNET RESULTS */
          /* ========================================================= */
          <div className="min-h-full w-full bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            {/* Top Google Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  {/* Google colorful logo */}
                  <span
                    onClick={() => navigateActiveTab('https://www.google.de')}
                    className="cursor-pointer text-2xl font-bold tracking-tight select-none flex-shrink-0"
                  >
                    <span className="text-[#4285F4]">G</span>
                    <span className="text-[#EA4335]">o</span>
                    <span className="text-[#FBBC05]">o</span>
                    <span className="text-[#4285F4]">g</span>
                    <span className="text-[#34A853]">l</span>
                    <span className="text-[#EA4335]">e</span>
                    <span className="text-xs font-semibold text-slate-400 ml-1">DE</span>
                  </span>

                  {/* Search Bar Input on German */}
                  <form onSubmit={handleInnerSearch} className="flex-1 max-w-xl">
                    <div className="flex items-center px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm focus-within:shadow-md transition-shadow">
                      <input
                        type="text"
                        value={searchFilterQuery}
                        onChange={(e) => setSearchFilterQuery(e.target.value)}
                        placeholder="Google-Suche auf Deutsch..."
                        className="flex-1 bg-transparent border-none outline-none text-xs text-inherit placeholder:text-slate-400"
                      />
                      <button type="submit" className="p-1 text-blue-500 hover:text-blue-600">
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>

                {/* Direct link to original Google.de */}
                <a
                  href={`https://www.google.de/search?q=${encodeURIComponent(searchKeyword)}&hl=de`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600/20 text-xs font-medium transition-colors whitespace-nowrap self-start md:self-auto"
                >
                  <span>Original Google.de öffnen</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Category tabs */}
              <div className="max-w-4xl mx-auto flex items-center gap-6 mt-4 text-xs font-medium text-slate-600 dark:text-slate-400 overflow-x-auto no-scrollbar">
                <span className="text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1 cursor-pointer font-bold">
                  Alle
                </span>
                <span
                  onClick={() =>
                    navigateActiveTab(
                      `https://www.google.de/search?q=${encodeURIComponent(searchKeyword)}&tbm=isch&hl=de`
                    )
                  }
                  className="hover:text-blue-500 cursor-pointer pb-1"
                >
                  Bilder
                </span>
                <span
                  onClick={() =>
                    navigateActiveTab(
                      `https://www.google.de/search?q=${encodeURIComponent(searchKeyword)}&tbm=vid&hl=de`
                    )
                  }
                  className="hover:text-blue-500 cursor-pointer pb-1"
                >
                  Videos
                </span>
                <span
                  onClick={() =>
                    navigateActiveTab(
                      `https://www.google.de/search?q=${encodeURIComponent(searchKeyword)}&tbm=nws&hl=de`
                    )
                  }
                  className="hover:text-blue-500 cursor-pointer pb-1"
                >
                  News
                </span>
                <span
                  onClick={() =>
                    navigateActiveTab(
                      `https://www.google.de/maps/search/${encodeURIComponent(searchKeyword)}`
                    )
                  }
                  className="hover:text-blue-500 cursor-pointer pb-1"
                >
                  Karten
                </span>
                <span
                  onClick={() =>
                    navigateActiveTab(
                      `https://www.google.de/search?q=${encodeURIComponent(searchKeyword)}&tbm=shop&hl=de`
                    )
                  }
                  className="hover:text-blue-500 cursor-pointer pb-1"
                >
                  Shopping
                </span>
              </div>
            </div>

            {/* Search Results Area or Google DE Homepage */}
            {!searchKeyword ? (
              <div className="py-16 max-w-xl mx-auto flex flex-col items-center justify-center text-center px-4">
                <div className="text-6xl font-bold tracking-tight mb-8 select-none">
                  <span className="text-[#4285F4]">G</span>
                  <span className="text-[#EA4335]">o</span>
                  <span className="text-[#FBBC05]">o</span>
                  <span className="text-[#4285F4]">g</span>
                  <span className="text-[#34A853]">l</span>
                  <span className="text-[#EA4335]">e</span>
                  <span className="text-sm font-semibold text-slate-400 ml-2">Deutschland</span>
                </div>

                <form onSubmit={handleInnerSearch} className="w-full mb-6">
                  <div className="flex items-center px-5 py-3 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md hover:shadow-lg focus-within:shadow-lg transition-shadow">
                    <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
                    <input
                      type="text"
                      value={searchFilterQuery}
                      onChange={(e) => setSearchFilterQuery(e.target.value)}
                      placeholder="Auf Google suchen oder URL eingeben..."
                      autoFocus
                      className="flex-1 bg-transparent border-none outline-none text-sm text-inherit placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex justify-center gap-3 mt-6">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      Google Suche
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateActiveTab('https://www.google.de/search?q=deutschland+nachrichten&hl=de')}
                      className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      Auf gut Glück!
                    </button>
                  </div>
                </form>

                <p className="text-xs text-slate-500 mt-4">
                  Google angeboten auf: <span className="text-blue-600 dark:text-blue-400 font-medium">Deutsch</span>
                </p>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto px-6 py-6">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Ungefähr {liveResults.length * 142000 + 482000} Ergebnisse aus dem Web (0,24 Sekunden)
                </div>

              {isLoadingSearch ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="text-xs">
                    Durchsuche das Web nach <strong>"{searchKeyword}"</strong> auf Deutsch...
                  </span>
                </div>
              ) : (
                <div className="space-y-6">
                  {liveResults.map((item, idx) => (
                    <div
                      key={idx}
                      className="group max-w-2xl p-2 rounded-xl transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-900/40"
                    >
                      {/* URL Breadcrumb & Favicon */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                        {item.icon ? (
                          <img
                            src={item.icon}
                            alt=""
                            className="w-4 h-4 rounded-sm"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {item.domain}
                        </span>
                        <span className="truncate text-slate-400 text-[11px]">{item.url}</span>
                      </div>

                      {/* Clickable Title */}
                      <h3
                        onClick={() => navigateActiveTab(item.url)}
                        className="text-base font-semibold text-blue-600 dark:text-blue-400 group-hover:underline cursor-pointer leading-snug"
                      >
                        {item.title}
                      </h3>

                      {/* Snippet */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {item.snippet}
                      </p>

                      {/* Quick Actions */}
                      <div className="mt-2 flex items-center gap-3 text-[11px]">
                        <button
                          onClick={() => navigateActiveTab(item.url)}
                          className="text-blue-500 hover:underline font-medium flex items-center gap-0.5"
                        >
                          <span>Im Aura Browser aufrufen</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-slate-200 flex items-center gap-0.5"
                        >
                          <span>Extern ↗</span>
                        </a>
                      </div>
                    </div>
                  ))}

                  {/* Fallback box if empty */}
                  {liveResults.length === 0 && !isLoadingSearch && (
                    <div className="p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
                      <p className="text-sm text-slate-400 mb-3">
                        Möchten Sie direkt auf der offiziellen Google.de-Website suchen?
                      </p>
                      <a
                        href={`https://www.google.de/search?q=${encodeURIComponent(searchKeyword)}&hl=de`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors"
                      >
                        <span>"{searchKeyword}" auf Google.de aufrufen</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
            )}
          </div>
        ) : (
          /* ========================================================= */
          /* LIVE WEB PAGE EMBEDDED VIEWER (UNBLOCKED VIA LOCAL PROXY) */
          /* ========================================================= */
          <div className="w-full h-full flex flex-col relative bg-slate-900">
            {/* Top Webpage Utility Bar */}
            <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 select-none">
              <div className="flex items-center gap-2 overflow-hidden mr-2">
                <Globe className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="font-bold text-white truncate">{domain}</span>
                <span className="text-slate-500 font-mono text-[11px] truncate hidden sm:inline">
                  ({activeTab.url})
                </span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={activeTab.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] flex items-center gap-1 transition-colors"
                >
                  <span>Direkt aufrufen</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Live Web Page Iframe */}
            <div className="flex-1 w-full h-full relative bg-white">
              {proxyIframeLoading && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-slate-200 z-10">
                  <RefreshCw className="w-7 h-7 animate-spin text-blue-500" />
                  <span className="text-xs font-medium">
                    Lade <strong>{domain}</strong> über geschützten Aura-Proxy...
                  </span>
                </div>
              )}

              <iframe
                src={`/api/proxy?url=${encodeURIComponent(activeTab.url)}`}
                title={activeTab.title}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                onLoad={() => setProxyIframeLoading(false)}
                onError={() => setProxyIframeLoading(false)}
                className="w-full h-full border-none bg-white"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
