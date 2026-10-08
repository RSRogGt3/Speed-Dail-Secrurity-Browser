/**
 * Browser Content Indexing Engine
 * Full-text indexing, fuzzy search, keyword tokenization, and Firestore persistence
 */
import { collection, doc, setDoc, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export interface IndexItem {
  id: string;
  url: string;
  title: string;
  snippet: string;
  content: string;
  keywords: string[];
  category: 'page' | 'bookmark' | 'history' | 'tile' | 'search';
  domain: string;
  favicon?: string;
  indexedAt: string;
  matchScore?: number;
}

export interface IndexStats {
  totalItems: number;
  totalWords: number;
  categories: Record<string, number>;
  lastIndexed?: string;
  storageSizeKB: number;
}

const STORAGE_KEY = 'aura_browser_index';

// Helper: Extract tokens and keywords from text
export function tokenizeText(text: string): string[] {
  if (!text) return [];
  const clean = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2);
  return Array.from(new Set(clean));
}

// Helper: Extract domain from URL
export function extractDomain(url: string): string {
  try {
    if (url.startsWith('aura://')) return 'aura';
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return 'web';
  }
}

class BrowserIndexService {
  private items: Map<string, IndexItem> = new Map();
  private isLoaded: boolean = false;

  constructor() {
    this.loadFromLocalStorage();
  }

