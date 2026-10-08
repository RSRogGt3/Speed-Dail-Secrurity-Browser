import React from 'react';
import { useBrowser } from '../../context/BrowserContext';
import {
  ShieldCheck,
  Shield,
  X,
  EyeOff,
  Cpu,
  Layers,
  Check,
  AlertCircle,
} from 'lucide-react';

export const AdblockModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    adblockEnabled,
    setAdblockEnabled,
    adsBlockedCount,
    trackersBlockedCount,
    cryptoMinersBlockedCount,
    blockTrackers,
    setBlockTrackers,
    blockCryptoMiners,
    setBlockCryptoMiners,
    activeTab,
    whitelistedDomains,
    toggleWhitelistDomain,
    isDarkMode,
  } = useBrowser();

  if (activeModal !== 'adblock') return null;

  const currentDomain = activeTab.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  const isWhitelisted = whitelistedDomains.includes(currentDomain);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 transition-all ${
          isDarkMode
            ? 'bg-slate-900 border-slate-700/80 text-slate-100 shadow-black/80'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-300'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/30">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${adblockEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                Aura Adblock & Tracker-Schutz
              </h3>
              <p className="text-xs text-slate-400">Ultraschnelle uBlock-Origin-kompatible Engine</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Master Toggle */}
        <div className="py-4 flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold block text-slate-200">
              Werbe- und Tracker-Blocker
            </span>
            <span className="text-xs text-slate-400">
              Filtert aufdringliche Banner, Video-Ads und Popups
            </span>
          </div>
          <button
            onClick={() => setAdblockEnabled(!adblockEnabled)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              adblockEnabled ? 'bg-emerald-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                adblockEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Total Statistics Cards */}
        <div className="grid grid-cols-3 gap-2 my-2">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block mb-0.5">Werbeanzeigen</span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              {adsBlockedCount.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block mb-0.5">Tracker & Pixel</span>
            <span className="text-xl font-bold font-mono text-blue-400">
              {trackersBlockedCount.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block mb-0.5">Kryptominer</span>
            <span className="text-xl font-bold font-mono text-amber-400">
              {cryptoMinersBlockedCount}
            </span>
          </div>
        </div>

        {/* Current Site Whitelist Toggle */}
        {activeTab.url.startsWith('http') && (
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 my-3 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold block text-white">{currentDomain}</span>
              <span className="text-slate-400 text-[11px]">
                {isWhitelisted ? 'Schutz für diese Seite deaktiviert' : 'Schutz aktiv'}
              </span>
            </div>
            <button
              onClick={() => toggleWhitelistDomain(currentDomain)}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors ${
                isWhitelisted
                  ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
            >
              {isWhitelisted ? 'Aktivieren' : 'Ausnahme erlauben'}
            </button>
          </div>
        )}

        {/* Granular Protections */}
        <div className="space-y-3 pt-3 border-t border-slate-700/30 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <EyeOff className="w-4 h-4 text-purple-400" />
              <span>Anti-Fingerprinting (Canvas / Audio Schutz)</span>
            </div>
            <button
              onClick={() => setBlockTrackers(!blockTrackers)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                blockTrackers ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  blockTrackers ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>Kryptominer-Schutz (CoinHive / WebMiner)</span>
            </div>
            <button
              onClick={() => setBlockCryptoMiners(!blockCryptoMiners)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                blockCryptoMiners ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  blockCryptoMiners ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
