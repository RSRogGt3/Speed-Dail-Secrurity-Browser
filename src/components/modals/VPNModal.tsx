import React from 'react';
import { useBrowser } from '../../context/BrowserContext';
import {
  Shield,
  X,
  Globe,
  Zap,
  Lock,
  Wifi,
  Check,
  ChevronDown,
  Info,
} from 'lucide-react';

export const VPNModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    vpnEnabled,
    setVpnEnabled,
    activeNode,
    setActiveNode,
    vpnNodes,
    vpnTrafficMB,
    vpnKillSwitch,
    setVpnKillSwitch,
    isDarkMode,
  } = useBrowser();

  if (activeModal !== 'vpn') return null;

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
            <div className={`p-2 rounded-xl ${vpnEnabled ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                Aura VPN
                {vpnEnabled && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                    GESCHÜTZT
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">Zero-Log Tunnel · 256-Bit ChaCha20/AES</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big On/Off Toggle Button */}
        <div className="py-5 flex flex-col items-center">
          <button
            onClick={() => setVpnEnabled(!vpnEnabled)}
            className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-between transition-all shadow-md ${
              vpnEnabled
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30 hover:brightness-110'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full ${vpnEnabled ? 'bg-emerald-300 animate-pulse' : 'bg-slate-500'}`} />
              <span>{vpnEnabled ? 'VPN ist Aktiviert' : 'VPN ist Deaktiviert'}</span>
            </div>
            <span className="text-xs font-mono uppercase tracking-wider opacity-90">
              {vpnEnabled ? 'Trennen' : 'Verbinden'}
            </span>
          </button>
        </div>

        {/* Current Node / Server Selector */}
        <div className="mb-4">
          <label className="text-xs font-medium text-slate-400 block mb-2">
            Virtueller Standort (Exit-Node)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {vpnNodes.map((node) => {
              const isSelected = activeNode.id === node.id;
              return (
                <button
                  key={node.id}
                  disabled={!vpnEnabled}
                  onClick={() => setActiveNode(node)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    !vpnEnabled
                      ? 'opacity-40 cursor-not-allowed border-slate-800 bg-slate-900/40'
                      : isSelected
                      ? 'border-blue-500 bg-blue-500/10 text-white font-medium ring-1 ring-blue-500/30'
                      : 'border-slate-700/60 bg-slate-800/40 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{node.flag}</span>
                    <div>
                      <span className="block font-medium">{node.city}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{node.ip}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">{node.ping}ms</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Traffic Stats & Obfuscation */}
        <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-4 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-400" /> Verschlüsselter Datenverkehr:
            </span>
            <span className="font-mono font-bold text-white">{vpnTrafficMB} MB</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" /> Sichtbare IP für Webseiten:
            </span>
            <span className="font-mono font-bold text-emerald-400">
              {vpnEnabled ? activeNode.ip : 'Ihre echte IP (ungeschützt)'}
            </span>
          </div>
        </div>

        {/* Kill Switch Toggle */}
        <div className="flex items-center justify-between py-2 border-t border-slate-700/30">
          <div>
            <span className="text-xs font-semibold block text-slate-200">Not-Aus (Kill-Switch)</span>
            <span className="text-[11px] text-slate-400">Blockiert Internetverbindung bei VPN-Abbruch</span>
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
    </div>
  );
};
