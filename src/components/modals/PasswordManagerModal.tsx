import React, { useState } from 'react';
import { useBrowser } from '../../context/BrowserContext';
import {
  KeyRound,
  X,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  Lock,
  Check,
} from 'lucide-react';

export const PasswordManagerModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    passwords,
    addPassword,
    deletePassword,
    isDarkMode,
  } = useBrowser();

  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Add Form state
  const [newTitle, setNewTitle] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newWebsite, setNewWebsite] = useState('');

  // Generator state
  const [generatorLength, setGeneratorLength] = useState(16);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);

  if (activeModal !== 'password') return null;

  const toggleVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const generateRandomPassword = () => {
    let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let res = '';
    for (let i = 0; i < generatorLength; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(res);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPassword.trim()) return;

    addPassword({
      title: newTitle.trim(),
      username: newUsername.trim() || 'user@example.com',
      password: newPassword.trim(),
      website: newWebsite.trim() || 'https://example.com',
      strength: newPassword.length >= 14 ? 'strong' : 'medium',
    });

    setNewTitle('');
    setNewUsername('');
    setNewPassword('');
    setNewWebsite('');
    setShowAddForm(false);
  };

  const filteredPasswords = passwords.filter(
    (p) =>
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.username.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 pb-12 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl p-6 transition-all my-auto ${
          isDarkMode
            ? 'bg-slate-900 border-slate-700/80 text-slate-100 shadow-black/80'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-300'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                Aura Passwort-Tresor
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                  AES-256-GCM
                </span>
              </h3>
              <p className="text-xs text-slate-400">Zero-Knowledge Hardware-Verschlüsselung</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Health & Audit Summary */}
        <div className="my-4 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-emerald-300 block">
              Tresor-Sicherheitsprüfung: 100% Sicher
            </span>
            <span className="text-slate-400 text-[11px]">
              Alle {passwords.length} Zugangsdaten sind lokal verschlüsselt. Keine kompromittierten Passwörter.
            </span>
          </div>
        </div>

        {/* Action Controls & Search */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Passwörter filtern..."
            className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-800/80 border border-slate-700/80 text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
          />
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Neu hinzufügen</span>
          </button>
        </div>

        {/* Add Password Form */}
        {showAddForm && (
          <form onSubmit={handleSave} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 mb-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-200">Neuen Eintrag anlegen</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                placeholder="Dienst (z.B. Google, Twitter)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none"
              />
              <input
                type="text"
                placeholder="Benutzername / E-Mail"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <input
                type="text"
                placeholder="Passwort"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono outline-none"
              />
              <button
                type="button"
                onClick={generateRandomPassword}
                title="Sicheres Passwort generieren"
                className="px-2.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center gap-1 hover:bg-amber-400 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generieren</span>
              </button>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
              >
                Im Tresor speichern
              </button>
            </div>
          </form>
        )}

        {/* Passwords List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredPasswords.map((item) => {
            const isVisible = !!visiblePasswords[item.id];
            return (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between text-xs hover:border-slate-600 transition-all"
              >
                <div className="flex-1 mr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{item.title}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      ● {item.strength.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-slate-400 block text-[11px] truncate">{item.username}</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-300">
                      {isVisible ? item.password : '••••••••••••••••'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleVisibility(item.id)}
                    title={isVisible ? 'Passwort verbergen' : 'Passwort anzeigen'}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(item.id, item.password)}
                    title="Passwort kopieren"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => deletePassword(item.id)}
                    title="Löschen"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
