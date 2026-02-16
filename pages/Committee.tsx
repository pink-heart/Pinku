import React, { useState } from 'react';
import { AppData, CommitteeMember } from '../types';
import { updateStore } from '../services/dataService';
import { Edit2, ShieldCheck, User } from 'lucide-react';

interface CommitteeProps {
  data: AppData;
  onRefresh: () => void;
}

export const Committee: React.FC<CommitteeProps> = ({ data, onRefresh }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CommitteeMember | null>(null);

  const handleEdit = (member: CommitteeMember) => {
    setEditingId(member.id);
    setEditForm(member);
  };

  const handleSave = () => {
    if (editForm) {
      updateStore(prev => ({
        ...prev,
        committee: prev.committee.map(c => c.id === editForm.id ? editForm : c)
      }));
      setEditingId(null);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <ShieldCheck className="text-amber-500" />
        Committee Body
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.committee.map(member => (
          <div key={member.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
            <div className="h-24 bg-gradient-to-r from-red-700 to-red-600"></div>
            <div className="px-6 pb-6 text-center -mt-12">
               <div className="w-24 h-24 mx-auto rounded-full bg-white p-1 shadow-md">
                 <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                    {member.photo ? (
                        <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                        <User size={40} className="text-slate-400" />
                    )}
                 </div>
               </div>
               
               {editingId === member.id && editForm ? (
                   <div className="mt-4 space-y-2">
                       <input 
                         className="w-full border p-1 text-sm rounded" 
                         value={editForm.name} 
                         onChange={e => setEditForm({...editForm, name: e.target.value})}
                       />
                       <input 
                         className="w-full border p-1 text-sm rounded" 
                         value={editForm.role} 
                         onChange={e => setEditForm({...editForm, role: e.target.value})}
                       />
                       <div className="flex gap-2 justify-center mt-2">
                           <button onClick={() => setEditingId(null)} className="text-xs text-slate-500">Cancel</button>
                           <button onClick={handleSave} className="text-xs bg-amber-500 text-white px-2 py-1 rounded">Save</button>
                       </div>
                   </div>
               ) : (
                   <>
                        <h3 className="mt-4 text-lg font-bold text-slate-800">{member.name}</h3>
                        <p className="text-amber-600 font-medium">{member.role}</p>
                        <button 
                            onClick={() => handleEdit(member)}
                            className="absolute top-2 right-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm"
                        >
                            <Edit2 size={16} />
                        </button>
                   </>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
