import React, { useState, Suspense, lazy } from 'react';
import { IoScanOutline, IoListOutline } from 'react-icons/io5';
import { ItemsProvider } from './context/ItemsContext';
import { AlertProvider } from './context/AlertContext';
import ListScreen from './screens/ListScreen';

const ScanScreen = lazy(() => import('./screens/ScanScreen'));

const TABS = [
  { key: 'scan', label: 'Scan Mode', title: 'Scan Item', icon: IoScanOutline },
  { key: 'list', label: 'List Mode', title: 'My Inventory', icon: IoListOutline },
];

export default function App() {
  const [tab, setTab] = useState('scan');
  const current = TABS.find((t) => t.key === tab);

  return (
    <ItemsProvider>
      <AlertProvider>
        <div className="app">
          <div className="app-header">{current.title}</div>
          <div className="app-content">
            {tab === 'scan' && (
              <Suspense fallback={<div className="scan-screen" />}>
                <ScanScreen />
              </Suspense>
            )}
            {tab === 'list' && <ListScreen />}
          </div>
          <nav className="tab-bar">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`tab-btn${tab === t.key ? ' active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                <t.icon />
                <span>{t.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </AlertProvider>
    </ItemsProvider>
  );
}
