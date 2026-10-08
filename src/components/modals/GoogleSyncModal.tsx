import React, { useState } from 'react';
import { useBrowser } from '../../context/BrowserContext';
import {
  RefreshCw,
  X,
  Check,
  Shield,
  KeyRound,
  Star,
  Clock,
  Layers,
  SlidersHorizontal,
  LogOut,
  LogIn,
  UserPlus,
  Database,
  Lock,
  AlertCircle,
} from 'lucide-react';

export const GoogleSyncModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    userAccount,
    registerUser,
    loginUser,
    loginGoogle,
    logoutGoogle,
    toggleSyncItem,
    syncNow,
    isSyncing,
    isDarkMode,
  } = useBrowser();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (activeModal !== 'sync') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    if (authMode === 'register') {
      const result = await registerUser(emailInput.trim(), passwordInput, nameInput.trim());
      setIsSubmitting(false);
      if (!result.success) {
        setAuthError(result.error || 'Registrierung fehlgeschlagen.');
      } else {
        setEmailInput('');
        setPasswordInput('');
        setNameInput('');
      }
    } else {
      const result = await loginUser(emailInput.trim(), passwordInput);
      setIsSubmitting(false);
      if (!result.success) {
        setAuthError(result.error || 'Anmeldung fehlgeschlagen.');
      } else {
        setEmailInput('');
        setPasswordInput('');
        setNameInput('');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 pb-12 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 transition-all my-auto ${
          isDarkMode
            ? 'bg-slate-900 border-slate-700/80 text-slate-100 shadow-black/80'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-300'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-xs">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Benutzerkonto & Cloud-Sync</h3>
              <p className="text-xs text-slate-400">Verschlüsselt in gesicherter Aura-Datenbank</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {userAccount.isLoggedIn ? (
          /* LOGGED IN VIEW */
          <div className="py-4 space-y-4">
            {/* Account Profile Card */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={userAccount.avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'}
                  alt={userAccount.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">{userAccount.name || 'Benutzer'}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">{userAccount.email}</p>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Datenbank-Sync: {userAccount.lastSynced}
                  </span>
                </div>
              </div>

              <button
                onClick={syncNow}
                disabled={isSyncing}
                title="Jetzt mit Datenbank synchronisieren"
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Database storage badge */}
            <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs text-slate-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                Einstellungen & Daten sind sicher in der <strong>Aura Persistent Database</strong> hinterlegt.
              </span>
            </div>

            {/* Sync Item Toggles */}
            <div>
              <span className="text-xs font-semibold text-slate-300 block mb-2">
                Synchronisierte Datenumfänge:
              </span>
              <div className="space-y-2 text-xs">
                <div
                  onClick={() => toggleSyncItem('settings')}
                  className="p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                    <span>Browser-Einstellungen (Design, DNS, Suchmaschine)</span>
                  </div>
                  <span className={`text-[10px] font-bold ${userAccount.syncItems.settings ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {userAccount.syncItems.settings ? 'AN' : 'AUS'}
                  </span>
                </div>

                <div
                  onClick={() => toggleSyncItem('passwords')}
                  className="p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>Passwort-Tresor (AES-256-GCM)</span>
                  </div>
                  <span className={`text-[10px] font-bold ${userAccount.syncItems.passwords ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {userAccount.syncItems.passwords ? 'AN' : 'AUS'}
                  </span>
                </div>

                <div
                  onClick={() => toggleSyncItem('bookmarks')}
                  className="p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Lesezeichen & Schnellwahl-Kacheln</span>
                  </div>
                  <span className={`text-[10px] font-bold ${userAccount.syncItems.bookmarks ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {userAccount.syncItems.bookmarks ? 'AN' : 'AUS'}
                  </span>
                </div>

                <div
                  onClick={() => toggleSyncItem('history')}
                  className="p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>Verlauf & Sitzungsdaten</span>
                  </div>
                  <span className={`text-[10px] font-bold ${userAccount.syncItems.history ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {userAccount.syncItems.history ? 'AN' : 'AUS'}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout button */}
            <div className="pt-2 border-t border-slate-700/30 flex justify-between items-center">
              <span className="text-[11px] text-slate-400">
                Ende-zu-Ende verschlüsselt
              </span>
              <button
                onClick={logoutGoogle}
                className="px-3 py-1.5 rounded-lg text-xs bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Abmelden</span>
              </button>
            </div>
          </div>
        ) : (
          /* LOGGED OUT / REGISTER OR LOGIN VIEW */
          <div className="py-4 space-y-4 text-xs">
            {/* Tabs: Anmelden vs Registrieren */}
            <div className="flex p-1 rounded-xl bg-slate-800 border border-slate-700">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthError(null);
                }}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                  authMode === 'login' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Anmelden
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setAuthError(null);
                }}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                  authMode === 'register' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Eigenständig registrieren
              </button>
            </div>

            <p className="text-slate-400 leading-relaxed">
              {authMode === 'register'
                ? 'Erstellen Sie Ihr persönliches Benutzerkonto. Ihre Passwörter, Schnellwahl-Kacheln und Einstellungen werden sicher in der Datenbank hinterlegt.'
                : 'Melden Sie sich an, um Ihre gespeicherten Einstellungen und Daten aus der Datenbank zu laden.'}
            </p>

            {authError && (
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {authMode === 'register' && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Benutzername / Name</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="z.B. Alex"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1">E-Mail-Adresse</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="ihre.email@example.com"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Passwort</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Mindestens 6 Zeichen"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                {authMode === 'register' ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                <span>
                  {isSubmitting
                    ? 'Verarbeite...'
                    : authMode === 'register'
                    ? 'Konto in Datenbank erstellen'
                    : 'Jetzt anmelden'}
                </span>
              </button>
            </form>

            <div className="relative my-3 pt-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/80"></div>
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-slate-900 px-2 text-slate-400">Oder über Firebase Auth</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                setIsSubmitting(true);
                setAuthError(null);
                try {
                  await loginGoogle();
                } catch (err: any) {
                  setAuthError(err?.message || 'Google-Anmeldung fehlgeschlagen.');
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium flex items-center justify-center gap-2.5 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Mit Google anmelden (Firebase Cloud)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
