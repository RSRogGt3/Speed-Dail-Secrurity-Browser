import React from 'react';
import { useBrowser } from '../../context/BrowserContext';
import {
  ShieldAlert,
  ShieldCheck,
  X,
  Lock,
  RefreshCw,
  Cpu,
  Layers,
  Check,
  Terminal,
  Zap,
} from 'lucide-react';

export const SecurityModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    autoUpdates,
    setAutoUpdates,
    securityStatus,
    checkSecurityUpdates,
    isDarkMode,
  } = useBrowser();

  if (activeModal !== 'security') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 pb-12 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 transition-all my-auto ${
          isDarkMode
            ? 'bg-slate-900 border-slate-700/80 text-slate-100 shadow-black/80'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-300'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                Ultra-Sicherheitszentrum
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                  STUFE: MAXIMUM
                </span>
              </h3>
              <p className="text-xs text-slate-400">Hardened Chromium Kernel · Zero-Trust Architektur</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Priority Status Grid */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
              <Lock className="w-4 h-4" />
              <span>Verschlüsselte Speicherung</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Lokale Browserdaten (Passwörter, Cookies, Cache) werden mit <strong>AES-256-GCM</strong> verschlüsselt gespeichert.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs">
            <div className="flex items-center gap-1.5 text-blue-400 font-semibold mb-1">
              <Layers className="w-4 h-4" />
              <span>Tab-Sandbox Isolation</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Jeder Tab läuft in einem isolierten OS-Prozess mit strikter Speicherbegrenzung (Blink Site Isolation).
            </p>
          </div>
        </div>

        {/* Automatic Security Updates Card */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                Automatische Sicherheitsupdates
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Kryptografisch signierte Zero-Day Patches im Hintergrund installieren
              </p>
            </div>

            <button
              onClick={() => setAutoUpdates(!autoUpdates)}
              className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                autoUpdates ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  autoUpdates ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 text-[11px]">Version: </span>
              <span className="font-mono text-white text-[11px]">{securityStatus.browserVersion}</span>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Letzte Überprüfung: {securityStatus.lastUpdateCheck}
              </div>
            </div>

            <button
              onClick={checkSecurityUpdates}
              disabled={securityStatus.checkingUpdate}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${securityStatus.checkingUpdate ? 'animate-spin' : ''}`} />
              <span>{securityStatus.checkingUpdate ? 'Prüfe...' : 'Jetzt prüfen'}</span>
            </button>
          </div>
        </div>

        {/* Additional Hardening Measures */}
        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/30 flex items-center justify-between">
            <span className="text-slate-300">WebRTC IP-Leck Schutz (mDNS Host-Isolation)</span>
            <span className="text-emerald-400 font-semibold font-mono text-[10px]">AKTIV</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/30 flex items-center justify-between">
            <span className="text-slate-300">Anti-Kryptomining Schutz (CoinHive / WebMiner Blocker)</span>
            <span className="text-emerald-400 font-semibold font-mono text-[10px]">AKTIV (CPU GESCHÜTZT)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/30 flex items-center justify-between">
            <span className="text-slate-300">Anti-Fingerprinting (Canvas / Font Randomizer)</span>
            <span className="text-emerald-400 font-semibold font-mono text-[10px]">AKTIV</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/30 flex items-center justify-between">
            <span className="text-slate-300">Automatische Cookie-Vernichtung beim Schließen</span>
            <span className="text-emerald-400 font-semibold font-mono text-[10px]">AKTIV</span>
          </div>
        </div>
      </div>
    </div>
  );
};