  // Load index from local storage
  public loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: IndexItem[] = JSON.parse(raw);
        this.items.clear();
        for (const item of parsed) {
          this.items.set(item.id, item);
        }
      }
    } catch (e) {
      console.warn('Could not load browser index from localStorage:', e);
    }
    this.isLoaded = true;
  }

  // Save index to local storage
  private saveToLocalStorage() {
    try {
      const arr = Array.from(this.items.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {
      console.warn('Could not save browser index to localStorage:', e);
    }
  }

  // Generate deterministic ID from URL and category
  private generateId(url: string, category: string): string {
    const cleanUrl = url.trim().toLowerCase().replace(/\/+$/, '');
    return `idx-${category}-${encodeURIComponent(cleanUrl).slice(0, 80)}`;
  }

  // Index a single webpage or browser item
  public indexItem(
    url: string,
    title: string,
    snippet: string = '',
    content: string = '',
    category: IndexItem['category'] = 'page',
    favicon?: string
  ): IndexItem {
    if (!url || !title) return {} as IndexItem;

    const id = this.generateId(url, category);
    const domain = extractDomain(url);
    const fullText = `${title} ${snippet} ${content} ${domain}`;
    const keywords = tokenizeText(fullText);

    const item: IndexItem = {
      id,
      url,
      title: title.trim(),
      snippet: snippet.trim() || `Indizierte Seite auf ${domain}`,
      content: content.slice(0, 15000), // bounded fulltext
      keywords,
      category,
      domain,
      favicon: favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
      indexedAt: new Date().toISOString(),
    };

    this.items.set(id, item);
    this.saveToLocalStorage();
    return item;
  }

  // Bulk index all current browser contents
  public indexAllBrowserContent(
    bookmarks: Array<{ title: string; url: string }>,
    history: Array<{ title: string; url: string; visitedAt?: any }>,
    tiles: Array<{ title: string; url: string }>,
    tabs: Array<{ title: string; url: string }>
  ): number {
    let count = 0;

    // 1. Index Speed Dial Tiles
    for (const tile of tiles) {
      if (tile.url && tile.title) {
        this.indexItem(tile.url, tile.title, `Schnellwahl-Kachel im Chromium Aura Browser`, tile.title, 'tile');
        count++;
      }
    }

    // 2. Index Bookmarks
    for (const b of bookmarks) {
      if (b.url && b.title) {
        this.indexItem(b.url, b.title, `Gespeichertes Lesezeichen: ${b.title}`, `${b.title} ${b.url}`, 'bookmark');
        count++;
      }
    }

    // 3. Index History
    for (const h of history) {
      if (h.url && h.title) {
        this.indexItem(h.url, h.title, `Besuchte Seite aus dem Browserverlauf`, `${h.title} ${h.url}`, 'history');
        count++;
      }
    }

    // 4. Index active tabs
    for (const t of tabs) {
      if (t.url && t.title && !t.url.startsWith('aura://')) {
        this.indexItem(t.url, t.title, `Geöffneter Tab im Browser`, `${t.title} ${t.url}`, 'page');
        count++;
      }
    }

    // Pre-index built-in internal browser services
    this.indexItem(
      'aura://speeddial',
      'Speed Dial Startseite',
      'Startseite mit Schnellwahl-Kacheln, Wetterbericht und deutscher Google-Suche',
      'startseite speeddial wetter oslo google lesezeichen aura browser',
      'page'
    );
    this.indexItem(
      'aura://indexer',
      'Browser-Inhalts-Index',
      'Vollständige Indizierung aller Browserinhalte, Webseiten, Lesezeichen und Verläufe',
      'index indizierung inhalt volltextsuche cache datenbank durchsuchen',
      'page'
    );
    this.indexItem(
      'aura://settings',
      'Browser-Einstellungen',
      'Datenschutz, Cloudflare 1.1.1.1 DoH, VPN, Adblocker und Kryptominingschutz',
      'einstellungen vpn adblock dns doh sicherheit datenschutz',
      'page'
    );

    this.saveToLocalStorage();
    return count;
  }

  // Search across the full index
  public search(
    query: string,
    categoryFilter: string = 'all',
    limit: number = 30
  ): IndexItem[] {
    const cleanQuery = query.trim().toLowerCase();
    const all = Array.from(this.items.values());

    if (!cleanQuery) {
      const filtered = categoryFilter === 'all' ? all : all.filter((i) => i.category === categoryFilter);
      return filtered.sort((a, b) => new Date(b.indexedAt).getTime() - new Date(a.indexedAt).getTime()).slice(0, limit);
    }

    const queryTokens = tokenizeText(cleanQuery);
    const scored: IndexItem[] = [];

    for (const item of all) {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        continue;
      }

      let score = 0;
      const titleLower = item.title.toLowerCase();
      const snippetLower = item.snippet.toLowerCase();
      const urlLower = item.url.toLowerCase();
      const contentLower = item.content.toLowerCase();

      // Exact substring matches
      if (titleLower.includes(cleanQuery)) score += 50;
      if (urlLower.includes(cleanQuery)) score += 30;
      if (snippetLower.includes(cleanQuery)) score += 20;
      if (contentLower.includes(cleanQuery)) score += 15;

      // Token match evaluation
      for (const token of queryTokens) {
        if (titleLower.includes(token)) score += 10;
        if (item.keywords.includes(token)) score += 5;
        if (urlLower.includes(token)) score += 8;
        if (snippetLower.includes(token)) score += 4;
        if (contentLower.includes(token)) score += 2;
      }

      if (score > 0) {
        scored.push({
          ...item,
          matchScore: score,
        });
      }
    }

    // Sort by match score descending, then by date
    scored.sort((a, b) => {
      if ((b.matchScore || 0) !== (a.matchScore || 0)) {
        return (b.matchScore || 0) - (a.matchScore || 0);
      }
      return new Date(b.indexedAt).getTime() - new Date(a.indexedAt).getTime();
    });

    return scored.slice(0, limit);
  }

  // Get index metrics and statistics
  public getStats(): IndexStats {
    const all = Array.from(this.items.values());
    const categories: Record<string, number> = {};
    let totalWords = 0;

    for (const item of all) {
      categories[item.category] = (categories[item.category] || 0) + 1;
      totalWords += item.keywords.length;
    }

    const rawStr = JSON.stringify(all);
    const storageSizeKB = +(rawStr.length / 1024).toFixed(1);

    const sortedByDate = [...all].sort(
      (a, b) => new Date(b.indexedAt).getTime() - new Date(a.indexedAt).getTime()
    );

    return {
      totalItems: all.length,
      totalWords,
      categories,
      lastIndexed: sortedByDate[0]?.title || 'Keine Einträge',
      storageSizeKB,
    };
  }

  // Delete an item from index
  public deleteItem(id: string) {
    this.items.delete(id);
    this.saveToLocalStorage();
  }

  // Clear the whole index
  public clearIndex() {
    this.items.clear();
    this.saveToLocalStorage();
  }

  // Export index as JSON string
  public exportJSON(): string {
    return JSON.stringify(Array.from(this.items.values()), null, 2);
  }

  // Import JSON into index
  public importJSON(jsonStr: string): number {
    try {
      const arr: IndexItem[] = JSON.parse(jsonStr);
      let count = 0;
      if (Array.isArray(arr)) {
        for (const item of arr) {
          if (item.id && item.url && item.title) {
            this.items.set(item.id, item);
            count++;
          }
        }
        this.saveToLocalStorage();
      }
      return count;
    } catch {
      return 0;
    }
  }

  // ==========================================
  // FIRESTORE CLOUD PERSISTENCE
  // ==========================================

  public async syncToFirestore(userId: string): Promise<boolean> {
    if (!userId) return false;
    const path = `users/${userId}/indexItems`;
    try {
      const colRef = collection(db, 'users', userId, 'indexItems');
      const batch = writeBatch(db);
      let opCount = 0;

      for (const item of Array.from(this.items.values())) {
        if (opCount >= 450) break; // Firestore 500 batch limit
        const docRef = doc(colRef, item.id);
        batch.set(docRef, {
          id: item.id,
          userId,
          url: item.url,
          title: item.title,
          snippet: item.snippet,
          content: item.content.slice(0, 2000), // bounded for cloud
          category: item.category,
          domain: item.domain,
          favicon: item.favicon || '',
          indexedAt: item.indexedAt,
        });
        opCount++;
      }

      if (opCount > 0) {
        await batch.commit();
      }
      return true;
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        handleFirestoreError(e, OperationType.WRITE, path);
      }
      console.error('Failed to sync index to Firestore:', e);
      return false;
    }
  }

  public async loadFromFirestore(userId: string): Promise<number> {
    if (!userId) return 0;
    const path = `users/${userId}/indexItems`;
    try {
      const colRef = collection(db, 'users', userId, 'indexItems');
      const snapshot = await getDocs(colRef);
      let count = 0;

      snapshot.forEach((d) => {
        const data = d.data() as IndexItem;
        if (data && data.id && data.url) {
          this.items.set(data.id, {
            ...data,
            keywords: tokenizeText(`${data.title} ${data.snippet} ${data.domain}`),
          });
          count++;
        }
      });

      this.saveToLocalStorage();
      return count;
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        handleFirestoreError(e, OperationType.LIST, path);
      }
      console.error('Failed to load index from Firestore:', e);
      return 0;
    }
  }
}

export const browserIndexer = new BrowserIndexService();
