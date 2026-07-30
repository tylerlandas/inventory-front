import React, { useState, Suspense, lazy } from 'react';
import { IoScanOutline, IoListOutline, IoLogOutOutline } from 'react-icons/io5';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ItemsProvider } from './context/ItemsContext';
import { AlertProvider } from './context/AlertContext';
import ListScreen from './screens/ListScreen';
import LoginScreen from './screens/LoginScreen';
import CreateAccountScreen from './screens/CreateAccountScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';

const ScanScreen = lazy(() => import('./screens/ScanScreen'));

const TABS = [
  { key: 'scan', label: 'Scan Mode', title: 'Scan Item', icon: IoScanOutline },
  { key: 'list', label: 'List Mode', title: 'My Inventory', icon: IoListOutline },
];

function MainApp() {
  const [tab, setTab] = useState('scan');
  const { logout } = useAuth();
  const current = TABS.find((t) => t.key === tab);

  return (
    <ItemsProvider>
      <AlertProvider>
        <div className="app">
          <div className="app-header">
            <span>{current.title}</span>
            <button className="logout-btn" onClick={logout} aria-label="Log out">
              <IoLogOutOutline size={20} />
            </button>
          </div>
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

function AuthGate() {
  const { user, checkingSession } = useAuth();
  const [authScreen, setAuthScreen] = useState('login');

  if (checkingSession) {
    return <div className="auth-screen" />;
  }

  if (!user) {
    if (authScreen === 'create') return <CreateAccountScreen onNavigate={setAuthScreen} />;
    if (authScreen === 'reset') return <ResetPasswordScreen onNavigate={setAuthScreen} />;
    return <LoginScreen onNavigate={setAuthScreen} />;
  }

  return <MainApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
