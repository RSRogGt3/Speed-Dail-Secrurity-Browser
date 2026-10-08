import React, { useState, useEffect } from 'react';
import { useBrowser } from '../context/BrowserContext';
import {
  Search,
  Sun,
  CloudSun,
  Plus,
  ShieldCheck,
  Lock,
  ExternalLink,
  ChevronDown,
  Trash2,
  Download,
  Database,
} from 'lucide-react';
import { NewsArticle } from '../types/browser';

const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'news-1',
    source: 'NBC Sports',
    title: 'McIlroy tops Koepka for PGA Tour Player of the Year',
    category: 'SPORTS',
    url: 'https://www.nbcsports.com',
    timeAgo: 'Vor 2 Std.',
    readTime: '3 min',
  },
  {
    id: 'news-2',
    source: 'The Fader Magazine',
    title: "Listen to Stranger Things star Maya Hawke's debut singles",
    category: 'ENTERTAINMENT',
    url: 'https://thefader.com',
    timeAgo: 'Vor 4 Std.',
    readTime: '4 min',
  },
  {
    id: 'news-3',
    source: 'U.S. News',
    title: 'How to Know if You Should Apply to College Early',
    category: 'LIFESTYLE',
    url: 'https://www.usnews.com',
    timeAgo: 'Vor 5 Std.',
    readTime: '5 min',
  },
  {
    id: 'news-4',
    source: 'TechCrunch',
    title: 'Post-Quantum Cryptography & Zero-Knowledge Browsing in Chromium',
    category: 'TECHNOLOGY',
    url: 'https://techcrunch.com',
    timeAgo: 'Vor 1 Std.',
    readTime: '6 min',
  },
  {
    id: 'news-5',
    source: 'Bloomberg Business',
    title: 'Global Tech Stocks Rally on Cloud Security & Privacy Hardware',
    category: 'BUSINESS',
    url: 'https://bloomberg.com',
    timeAgo: 'Vor 3 Std.',
    readTime: '4 min',
  },
  {
    id: 'news-6',
    source: 'Nature Science',
    title: 'James Webb Space Telescope Captures Earliest Known Galaxies',
    category: 'SCIENCE',
    url: 'https://nature.com',
    timeAgo: 'Vor 6 Std.',
    readTime: '7 min',
  },
];

const CATEGORIES = [
  'ALL',
  'ARTS',
  'BUSINESS',
  'ENTERTAINMENT',
  'FOOD',
  'HEALTH',
  'LIVING',
  'LIFESTYLE',
  'MOTORING',
  'NEWS',
  'SCIENCE',
  'SPORTS',
  'TECHNOLOGY',
  'TRAVEL',
];

