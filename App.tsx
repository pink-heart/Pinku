import React, { useState, useEffect } from 'react';
import { loadData, saveData } from './services/dataService';
import { AppData } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Members } from './pages/Members';
import { Finances } from './pages/Finances';
import { Committee } from './pages/Committee';
import { Settings } from './pages/Settings';
import { Lock } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentYear, setCurrentYear] = useState('2023');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Initial Load
  useEffect(() => {
    const loaded = loadData();
    setData(loaded);
    // Set current year to latest available year by default
    setCurrentYear(loaded.years[loaded.years.length - 1] || '2023');
  }, []);

  const handleRefresh = () => {
    const loaded = loadData();
    setData(loaded);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (data && passwordInput === data.settings.adminPassword) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Incorrect password. Try "admin"');
    }
  };

  if (!data) return <div className="flex h-screen items-center justify-center text-amber-600">Loading Puja App...</div>;

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl border border-red-100">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-700 rounded-full mx-auto flex items-center justify-center text-white mb-4 shadow-lg">
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Admin Login</h1>
            <p className="text-slate-500 mt-2">{data.settings.clubName}</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="password" 
                placeholder="Enter Admin Password" 
                className="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
              />
            </div>
            {loginError && <p className="text-red-600 text-sm text-center">{loginError}</p>}
            <button type="submit" className="w-full bg-red-700 text-white font-bold py-3 rounded-xl hover:bg-red-800 transition-colors shadow-md">
              Unlock Dashboard
            </button>
          </form>
          <p className="text-center text-xs text-slate-400 mt-6">Default: admin</p>
        </div>
      </div>
    );
  }

  // Authenticated App
  return (
    <Layout 
      activeTab={activeTab} 
      onNavigate={setActiveTab} 
      onLogout={() => setIsAuthenticated(false)}
      clubName={data.settings.clubName}
      logo={data.settings.logo}
    >
      {/* Global Year Selector */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
             {activeTab === 'dashboard' && 'Overview'}
             {activeTab === 'members' && 'Member Directory'}
             {activeTab === 'finances' && 'Financial Records'}
             {activeTab === 'committee' && 'Committee Members'}
             {activeTab === 'settings' && 'System Settings'}
          </h1>
          <p className="text-sm text-slate-500">Welcome, Admin</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200">
            <span className="text-sm font-medium text-slate-600">Year:</span>
            <select 
                className="bg-transparent font-bold text-red-700 focus:outline-none cursor-pointer"
                value={currentYear}
                onChange={(e) => setCurrentYear(e.target.value)}
            >
                {data.years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
        </div>
      </div>

      {activeTab === 'dashboard' && <Dashboard data={data} year={currentYear} />}
      {activeTab === 'members' && <Members data={data} onRefresh={handleRefresh} year={currentYear} />}
      {activeTab === 'finances' && <Finances data={data} year={currentYear} onRefresh={handleRefresh} />}
      {activeTab === 'committee' && <Committee data={data} onRefresh={handleRefresh} />}
      {activeTab === 'settings' && <Settings data={data} onRefresh={handleRefresh} />}
      {activeTab === 'rules' && (
          <div className="bg-white p-8 rounded-xl shadow-sm">
              <h2 className="text-xl font-bold mb-4">Rules & Regulations</h2>
              <ul className="list-disc pl-5 space-y-2 text-slate-700">
                  {data.settings.rules.map(r => (
                      <li key={r.id}>{r.text}</li>
                  ))}
              </ul>
              <p className="text-slate-400 text-sm mt-6 italic">Edit rules in settings.</p>
          </div>
      )}
    </Layout>
  );
};

export default App;
