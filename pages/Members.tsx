import React, { useState } from 'react';
import { Member, AppData } from '../types';
import { Search, Plus, Trash2, Edit2, User } from 'lucide-react';
import { updateStore, addMember, updateMember } from '../services/dataService';

interface MembersProps {
  data: AppData;
  onRefresh: () => void;
  year: string;
}

export const Members: React.FC<MembersProps> = ({ data, onRefresh, year }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Member>>({
    fullName: '',
    phone: '',
    address: '',
    role: 'Member',
    wifeName: '',
  });

  const filteredMembers = data.members.filter(m => 
    m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.phone.includes(searchTerm)
  );

  const handleOpenModal = (member?: Member) => {
    if (member) {
      setEditingMember(member);
      setFormData(member);
    } else {
      setEditingMember(null);
      setFormData({
        fullName: '',
        phone: '',
        address: '',
        role: 'Member',
        wifeName: '',
        contributions: {},
        creditScore: 100,
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this member?')) {
      updateStore(prev => ({
        ...prev,
        members: prev.members.filter(m => m.id !== id)
      }));
      onRefresh();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();

    if (editingMember) {
      updateMember({
        ...editingMember,
        ...formData as Member,
      });
    } else {
      const newMember: Member = {
        id: `m_${Date.now()}`,
        joinDate: now,
        createdAt: now,
        contributions: {},
        creditScore: 100,
        ...formData as any,
      };
      addMember(newMember);
    }
    setIsModalOpen(false);
    onRefresh();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'profilePic' | 'wifePic') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search by name or phone..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 flex items-center gap-2"
        >
          <Plus size={20} /> Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMembers.map(member => (
          <div key={member.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4 flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden border-2 border-amber-500">
                {member.profilePic ? (
                  <img src={member.profilePic} alt={member.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <User size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 truncate">{member.fullName}</h3>
                <p className="text-sm text-slate-500">{member.role}</p>
                <p className="text-xs text-slate-400 mt-1">{member.phone}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => handleOpenModal(member)} className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-full">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(member.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex justify-between text-sm">
              <span className="text-slate-500">Contribution ({year}):</span>
              <span className="font-bold text-green-600">₹{member.contributions[year] || 0}</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingMember ? 'Edit Member' : 'Add New Member'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Plus size={24} className="transform rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input required className="w-full border p-2 rounded" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input required className="w-full border p-2 rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea className="w-full border p-2 rounded" rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select className="w-full border p-2 rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}>
                    <option value="Member">Member</option>
                    <option value="Committee">Committee</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Wife Name</label>
                  <input className="w-full border p-2 rounded" value={formData.wifeName} onChange={e => setFormData({...formData, wifeName: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Profile Photo</label>
                  <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'profilePic')} className="text-xs" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Wife Photo</label>
                  <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'wifePic')} className="text-xs" />
                </div>
              </div>

              <button type="submit" className="w-full bg-red-700 text-white py-3 rounded-lg font-semibold hover:bg-red-800">
                Save Member Details
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
