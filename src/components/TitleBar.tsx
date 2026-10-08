import React from 'react';
import { useBrowser } from '../context/BrowserContext';
import { Plus, X, Minus, Square, Search, Download, Camera } from 'lucide-react';

export const TitleBar: React.FC = () => {
  const {
    tabs,
    activeTabId,
    setActiveTabId,
    createTab,
    closeTab,
    isDarkMode,
    setActiveModal,
  } = useBrowser();

  return (
    <div
      className={`h-10 flex items-center select-none text-xs border-b transition-colors ${
        isDarkMode
          ? 'bg-slate-900 border-slate-800 text-slate-300'
          : 'bg-slate-100 border-slate-300 text-slate-700'
      }`}
    >
      {/* Opera/Chromium Red Logo Icon */}
      <div className="flex items-center pl-3 pr-2 py-1">
        <button
          onClick={() => setActiveModal('security')}
          title="Chromium Aura Security Center"
          className="w-5 h-5 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-sm hover:scale-105 active:scale-95 transition-transform"
        >
          <div className="w-2.5 h-3.5 rounded-full border-2 border-white"></div>
        </button>
      </div>

      {/* Tabs Container */}
      <div className="flex-1 flex items-center overflow-x-auto no-scrollbar gap-1 px-1 h-full pt-1.5">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`group relative flex items-center gap-2 px-3 py-1.5 max-w-[210px] min-w-[120px] h-full rounded-t-lg text-xs cursor-pointer transition-all border-t border-l border-r ${
                isActive
                  ? isDarkMode
                    ? 'bg-slate-800/90 text-white font-medium border-slate-700/60 shadow-sm'
                    : 'bg-white text-slate-900 font-medium border-slate-200 shadow-sm'
                  : isDarkMode
                  ? 'bg-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border-transparent'
                  : 'bg-transparent text-slate-600 hover:bg-slate-200/50 hover:text-slate-800 border-transparent'
              }`}
            >
              {/* Tab Favicon or Dot */}
              <div className="flex-shrink-0">
                {tab.url.startsWith('aura://speeddial') ? (
                  <div className="w-3.5 h-3.5 rounded-sm bg-red-500/20 text-red-400 flex items-center justify-center text-[9px] font-bold">
                    O
                  </div>
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[8px]">
                    🌐
                  </div>
                )}
              </div>

              {/* Tab Title */}
              <span className="truncate flex-1 text-[12px]">{tab.title}</span>

              {/* Close Tab Button */}
              <button
                onClick={(e) => closeTab(tab.id, e)}
                className={`opacity-0 group-hover:opacity-100 p-0.5 rounded-full transition-all ${
                  isDarkMode
                    ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
                    : 'hover:bg-slate-200 text-slate-500 hover:text-slate-800'
                }`}
                title="Tab schließen"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* New Tab Button */}
        <button
          onClick={() => createTab()}
          title="Neuer Tab (Strg+T)"
          className={`p-1 rounded-md transition-colors ml-1 ${
            isDarkMode
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top right quick utilities */}
      <div className="flex items-center gap-1 px-2 border-r border-slate-700/30">
        <button
          onClick={() => createTab('https://search.brave.com', 'Suche')}
          title="In Tabs suchen"
          className={`p-1.5 rounded-md transition-colors ${
            isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setActiveModal('security')}
          title="Schnappschuss & Sicherheitscheck"
          className={`p-1.5 rounded-md transition-colors ${
            isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Window Controls (Minimize, Maximize, Close) */}
      <div className="flex items-center">
        <button
          className={`w-9 h-8 flex items-center justify-center transition-colors ${
            isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600'
          }`}
          title="Minimieren"
        >
          <Minus className="w-3 h-3" />
        </button>
        <button
          className={`w-9 h-8 flex items-center justify-center transition-colors ${
            isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600'
          }`}
          title="Maximieren"
        >
          <Square className="w-2.5 h-2.5" />
        </button>
        <button
          className="w-9 h-8 flex items-center justify-center hover:bg-red-600 text-slate-400 hover:text-white transition-colors"
          title="Schließen"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
