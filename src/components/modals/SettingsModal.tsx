import React, { useState } from 'react';
import { useBrowser } from '../../context/BrowserContext';
import {
  Settings,
  X,
  Moon,
  Sun,
  Shield,
  Cloud,
  KeyRound,
  RefreshCw,
  Search,
  Lock,
  Globe,
  Trash2,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    isDarkMode,
    setIsDarkMode,
    toggleTheme,
    searchEngine,
    setSearchEngine,
    vpnEnabled,
    setVpnEnabled,
    vpnKillSwitch,
    setVpnKillSwitch,
    adblockEnabled,
    setAdblockEnabled,
    blockCryptoMiners,
    setBlockCryptoMiners,
    dnsProvider,
    setDnsProvider,
    autoUpdates,
    setAutoUpdates,
    clearHistory,
    history,
  } = useBrowser();

  const [activeTab, setActiveTab] = useState<'allgemein' | 'vpn' | 'dns' | 'adblock' | 'sicherheit'>('allgemein');

  if (activeModal !== 'settings') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 pb-12 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl p-6 transition-all my-auto ${
          isDarkMode
            ? 'bg-slate-900 border-slate-700/80 text-slate-100 shadow-black/80'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-300'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-200">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Browser-Einstellungen</h3>
              <p className="text-xs text-slate-400">Übersichtlich · Minimalistisch · Keine Untermenüs</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Flat Tabs (Zero-nested submenus) */}
        <div className="flex items-center gap-1 my-4 p-1 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <button
            onClick={() => setActiveTab('allgemein')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'allgemein' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Allgemein
          </button>
          <button
            onClick={() => setActiveTab('vpn')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'vpn' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            VPN
          </button>
          <button
            onClick={() => setActiveTab('dns')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dns' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cloudflare 1.1.1.1
          </button>
          <button
            onClick={() => setActiveTab('adblock')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'adblock' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Adblocker
          </button>
          <button
            onClick={() => setActiveTab('sicherheit')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'sicherheit' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sicherheit
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4 py-2 min-h-[220px]">
          {activeTab === 'allgemein' && (
            <div className="space-y-4">
              {/* Appearance / Dark mode */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div>
                  <span className="text-xs font-semibold block text-slate-200">Design-Modus</span>
                  <span className="text-[11px] text-slate-400">Dunkles oder helles Chromium-Erscheinungsbild</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsDarkMode(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      isDarkMode ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dunkel</span>
                  </button>
                  <button
                    onClick={() => setIsDarkMode(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      !isDarkMode ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Hell</span>
                  </button>
                </div>
              </div>

              {/* Default Search Engine */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div>
                  <span className="text-xs font-semibold block text-slate-200">Standard-Suchmaschine</span>
                  <span className="text-[11px] text-slate-400">Verwendet für Adressleistensuchen</span>
                </div>
                <select
                  value={searchEngine}
                  onChange={(e) => setSearchEngine(e.target.value as any)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white outline-none"
                >
                  <option value="google">Google</option>
                  <option value="duckduckgo">DuckDuckGo (Privat)</option>
                  <option value="brave">Brave Search (Trackerfrei)</option>
                </select>
              </div>

              {/* Clear browsing data */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div>
                  <span className="text-xs font-semibold block text-slate-200">Browserverlauf bereinigen</span>
                  <span className="text-[11px] text-slate-400">Löscht temporäre Daten ({history.length} Einträge)</span>
                </div>
                <button
                  onClick={clearHistory}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Jetzt leeren</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'vpn' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div>
                  <span className="text-xs font-semibold block text-slate-200">Integrierter VPN-Dienst</span>
                  <span className="text-[11px] text-slate-400">Vollständige Verschlüsselung aller Webanfragen</span>
                </div>
                <button
                  onClick={() => setVpnEnabled(!vpnEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    vpnEnabled ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      vpnEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div>
                  <span className="text-xs font-semibold block text-slate-200">VPN Kill-Switch</span>
                  <span className="text-[11px] text-slate-400">Trennt den Datenverkehr bei Verbindungsverlust</span>
                </div>
                <button
                  onClick={() => setVpnKillSwitch(!vpnKillSwitch)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    vpnKillSwitch ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      vpnKillSwitch ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'dns' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-orange-950/20 border border-orange-500/30 text-xs">
                <span className="font-bold text-orange-400 block mb-1">Cloudflare 1.1.1.1 (Standard)</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Schützt Sie davor, dass Ihr Internetanbieter (ISP) nachverfolgt, welche Webseiten Sie aufrufen.
                  Alle DNS-Anfragen erfolgen verschlüsselt über HTTPS (DoH).
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div>
                  <span className="text-xs font-semibold block text-slate-200">DNS-Anbieter</span>
                  <span className="text-[11px] text-slate-400">Kryptografisch gesicherter Resolver</span>
                </div>
                <select
                  value={dnsProvider}
                  onChange={(e) => setDnsProvider(e.target.value as any)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white outline-none"
                >
                  <option value="cloudflare">Cloudflare 1.1.1.1 (Standard)</option>
                  <option value="quad9">Quad9 9.9.9.9 (Malware-Schutz)</option>
                  <option value="google">Google DNS 8.8.8.8</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'adblock' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div>
                  <span className="text-xs font-semibold block text-slate-200">Werbeblocker aktivieren</span>
                  <span className="text-[11px] text-slate-400">Blockiert nervige Anzeigen & Popups</span>
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

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div>
                  <span className="text-xs font-semibold block text-slate-200">Anti-Kryptomining Schutz</span>
                  <span className="text-[11px] text-slate-400">Verhindert heimliches Coin-Mining und CPU-Überlastung</span>
                </div>
                <button
                  onClick={() => setBlockCryptoMiners(!blockCryptoMiners)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    blockCryptoMiners ? 'bg-emerald-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      blockCryptoMiners ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sicherheit' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div>
                  <span className="text-xs font-semibold block text-slate-200">Automatische Sicherheitsupdates</span>
                  <span className="text-[11px] text-slate-400">Regelmäßige Updates für maximalen Schutz</span>
                </div>
                <button
                  onClick={() => setAutoUpdates(!autoUpdates)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
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

              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs">
                <span className="font-semibold text-slate-200 block mb-1">Verschlüsselte Datenspeicherung:</span>
                <p className="text-slate-400 text-[11px]">
                  Passwörter, Cookies und temporäre Daten werden mit modernstem AES-256-GCM verschlüsselt gespeichert.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
