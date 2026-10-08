import React, { useState } from 'react';
import { useBrowser } from '../../context/BrowserContext';
import { Plus, X, Globe } from 'lucide-react';

export const AddTileModal: React.FC = () => {
  const { activeModal, setActiveModal, addTile, isDarkMode } = useBrowser();

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [color, setColor] = useState('bg-blue-600');

  if (activeModal !== 'addTile') return null;

  const colorOptions = [
    { label: 'Blau', class: 'bg-[#003580]' },
    { label: 'Hellblau', class: 'bg-[#1D9BF0]' },
    { label: 'Rot', class: 'bg-[#FF4747]' },
    { label: 'Orange', class: 'bg-[#FF5722]' },
    { label: 'Lila', class: 'bg-[#5865F2]' },
    { label: 'Grün', class: 'bg-[#10B981]' },
    { label: 'Dunkelgrau', class: 'bg-[#1E293B]' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }
    const domain = targetUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

    addTile(title.trim(), targetUrl, domain, color);
    setTitle('');
    setUrl('');
    setActiveModal('none');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full max-w-sm rounded-2xl border shadow-2xl p-6 transition-all ${
          isDarkMode
            ? 'bg-slate-900 border-slate-700/80 text-slate-100 shadow-black/80'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-300'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/30">
          <h3 className="font-bold text-sm">Schnellwahl-Kachel hinzufügen</h3>
          <button
            onClick={() => setActiveModal('none')}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Titel</label>
            <input
              type="text"
              placeholder="z.B. GitHub, Reddit, Wikipedia"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Web-Adresse (URL)</label>
            <input
              type="text"
              placeholder="z.B. github.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Kachelfarbe</label>
            <div className="flex gap-2">
              {colorOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.class}
                  onClick={() => setColor(opt.class)}
                  className={`w-6 h-6 rounded-full ${opt.class} ${
                    color === opt.class ? 'ring-2 ring-white scale-110' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setActiveModal('none')}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
            >
              Hinzufügen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
