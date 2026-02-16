import React, { useState } from 'react';
import { AppData, Rule } from '../types';
import { updateStore } from '../services/dataService';
import { Save, RefreshCw, Plus, Trash2, Lock, FileText, Image, Building } from 'lucide-react';

interface SettingsProps {
  data: AppData;
  onRefresh: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ data, onRefresh }) => {
  // Bank State
  const [bankForm, setBankForm] = useState(data.bankDetails);
  
  // General State
  const [clubName, setClubName] = useState(data.settings.clubName);
  const [logo, setLogo] = useState(data.settings.logo);

  // Password State
  const [newPassword, setNewPassword] = useState('');
  
  // Rules State
  const [rules, setRules] = useState<Rule[]>(data.settings.rules);
  const [newRuleText, setNewRuleText] = useState('');

  // Year State
  const [newYear, setNewYear] = useState('');

  // Handlers
  const handleSaveGeneral = () => {
    updateStore(prev => ({
      ...prev,
      settings: { ...prev.settings, clubName, logo }
    }));
    alert('App details updated!');
    onRefresh();
  };

  const handleUpdatePassword = () => {
    if (!newPassword) return;
    updateStore(prev => ({
      ...prev,
      settings: { ...prev.settings, adminPassword: newPassword }
    }));
    setNewPassword('');
    alert('Admin password updated successfully!');
    onRefresh();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddRule = () => {
    if (!newRuleText) return;
    const newRule: Rule = {
      id: `r_${Date.now()}`,
      text: newRuleText,
      lastUpdated: new Date().toISOString()
    };
    const updatedRules = [...rules, newRule];
    setRules(updatedRules);
    updateStore(prev => ({
      ...prev,
      settings: { ...prev.settings, rules: updatedRules }
    }));
    setNewRuleText('');
    onRefresh();
  };

  const handleDeleteRule = (id: string) => {
    const updatedRules = rules.filter(r => r.id !== id);
    setRules(updatedRules);
    updateStore(prev => ({
      ...prev,
      settings: { ...prev.settings, rules: updatedRules }
    }));
    onRefresh();
  };

  const handleSaveBank = () => {
    updateStore(prev => ({ ...prev, bankDetails: bankForm }));
    alert('Bank details updated!');
    onRefresh();
  };

  const handleAddYear = () => {
    if (newYear && !data.years.includes(newYear)) {
      updateStore(prev => ({ ...prev, years: [...prev.years, newYear].sort() }));
      setNewYear('');
      onRefresh();
    }
  };

  const resetData = () => {
      if(confirm("Are you sure? This will delete all local data and reset to defaults.")) {
          localStorage.clear();
          window.location.reload();
      }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      
      {/* General Settings */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
            <Building size={20} className="text-amber-500"/> App Identity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Club / Organization Name</label>
                <input 
                    className="w-full border p-2 rounded" 
                    value={clubName} 
                    onChange={e => setClubName(e.target.value)} 
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">App Logo</label>
                <div className="flex items-center gap-4">
                    {logo && <img src={logo} alt="Logo" className="w-12 h-12 rounded-full object-cover border" />}
                    <label className="cursor-pointer bg-slate-100 px-4 py-2 rounded border hover:bg-slate-200 flex items-center gap-2 text-sm">
                        <Image size={16}/> {logo ? 'Change Logo' : 'Upload Logo'}
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                    </label>
                </div>
            </div>
        </div>
        <button onClick={handleSaveGeneral} className="mt-4 bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
            <Save size={16} /> Save Identity
        </button>
      </div>

      {/* Security */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
            <Lock size={20} className="text-red-600"/> Security
        </h3>
        <div className="max-w-md">
            <label className="block text-sm font-medium text-slate-700 mb-1">Change Admin Password</label>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="Enter new password" 
                    className="w-full border p-2 rounded" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                />
                <button onClick={handleUpdatePassword} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap">
                    Update Password
                </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">Note: Remember this password. It is stored locally.</p>
        </div>
      </div>

      {/* Rules Management */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
            <FileText size={20} className="text-blue-500"/> Rules & Regulations
        </h3>
        <div className="space-y-3 mb-4">
            {rules.map((rule, idx) => (
                <div key={rule.id} className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-100">
                    <span className="text-sm text-slate-700">{idx + 1}. {rule.text}</span>
                    <button onClick={() => handleDeleteRule(rule.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}
            {rules.length === 0 && <p className="text-sm text-slate-400 italic">No rules added yet.</p>}
        </div>
        <div className="flex gap-2">
            <input 
                className="flex-1 border p-2 rounded text-sm" 
                placeholder="Add a new rule..." 
                value={newRuleText}
                onChange={e => setNewRuleText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddRule()}
            />
            <button onClick={handleAddRule} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                <Plus size={16} /> Add
            </button>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Bank & UPI Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Account Holder Name</label>
            <input className="w-full border p-2 rounded" value={bankForm.holderName} onChange={e => setBankForm({...bankForm, holderName: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
            <input className="w-full border p-2 rounded" value={bankForm.accountNumber} onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">IFSC Code</label>
            <input className="w-full border p-2 rounded" value={bankForm.ifsc} onChange={e => setBankForm({...bankForm, ifsc: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Branch Name</label>
            <input className="w-full border p-2 rounded" value={bankForm.branch} onChange={e => setBankForm({...bankForm, branch: e.target.value})} />
          </div>
        </div>
        <button onClick={handleSaveBank} className="mt-4 bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
            <Save size={16} /> Update Bank Info
        </button>
      </div>

      {/* Year Management */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Financial Year Management</h3>
        <div className="flex gap-4 items-end">
             <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Add Future Year</label>
                <input 
                  type="number" 
                  placeholder="e.g. 2027" 
                  className="w-full border p-2 rounded" 
                  value={newYear} 
                  onChange={e => setNewYear(e.target.value)}
                />
             </div>
             <button onClick={handleAddYear} className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 mb-[1px]">
                 <Plus size={18} /> Add Year
             </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
             {data.years.map(y => (
                 <span key={y} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm border border-slate-200">
                     {y}
                 </span>
             ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 p-6 rounded-xl border border-red-100">
         <h3 className="text-lg font-bold text-red-800 mb-2">Danger Zone</h3>
         <p className="text-sm text-red-600 mb-4">Resetting will clear all member data, finances, and settings stored in this browser.</p>
         <button onClick={resetData} className="bg-white border border-red-300 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm">
            <RefreshCw size={16} /> Factory Reset App
         </button>
      </div>
    </div>
  );
};
