import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Landmark,
  FileText
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
  clubName: string;
  logo?: string;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  onNavigate, 
  onLogout,
  clubName,
  logo
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'finances', label: 'Finances', icon: Wallet },
    { id: 'committee', label: 'Committee', icon: Landmark },
    { id: 'rules', label: 'Rules', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-red-700 text-white p-4 flex justify-between items-center shadow-md z-50 sticky top-0">
        <div className="font-bold text-lg truncate max-w-[200px]">{clubName}</div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-red-800 text-white transform transition-transform duration-300 ease-in-out shadow-2xl
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-red-700 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-white mb-3 flex items-center justify-center overflow-hidden border-4 border-amber-400">
            {logo ? (
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Landmark size={40} className="text-red-700" />
            )}
          </div>
          <h1 className="text-center font-bold text-amber-400 leading-tight">
            {clubName}
          </h1>
          <p className="text-xs text-red-200 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNav(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${activeTab === item.id 
                      ? 'bg-amber-500 text-red-900 font-semibold shadow-md' 
                      : 'hover:bg-red-700 text-red-100'}
                  `}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-red-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-900 text-red-200 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto h-[calc(100vh-64px)] md:h-screen p-4 md:p-8">
        {children}
      </main>

      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};
