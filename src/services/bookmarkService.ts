import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { BookmarkItem } from '../types/browser';

const LOCAL_STORAGE_KEY = 'aura_bookmarks_cache';

export const bookmarkService = {
  /**
   * Save a new bookmark to Firestore
   */
  async saveBookmark(item: BookmarkItem, userId?: string): Promise<BookmarkItem> {
    const effectiveUserId = userId || auth.currentUser?.uid || 'guest';
    const cleanId = item.id || `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const createdAt = item.createdAt || new Date().toISOString();
    
    const bookmarkData: BookmarkItem = {
      id: cleanId,
      title: (item.title || 'Neues Lesezeichen').trim(),
      url: (item.url || 'https://google.de').trim(),
      folder: item.folder || 'Favoriten',
      icon: item.icon || `https://www.google.com/s2/favicons?domain=${encodeURIComponent(item.url)}&sz=32`,
      createdAt,
      userId: effectiveUserId,
    };

    // 1. Write to global /bookmarks collection in Firestore
    const globalPath = `bookmarks/${cleanId}`;
    try {
      await setDoc(doc(db, 'bookmarks', cleanId), bookmarkData);
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.CREATE, globalPath);
      }
      console.warn('Firestore global bookmark write notice:', err?.message);
    }

    // 2. If authenticated user, also write to /users/{userId}/bookmarks
    if (auth.currentUser && auth.currentUser.uid) {
      const userDocPath = `users/${auth.currentUser.uid}/bookmarks/${cleanId}`;
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'bookmarks', cleanId), bookmarkData);
      } catch (err: any) {
        if (err?.code === 'permission-denied') {
          handleFirestoreError(err, OperationType.CREATE, userDocPath);
        }
        console.warn('Firestore user bookmark write notice:', err?.message);
      }
    }

    return bookmarkData;
  },

  /**
   * Update an existing bookmark in Firestore
   */
  async updateBookmark(id: string, updates: Partial<BookmarkItem>, userId?: string): Promise<boolean> {
    if (!id) return false;
    const globalPath = `bookmarks/${id}`;
    const cleanUpdates: Record<string, any> = {};

    if (updates.title !== undefined) cleanUpdates.title = updates.title.trim();
    if (updates.url !== undefined) {
      cleanUpdates.url = updates.url.trim();
      cleanUpdates.icon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(updates.url)}&sz=32`;
    }
    if (updates.folder !== undefined) cleanUpdates.folder = updates.folder.trim();

    try {
      await updateDoc(doc(db, 'bookmarks', id), cleanUpdates);
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.UPDATE, globalPath);
      }
      console.warn('Firestore update global bookmark notice:', err?.message);
    }

    if (auth.currentUser && auth.currentUser.uid) {
      const userDocPath = `users/${auth.currentUser.uid}/bookmarks/${id}`;
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid, 'bookmarks', id), cleanUpdates);
      } catch (err: any) {
        if (err?.code === 'permission-denied') {
          handleFirestoreError(err, OperationType.UPDATE, userDocPath);
        }
        console.warn('Firestore update user bookmark notice:', err?.message);
      }
    }

    return true;
  },

  /**
   * Delete a bookmark from Firestore
   */
  async deleteBookmark(id: string, userId?: string): Promise<boolean> {
    if (!id) return false;
    const globalPath = `bookmarks/${id}`;

    try {
      await deleteDoc(doc(db, 'bookmarks', id));
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.DELETE, globalPath);
      }
      console.warn('Firestore delete global bookmark notice:', err?.message);
    }

    if (auth.currentUser && auth.currentUser.uid) {
      const userDocPath = `users/${auth.currentUser.uid}/bookmarks/${id}`;
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'bookmarks', id));
      } catch (err: any) {
        if (err?.code === 'permission-denied') {
          handleFirestoreError(err, OperationType.DELETE, userDocPath);
        }
        console.warn('Firestore delete user bookmark notice:', err?.message);
      }
    }

    return true;
  },

  /**
   * Fetch all bookmarks stored in Firestore
   */
  async fetchBookmarks(userId?: string): Promise<BookmarkItem[]> {
    const results: BookmarkItem[] = [];
    const path = auth.currentUser ? `users/${auth.currentUser.uid}/bookmarks` : 'bookmarks';

    try {
      const colRef = auth.currentUser
        ? collection(db, 'users', auth.currentUser.uid, 'bookmarks')
        : collection(db, 'bookmarks');
      
      const snapshot = await getDocs(colRef);
      snapshot.forEach((d) => {
        const data = d.data() as BookmarkItem;
        if (data && data.url) {
          results.push({
            id: d.id,
            title: data.title || 'Lesezeichen',
            url: data.url,
            folder: data.folder || 'Favoriten',
            icon: data.icon || `https://www.google.com/s2/favicons?domain=${encodeURIComponent(data.url)}&sz=32`,
            createdAt: data.createdAt,
            userId: data.userId,
          });
        }
      });
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.LIST, path);
      }
      console.warn('Failed to fetch bookmarks from Firestore:', err);
    }

    return results;
  },

  /**
   * Realtime listener for Firestore bookmarks changes
   */
  listenToBookmarks(userId: string | undefined, onUpdate: (items: BookmarkItem[]) => void): () => void {
    const isUserAuth = !!auth.currentUser?.uid;
    const path = isUserAuth ? `users/${auth.currentUser!.uid}/bookmarks` : 'bookmarks';
    const colRef = isUserAuth
      ? collection(db, 'users', auth.currentUser!.uid, 'bookmarks')
      : collection(db, 'bookmarks');

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const items: BookmarkItem[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as BookmarkItem;
          if (data && data.url) {
            items.push({
              id: d.id,
              title: data.title || 'Lesezeichen',
              url: data.url,
              folder: data.folder || 'Favoriten',
              icon: data.icon || `https://www.google.com/s2/favicons?domain=${encodeURIComponent(data.url)}&sz=32`,
              createdAt: data.createdAt,
              userId: data.userId,
            });
          }
        });
        if (items.length > 0) {
          onUpdate(items);
        }
      },
      (error) => {
        if (error?.code === 'permission-denied') {
          handleFirestoreError(error, OperationType.GET, path);
        }
        console.warn('Firestore bookmark snapshot error:', error);
      }
    );

    return unsubscribe;
  },
};
