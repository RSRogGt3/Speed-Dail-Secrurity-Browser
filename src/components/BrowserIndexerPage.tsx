import React, { useState, useEffect } from 'react';
import { useBrowser } from '../context/BrowserContext';
import { browserIndexer, IndexItem, IndexStats } from '../services/browserIndexService';
import {
  Database,
  Search,
  RefreshCw,
  Trash2,
  Download,
  ExternalLink,
  Globe,
  Star,
  Clock,
  LayoutGrid,
  Check,
  ShieldCheck,
  Cloud,
  FileText,
  Sparkles,
  ArrowRight,
  Layers,
} from 'lucide-react';

export const BrowserIndexerPage: React.FC = () => {
  const {
    navigateActiveTab,
    createTab,
    bookmarks,
    history,
    tiles,
    tabs,
    userAccount,
    isDarkMode,
  } = useBrowser();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [results, setResults] = useState<IndexItem[]>([]);
  const [stats, setStats] = useState<IndexStats>(browserIndexer.getStats());
  const [isIndexing, setIsIndexing] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Perform initial scan & update results
  const refreshIndex = () => {
    const res = browserIndexer.search(searchQuery, selectedCategory);
    setResults(res);
    setStats(browserIndexer.getStats());
  };

  useEffect(() => {
    refreshIndex();
  }, [searchQuery, selectedCategory]);

  // Index all content button
  const handleIndexAll = () => {
    setIsIndexing(true);
    setStatusMessage('Indiziere alle Webseiten, Kacheln, Lesezeichen und Verläufe...');

    setTimeout(() => {
      const count = browserIndexer.indexAllBrowserContent(bookmarks, history, tiles, tabs);
      refreshIndex();
      setIsIndexing(false);
      setStatusMessage(`Erfolgreich ${count} Browserinhalte vollständig indiziert!`);
      setTimeout(() => setStatusMessage(null), 3500);
    }, 400);
  };

  // Sync to Firebase Cloud
  const handleSyncCloud = async () => {
    if (!userAccount.userId) {
      setStatusMessage('Bitte melden Sie sich an, um den Index mit Firebase zu synchronisieren.');
      setTimeout(() => setStatusMessage(null), 3500);
      return;
    }

    setIsSyncingCloud(true);
    const success = await browserIndexer.syncToFirestore(userAccount.userId);
    setIsSyncingCloud(false);
    if (success) {
      setStatusMessage('Index erfolgreich mit Firebase Firestore synchronisiert!');
    } else {
      setStatusMessage('Fehler bei der Cloud-Synchronisation.');
    }
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Export JSON
  const handleExport = () => {
    const data = browserIndexer.exportJSON();
    navigator.clipboard.writeText(data);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  // Clear Index
  const handleClear = () => {
    if (confirm('Möchten Sie den gesamten Browser-Inhaltsindex wirklich leeren?')) {
      browserIndexer.clearIndex();
      refreshIndex();
      setStatusMessage('Browser-Index wurde geleert.');
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  const getCategoryIcon = (cat: IndexItem['category']) => {
    switch (cat) {
      case 'bookmark':
        return <Star className="w-3.5 h-3.5 text-yellow-400" />;
      case 'history':
        return <Clock className="w-3.5 h-3.5 text-purple-400" />;
      case 'tile':
        return <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div
      className={`min-h-full w-full overflow-y-auto px-6 py-8 flex flex-col transition-colors ${
        isDarkMode
          ? 'bg-slate-950 text-slate-100'
          : 'bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900'
      }`}
    >
      <div className="w-full max-w-5xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                Browser-Inhalts-Index
                <span className="text-[10px] bg-blue-500/20 text-blue-400 font-mono px-2 py-0.5 rounded-full border border-blue-500/30 font-semibold">
                  VOLLTEXT-INDEXIERT
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Durchsuche alle indizierten Webseiten, Lesezeichen, Chroniken, Kacheln und gespeicherten Texte
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleIndexAll}
              disabled={isIndexing}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isIndexing ? 'animate-spin' : ''}`} />
              <span>{isIndexing ? 'Indiziere...' : 'Jetzt komplett indizieren'}</span>
            </button>

            <button
              onClick={handleSyncCloud}
              disabled={isSyncingCloud}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Cloud className={`w-3.5 h-3.5 text-blue-400 ${isSyncingCloud ? 'animate-spin' : ''}`} />
              <span>{isSyncingCloud ? 'Synchronisiere...' : 'Firebase Cloud Sync'}</span>
            </button>

            <button
              onClick={handleExport}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
              title="Index als JSON in Zwischenablage kopieren"
            >
              {copiedExport ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
            </button>

            <button
              onClick={handleClear}
              className="p-2 rounded-xl border border-rose-500/30 bg-rose-600/10 text-rose-400 hover:bg-rose-600/20 text-xs transition-colors"
              title="Index leeren"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {statusMessage && (
          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/40 text-blue-300 text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div
            className={`p-3.5 rounded-2xl border ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Indizierte Objekte</span>
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-bold">{stats.totalItems}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Seiten, Lesezeichen & Kacheln</div>
          </div>

          <div
            className={`p-3.5 rounded-2xl border ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Suchbegriffe & Tokens</span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl font-bold font-mono">{stats.totalWords.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Volltext-Tokens im Speicher</div>
          </div>

          <div
            className={`p-3.5 rounded-2xl border ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Index-Größe</span>
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono">{stats.storageSizeKB} KB</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Lokal & persistent gecacht</div>
          </div>

          <div
            className={`p-3.5 rounded-2xl border ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Cloud Status</span>
              <Cloud className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>{userAccount.isLoggedIn ? 'Firestore Aktiv' : 'Lokal gesichert'}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Zero-Trust Browser-Speicher</div>
          </div>
        </div>

        {/* Index Search Bar */}
        <div className="space-y-3">
          <div
            className={`w-full h-12 rounded-2xl flex items-center px-4 gap-3 border shadow-md transition-all ${
              isDarkMode
                ? 'bg-slate-900/90 border-slate-700/80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'
                : 'bg-white border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'
            }`}
          >
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Im gesamten Browser-Index suchen (Titel, Inhalt, Domain, URL, Stichwörter)..."
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-xs text-inherit placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
              >
                Zurücksetzen
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'Alle Einträge' },
              { id: 'page', label: 'Webseiten' },
              { id: 'bookmark', label: 'Lesezeichen' },
              { id: 'history', label: 'Verlauf' },
              { id: 'tile', label: 'Schnellwahl-Kacheln' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isDarkMode
                    ? 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results / Indexed Items List */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>
              {results.length} indizierte {results.length === 1 ? 'Ergebnis' : 'Ergebnisse'}
              {searchQuery && ` für „${searchQuery}“`}
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Volltext-Treffer werden nach Relevanz gewichtet
            </span>
          </div>

          {results.length === 0 ? (
            <div
              className={`p-10 rounded-2xl border text-center ${
                isDarkMode ? 'bg-slate-900/30 border-slate-800/80' : 'bg-white border-slate-200'
              }`}
            >
              <Database className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
              <h3 className="font-semibold text-sm">Keine Einträge im Index gefunden</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Klicken Sie oben auf „Jetzt komplett indizieren“, um alle aktuellen Browserinhalte,
                Kacheln und Lesezeichen in den Index aufzunehmen.
              </p>
              <button
                onClick={handleIndexAll}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
              >
                Browserinhalte jetzt indizieren
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {results.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group ${
                    isDarkMode
                      ? 'bg-slate-900/50 hover:bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
                      : 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="mt-1 flex-shrink-0">
                      {item.favicon ? (
                        <img
                          src={item.favicon}
                          alt=""
                          className="w-4 h-4 rounded-sm"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        getCategoryIcon(item.category)
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span
                          onClick={() => navigateActiveTab(item.url)}
                          className="font-bold text-sm text-blue-500 hover:underline cursor-pointer truncate max-w-md"
                        >
                          {item.title}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {item.category}
                        </span>
                        {item.matchScore && item.matchScore > 0 && (
                          <span className="text-[10px] font-mono text-emerald-400">
                            Score: {item.matchScore}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-1 mb-1">
                        {item.snippet}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                        <span className="truncate max-w-sm">{item.url}</span>
                        <span>·</span>
                        <span>{new Date(item.indexedAt).toLocaleDateString('de-DE')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Item Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                    <button
                      onClick={() => navigateActiveTab(item.url)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Im aktiven Tab öffnen"
                    >
                      <span>Öffnen</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => createTab(item.url, item.title)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="In neuem Tab öffnen"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        browserIndexer.deleteItem(item.id);
                        refreshIndex();
                      }}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-600/10 transition-colors"
                      title="Aus Index entfernen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
