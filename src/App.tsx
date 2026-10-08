/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserProvider, useBrowser } from './context/BrowserContext';
import { TitleBar } from './components/TitleBar';
import { Omnibar } from './components/Omnibar';
import { Sidebar } from './components/Sidebar';
import { SidebarPanel } from './components/sidepanels/SidebarPanel';
import { WebPageView } from './components/WebPageView';

// Modals
import { VPNModal } from './components/modals/VPNModal';
import { AdblockModal } from './components/modals/AdblockModal';
import { PasswordManagerModal } from './components/modals/PasswordManagerModal';
import { GoogleSyncModal } from './components/modals/GoogleSyncModal';
import { DNSModal } from './components/modals/DNSModal';
import { SecurityModal } from './components/modals/SecurityModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { AddTileModal } from './components/modals/AddTileModal';
import { WindowsInstallerModal } from './components/modals/WindowsInstallerModal';
import { BookmarkModal } from './components/modals/BookmarkModal';

const BrowserShell: React.FC = () => {
  const { isDarkMode } = useBrowser();

  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden select-none font-sans antialiased ${
        isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* 1. Top Window & Tabs Bar */}
      <TitleBar />

      {/* 2. Omnibar & Navigation Bar */}
      <Omnibar />

      {/* 3. Main Workspace (Sidebar + Optional Drawer + Web View / Speed Dial) */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        <SidebarPanel />
        <main className="flex-1 h-full overflow-hidden relative">
          <WebPageView />
        </main>
      </div>

      {/* 4. Interactive Overlay Modals */}
      <VPNModal />
      <AdblockModal />
      <PasswordManagerModal />
      <GoogleSyncModal />
      <DNSModal />
      <SecurityModal />
      <SettingsModal />
      <AddTileModal />
      <WindowsInstallerModal />
      <BookmarkModal />
    </div>
  );
};

export default function App() {
  return (
    <BrowserProvider>
      <BrowserShell />
    </BrowserProvider>
  );
}
