import React, { useState } from 'react';
import { useBrowser } from '../../context/BrowserContext';
import {
  Cloud,
  X,
  Check,
  ShieldCheck,
  Zap,
  Globe,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { DNSProvider } from '../../types/browser';

export const DNSModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    dnsProvider,
    setDnsProvider,
    dnssecActive,
    setDnssecActive,
    dnsLatency,
    isDarkMode,
  } = useBrowser();

  const [testingPing, setTestingPing] = useState(false);
  const [currentPing, setCurrentPing] = useState(dnsLatency);

  if (activeModal !== 'dns') return null;

  const testDnsSpeed = () => {
    setTestingPing(true);
    setTimeout(() => {
      setTestingPing(false);
      setCurrentPing(Math.floor(Math.random() * 5) + 7); // 7 to 11 ms
    }, 800);
  };

  const providers: { id: DNSProvider; name: string; ip: string; desc: string; badge: string }[] = [
    {
      id: 'cloudflare',
      name: 'Cloudflare 1.1.1.1',
      ip: '1.1.1.1 · 1.0.0.1 (DoH)',
      desc: 'Standardmäßig aktiviert. Schnellster DNS der Welt, striktes Zero-Log-Versprechen von Cloudflare.',
      badge: 'Standard & Empfohlen',
    },
    {
      id: 'quad9',
      name: 'Quad9 (9.9.9.9)',
      ip: '9.9.9.9 · 149.112.112.112',
      desc: 'Schweizer Datenschutz-Stiftung mit automatischem Echtzeit-Schutz vor Phishing & Malware.',
      badge: 'Malware-Filter',
    },
    {
      id: 'google',
      name: 'Google Public DNS',
      ip: '8.8.8.8 · 8.8.4.4',
      desc: 'Hohe weltweite Verfügbarkeit mit DNS-over-HTTPS Unterstützung.',
      badge: 'Google Global',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
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
            <div className="p-2 rounded-xl bg-orange-500 text-white font-bold">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                Cloudflare 1.1.1.1 DNS
                <span className="text-[10px] bg-orange-500/20 text-orange-400 font-mono px-2 py-0.5 rounded-full border border-orange-500/30 font-semibold">
                  DoH AKTIV
                </span>
              </h3>
              <p className="text-xs text-slate-400">DNS over HTTPS · Verschlüsselte Namensauflösung</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Performance & Status Card */}
        <div className="my-4 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 block text-[11px]">Aktuelle Auflösungszeit (Latenz):</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-mono text-orange-400">{currentPing} ms</span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Extrem schnell
              </span>
            </div>
          </div>
          <button
            onClick={testDnsSpeed}
            disabled={testingPing}
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingPing ? 'animate-spin' : ''}`} />
            <span>Ping testen</span>
          </button>
        </div>

        {/* DNS Provider Selector */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-semibold text-slate-300 block">
            Ausgewählter DNS-Resolver:
          </label>
          {providers.map((p) => {
            const isSelected = dnsProvider === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setDnsProvider(p.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-orange-500 bg-orange-500/10 text-white ring-1 ring-orange-500/30'
                    : 'border-slate-700/60 bg-slate-800/40 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{p.name}</span>
                    <span className="text-[10px] font-mono text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded">
                      {p.badge}
                    </span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-orange-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</p>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">{p.ip}</span>
              </div>
            );
          })}
        </div>

        {/* DNSSEC Toggle */}
        <div className="flex items-center justify-between py-2 border-t border-slate-700/30 text-xs">
          <div>
            <span className="font-semibold block text-slate-200">Kryptografisches DNSSEC</span>
            <span className="text-[11px] text-slate-400">Verhindert DNS-Spoofing und gefälschte Webseiten</span>
          </div>
          <button
            onClick={() => setDnssecActive(!dnssecActive)}
            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
              dnssecActive ? 'bg-orange-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                dnssecActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
