import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  salt: string;
  hash: string;
  createdAt: string;
  data: {
    settings?: Record<string, any>;
    tiles?: any[];
    passwords?: any[];
    bookmarks?: any[];
    history?: any[];
    lastSynced?: string;
  };
}

export interface DatabaseSchema {
  users: Record<string, UserRecord>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'aura_database.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading database file, creating fresh:', err);
  }
  return { users: {} };
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export const dbService = {
  findUserByEmail(email: string): UserRecord | null {
    const db = loadDatabase();
    const cleanEmail = email.trim().toLowerCase();
    for (const id in db.users) {
      if (db.users[id].email.toLowerCase() === cleanEmail) {
        return db.users[id];
      }
    }
    return null;
  },

  findUserById(id: string): UserRecord | null {
    const db = loadDatabase();
    return db.users[id] || null;
  },

  createUser(email: string, password: string, name: string): UserRecord {
    const db = loadDatabase();
    const cleanEmail = email.trim().toLowerCase();

    if (this.findUserByEmail(cleanEmail)) {
      throw new Error('E-Mail-Adresse ist bereits registriert.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(password, salt);
    const id = `user-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    const newUser: UserRecord = {
      id,
      email: cleanEmail,
      name: name.trim() || cleanEmail.split('@')[0],
      salt,
      hash,
      createdAt: new Date().toISOString(),
      data: {
        settings: {
          theme: 'dark',
          searchEngine: 'google',
          vpnEnabled: true,
          dnsProvider: 'cloudflare',
          blockCryptoMiners: true,
          adblockEnabled: true,
        },
        tiles: [],
        passwords: [],
        bookmarks: [],
        history: [],
        lastSynced: new Date().toISOString(),
      },
    };

    db.users[id] = newUser;
    saveDatabase(db);
    return newUser;
  },

  verifyPassword(user: UserRecord, password: string): boolean {
    const computed = hashPassword(password, user.salt);
    return computed === user.hash;
  },

  updateUserData(id: string, partialData: Partial<UserRecord['data']>): UserRecord {
    const db = loadDatabase();
    const user = db.users[id];
    if (!user) {
      throw new Error('Benutzer nicht gefunden.');
    }

    user.data = {
      ...user.data,
      ...partialData,
      lastSynced: new Date().toISOString(),
    };

    db.users[id] = user;
    saveDatabase(db);
    return user;
  },
};
