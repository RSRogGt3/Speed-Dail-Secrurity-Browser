import React, { useState, useEffect } from 'react';
import { useBrowser } from '../../context/BrowserContext';
import { Star, X, Trash2, Globe, Database, Folder, Check, ExternalLink } from 'lucide-react';

export const BookmarkModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    activeTab,
    editingBookmark,
    setEditingBookmark,
    addBookmark,
    editBookmark,
    deleteBookmark,
    isDarkMode,
    userAccount,
  } = useBrowser();

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [folder, setFolder] = useState('Favoriten');
  const [isSaving, setIsSaving] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const isEditing = !!editingBookmark;

  useEffect(() => {
    if (activeModal === 'bookmark') {
      if (editingBookmark) {
        setTitle(editingBookmark.title);
        setUrl(editingBookmark.url);
        setFolder(editingBookmark.folder || 'Favoriten');
      } else {
        // Pre-fill with active tab if not SpeedDial
        if (activeTab.url !== 'aura://speeddial' && !activeTab.url.startsWith('aura://')) {
          setTitle(activeTab.title);
          setUrl(activeTab.url);
        } else {
          setTitle('');
          setUrl('');
        }
        setFolder('Favoriten');
      }
      setSuccessNotice(null);
    }
  }, [activeModal, editingBookmark, activeTab]);

  if (activeModal !== 'bookmark') return null;

  const handleClose = () => {
    setEditingBookmark(null);
    setActiveModal('none');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    setIsSaving(true);
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://') && !targetUrl.startsWith('aura://')) {
      targetUrl = 'https://' + targetUrl;
    }

    if (isEditing && editingBookmark) {
      await editBookmark(editingBookmark.id, {
        title: title.trim(),
        url: targetUrl,
        folder: folder.trim(),
      });
      setSuccessNotice('Lesezeichen in Firestore aktualisiert!');
    } else {
      await addBookmark(title.trim(), targetUrl, folder.trim());
      setSuccessNotice('Lesezeichen in Firestore gespeichert!');
    }

    setIsSaving(false);
    setTimeout(() => {
      handleClose();
    }, 800);
  };

  const handleDelete = async () => {
    if (!editingBookmark) return;
    setIsSaving(true);
    await deleteBookmark(editingBookmark.id);
    setIsSaving(false);
    handleClose();
  };

  const folderSuggestions = ['Favoriten', 'Entwicklung', 'Arbeit', 'Nachrichten', 'Soziales', 'Finanzen'];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pb-12 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 transition-all my-auto ${
          isDarkMode
            ? 'bg-slate-900 border-slate-700/80 text-slate-100 shadow-black/80'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-300'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-700/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {isEditing ? 'Lesezeichen bearbeiten' : 'Lesezeichen hinzufügen'}
              </h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-400" />
                <span>Speicherung in Firestore-Datenbank</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success toast */}
        {successNotice && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="py-4 space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Titel der Webseite</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Google Mail oder Tagesschau"
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Webadresse (URL)</label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-amber-400 font-mono text-[11px] transition-colors"
              />
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Ordner / Kategorie</label>
            <div className="relative mb-2">
              <input
                type="text"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                placeholder="Favoriten"
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-amber-400 transition-colors"
              />
              <Folder className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>

            {/* Folder chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {folderSuggestions.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFolder(f)}
                  className={`px-2 py-0.5 rounded-md text-[10px] border transition-colors ${
                    folder === f
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Database Info Card */}
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300">
                {userAccount.isLoggedIn ? `Konto: ${userAccount.email}` : 'Lokales Profil & Firestore'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Collection: bookmarks</span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-2">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className="px-3 py-2 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 font-medium flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Löschen</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 transition-colors shadow-md disabled:opacity-50"
              >
                <Star className="w-3.5 h-3.5 fill-slate-950" />
                <span>{isSaving ? 'Speichere...' : isEditing ? 'Speichern' : 'Hinzufügen'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
