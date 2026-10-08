export interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isLoading?: boolean;
  canGoBack?: boolean;
  canGoForward?: boolean;
  history: string[];
  historyIndex: number;
}

export interface SpeedDialTile {
  id: string;
  title: string;
  url: string;
  bgGradient: string;
  textColor?: string;
  customLogo?: string;
  domain: string;
}

export interface NewsArticle {
  id: string;
  source: string;
  title: string;
  category: string;
  url: string;
  timeAgo: string;
  readTime: string;
}

export interface VPNNode {
  id: string;
  country: string;
  city: string;
  flag: string;
  ip: string;
  ping: number;
}

export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  website: string;
  updatedAt: string;
  strength: 'weak' | 'medium' | 'strong';
  isPwned?: boolean;
}

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  visitedAt: Date;
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  folder?: string;
  createdAt?: string;
  userId?: string;
}

export interface DownloadItem {
  id: string;
  fileName: string;
  fileSize: string;
  progress: number;
  status: 'completed' | 'downloading' | 'paused';
  timestamp: string;
}

export type DNSProvider = 'cloudflare' | 'quad9' | 'google' | 'custom';

export interface WindowsSetupInfo {
  filename: string;
  version: string;
  architecture: string;
  fileSize: string;
  sha256: string;
  sha512: string;
  md5: string;
  certificate: {
    subject: string;
    issuer: string;
    serialNumber: string;
    validFrom: string;
    validTo: string;
    status: string;
    thumbprint: string;
  };
}

export interface UserAccount {
  userId?: string;
  isLoggedIn: boolean;
  name: string;
  email: string;
  avatarUrl: string;
  lastSynced: string;
  syncItems: {
    passwords: boolean;
    bookmarks: boolean;
    history: boolean;
    tabs: boolean;
    settings: boolean;
  };
}