export const SpeedDial: React.FC = () => {
  const {
    tiles,
    removeTile,
    navigateActiveTab,
    isDarkMode,
    weatherLocation,
    setWeatherLocation,
    weatherTemp,
    searchEngine,
    setSearchEngine,
    vpnEnabled,
    activeNode,
    dnsProvider,
    setActiveModal,
  } = useBrowser();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [editingWeather, setEditingWeather] = useState(false);
  const [tempCity, setTempCity] = useState(weatherLocation);
  const [showEngineDropdown, setShowEngineDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || q.length < 2) {
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
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigateActiveTab(searchQuery);
    }
  };

  const handleSaveCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempCity.trim()) {
      setWeatherLocation(tempCity.trim());
      setEditingWeather(false);
    }
  };

  const filteredNews =
    selectedCategory === 'ALL'
      ? NEWS_ARTICLES
      : NEWS_ARTICLES.filter((item) => item.category === selectedCategory);

  return (
    <div
      className={`min-h-full w-full overflow-y-auto px-6 py-6 flex flex-col justify-between transition-colors ${
        isDarkMode
          ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100'
          : 'bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 text-slate-800'
      }`}
    >
      {/* Top Bar with Weather widget & Privacy status */}
      <div className="w-full max-w-6xl mx-auto flex items-start justify-between">
        {/* Weather Widget matching screenshot ("Oslo 18°C") */}
        <div className="flex flex-col">
          {editingWeather ? (
            <form onSubmit={handleSaveCity} className="flex items-center gap-1">
              <input
                type="text"
                value={tempCity}
                onChange={(e) => setTempCity(e.target.value)}
                autoFocus
                className="text-xs px-2 py-1 rounded bg-slate-800 text-white border border-slate-700 outline-none w-28"
              />
              <button
                type="submit"
                className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded"
              >
                OK
              </button>
            </form>
          ) : (
            <div
              onClick={() => setEditingWeather(true)}
              className="cursor-pointer group flex flex-col items-start select-none"
              title="Klicken zum Ändern der Stadt"
            >
              <span className="text-xs font-medium text-slate-400 group-hover:text-blue-400 transition-colors">
                {weatherLocation}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <CloudSun className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-semibold">{weatherTemp}</span>
              </div>
            </div>
          )}
        </div>

        {/* Security & Anonymity Indicator Banner & Windows Setup */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateActiveTab('aura://indexer')}
            className={`px-3 py-1 rounded-full text-xs flex items-center gap-1.5 border font-medium transition-all ${
              isDarkMode
                ? 'bg-purple-600/20 text-purple-300 border-purple-500/30 hover:bg-purple-600/30'
                : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Browser-Inhalts-Index</span>
          </button>

          <button
            onClick={() => setActiveModal('windowsSetup')}
            className={`px-3 py-1 rounded-full text-xs flex items-center gap-1.5 border font-medium transition-all ${
              isDarkMode
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/30 hover:bg-blue-600/30'
                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Windows Setup.exe (SHA-256)</span>
          </button>

          <div
            onClick={() => setActiveModal('security')}
            className={`cursor-pointer px-3 py-1 rounded-full text-xs flex items-center gap-2 border transition-all ${
              isDarkMode
                ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium text-[11px]">
              {vpnEnabled
                ? `Anonym · VPN: ${activeNode.city} (${activeNode.ip})`
                : 'Anonyme Startseite · Ohne Tracking'}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-orange-400 font-mono text-[10px]">
              {dnsProvider === 'cloudflare' ? 'Cloudflare 1.1.1.1 DoH' : 'DoH Aktiv'}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-emerald-400 font-mono text-[10px]">AES-256</span>
          </div>
        </div>
      </div>

      {/* Main Content: Search Bar & Speed Dial Tiles */}
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center my-6">
        {/* Centered Search Bar matching Google Opera look */}
        <div className="w-full max-w-2xl mb-8 relative">
          <form onSubmit={handleSearch} className="relative">
            <div
              className={`w-full h-13 rounded-full flex items-center px-4 gap-3 transition-all border shadow-lg ${
                isDarkMode
                  ? 'bg-slate-900/90 border-slate-700/80 hover:border-slate-600 focus-within:border-blue-500 shadow-black/40'
                  : 'bg-white border-slate-300/80 hover:border-slate-400 focus-within:border-blue-500 shadow-slate-200'
              }`}
            >
              {/* Google colorful "G" logo or engine button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEngineDropdown(!showEngineDropdown)}
                  title="Suchmaschine auswählen"
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-800/20 transition-colors"
                >
                  {searchEngine === 'google' ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                  ) : searchEngine === 'duckduckgo' ? (
                    <span className="text-base">🦆</span>
                  ) : (
                    <span className="text-base">🦁</span>
                  )}
                </button>

                {/* Engine Selector Dropdown */}
                {showEngineDropdown && (
                  <div
                    className={`absolute top-10 left-0 w-44 rounded-xl shadow-xl border py-1.5 z-30 ${
                      isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSearchEngine('google');
                        setShowEngineDropdown(false);
                      }}
                      className="w-full px-3 py-1.5 text-xs text-left hover:bg-slate-800/40 flex items-center gap-2"
                    >
                      <span className="font-semibold text-blue-400">G</span> Google
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchEngine('duckduckgo');
                        setShowEngineDropdown(false);
                      }}
                      className="w-full px-3 py-1.5 text-xs text-left hover:bg-slate-800/40 flex items-center gap-2"
                    >
                      <span>🦆</span> DuckDuckGo (Privat)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchEngine('brave');
                        setShowEngineDropdown(false);
                      }}
                      className="w-full px-3 py-1.5 text-xs text-left hover:bg-slate-800/40 flex items-center gap-2"
                    >
                      <span>🦁</span> Brave Search (Trackerfrei)
                    </button>
                  </div>
                )}
              </div>

              {/* Input field */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Google-Suche auf Deutsch oder Adresse eingeben"
                className="flex-1 bg-transparent border-none outline-none text-sm text-inherit placeholder:text-slate-400 font-normal"
              />

              {/* Right Search Button */}
              <button
                type="submit"
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Google Search Auto-Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                className={`absolute top-15 left-0 right-0 rounded-2xl shadow-2xl border py-2 z-40 overflow-hidden ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                {suggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setShowSuggestions(false);
                      setSearchQuery(item);
                      navigateActiveTab(item);
                    }}
                    className={`px-4 py-2.5 flex items-center gap-3 cursor-pointer text-xs font-medium transition-colors ${
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
        </div>

        {/* Speed Dial Grid (2 rows x 6 columns matching screenshot) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 w-full">
          {tiles.map((tile) => (
            <div
              key={tile.id}
              onClick={() => navigateActiveTab(tile.url)}
              className="group relative flex flex-col items-center cursor-pointer select-none"
            >
              {/* Tile Box */}
              <div
                className={`w-full aspect-[16/10] rounded-xl flex items-center justify-center p-3 text-white font-bold shadow-md transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl ${tile.bgGradient}`}
              >
                {/* Brand Logos Styled Accurately */}
                {tile.title === 'Booking' && (
                  <span className="text-sm tracking-tight font-extrabold">Booking.com</span>
                )}
                {tile.title === 'Twitter' && (
                  <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
                  </svg>
                )}
                {tile.title === 'Blogger' && (
                  <span className="text-2xl font-black bg-white text-[#FF5722] w-8 h-8 rounded-lg flex items-center justify-center">
                    B
                  </span>
                )}
                {tile.title === 'Discord' && (
                  <span className="text-xl font-bold tracking-wider">Discord</span>
                )}
                {tile.title === 'AliExpress' && (
                  <span className="text-xs font-black tracking-tighter">AliExpress</span>
                )}
                {tile.title === 'Prime Video' && (
                  <span className="text-xs font-semibold lowercase tracking-tight">prime video</span>
                )}
                {tile.title === 'Vimeo' && (
                  <span className="text-sm font-black italic">vimeo</span>
                )}
                {tile.title === 'Yelp' && (
                  <span className="text-base font-black tracking-wider">yelp*</span>
                )}
                {tile.title === 'Twitch' && (
                  <span className="text-sm font-extrabold tracking-tight">twitch</span>
                )}
                {tile.title === 'Soundcloud' && (
                  <span className="text-xs font-bold uppercase tracking-widest">SoundCloud</span>
                )}
                {tile.title === 'Dropbox' && (
                  <span className="text-sm font-bold tracking-tight">Dropbox</span>
                )}
                {tile.title === 'LinkedIn' && (
                  <span className="text-2xl font-black">in</span>
                )}
                {![
                  'Booking',
                  'Twitter',
                  'Blogger',
                  'Discord',
                  'AliExpress',
                  'Prime Video',
                  'Vimeo',
                  'Yelp',
                  'Twitch',
                  'Soundcloud',
                  'Dropbox',
                  'LinkedIn',
                ].includes(tile.title) && (
                  <span className="text-sm font-semibold truncate">{tile.title}</span>
                )}
              </div>

              {/* Tile Label */}
              <span
                className={`text-[11px] mt-1.5 font-medium transition-colors ${
                  isDarkMode ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-600 group-hover:text-slate-900'
                }`}
              >
                {tile.title}
              </span>

              {/* Delete Tile Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTile(tile.id);
                }}
                title="Kachel entfernen"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded-md bg-black/60 text-white hover:bg-red-600 transition-all text-xs"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Add New Tile Box */}
          <div
            onClick={() => setActiveModal('addTile')}
            className={`aspect-[16/10] rounded-xl border border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
              isDarkMode
                ? 'border-slate-800 hover:border-slate-600 hover:bg-slate-900/50 text-slate-500 hover:text-slate-300'
                : 'border-slate-300 hover:border-slate-400 hover:bg-white text-slate-400 hover:text-slate-700'
            }`}
          >
            <Plus className="w-5 h-5 mb-1" />
            <span className="text-[11px] font-medium">Hinzufügen</span>
          </div>
        </div>
      </div>

      {/* Bottom News Section matching screenshot */}
      <div className="w-full max-w-5xl mx-auto mt-6 border-t border-slate-700/20 pt-4">
        {/* Categories Bar */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 text-[11px] font-semibold tracking-wider">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? isDarkMode
                    ? 'text-white border-b-2 border-blue-500 pb-0.5'
                    : 'text-slate-900 border-b-2 border-blue-600 pb-0.5'
                  : isDarkMode
                  ? 'text-slate-500 hover:text-slate-300'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3 News Cards horizontally as in the screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          {filteredNews.slice(0, 3).map((article) => (
            <div
              key={article.id}
              onClick={() => navigateActiveTab(article.url)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
                isDarkMode
                  ? 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                  : 'bg-white border-slate-200 hover:shadow-md'
              }`}
            >
              {/* Publisher & Metadata */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                <span className="font-semibold text-blue-400">{article.source}</span>
                <span>{article.timeAgo}</span>
              </div>

              {/* Title */}
              <h4
                className={`text-xs font-semibold leading-relaxed line-clamp-2 ${
                  isDarkMode ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                {article.title}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
