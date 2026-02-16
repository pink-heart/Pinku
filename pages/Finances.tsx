import React, { useState } from 'react';
import { AppData, Transaction, Budget } from '../types';
import { updateStore, addTransaction } from '../services/dataService';
import { IndianRupee, ArrowDownCircle, ArrowUpCircle, PieChart, Printer, Download } from 'lucide-react';

interface FinancesProps {
  data: AppData;
  year: string;
  onRefresh: () => void;
}

export const Finances: React.FC<FinancesProps> = ({ data, year, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'INCOME' | 'EXPENSE' | 'BUDGET'>('INCOME');
  const [showModal, setShowModal] = useState(false);
  
  // Transaction Form State
  const [txnForm, setTxnForm] = useState<Partial<Transaction>>({
    amount: 0,
    category: '',
    description: '',
    paymentMode: 'CASH',
    relatedMemberId: ''
  });

  // Filtered Lists
  const transactions = data.transactions.filter(t => t.year === year && t.type === (activeTab === 'INCOME' ? 'INCOME' : 'EXPENSE'));
  const budgets = data.budgets.filter(b => b.year === year);

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'BUDGET') {
      // Save Budget Logic
      updateStore(prev => ({
        ...prev,
        budgets: [...prev.budgets, {
          id: `b_${Date.now()}`,
          year,
          category: txnForm.category || 'General',
          amount: Number(txnForm.amount)
        }]
      }));
    } else {
      // Save Transaction Logic
      const newTxn: Transaction = {
        id: `t_${Date.now()}`,
        year,
        type: activeTab,
        amount: Number(txnForm.amount),
        category: txnForm.category || 'General',
        description: txnForm.description || '',
        paymentMode: txnForm.paymentMode as any,
        date: new Date().toISOString(),
        relatedMemberId: txnForm.relatedMemberId
      };
      
      addTransaction(newTxn);
      
      // If it's a member contribution, update member history
      if (newTxn.relatedMemberId && activeTab === 'INCOME') {
        updateStore(prev => ({
          ...prev,
          members: prev.members.map(m => {
            if (m.id === newTxn.relatedMemberId) {
              const currentContribution = m.contributions[year] || 0;
              return {
                ...m,
                contributions: {
                  ...m.contributions,
                  [year]: currentContribution + newTxn.amount
                }
              };
            }
            return m;
          })
        }));
      }
    }
    setShowModal(false);
    onRefresh();
  };

  const printReport = () => {
    window.print();
  };

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Mode', 'Description'];
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.category,
      t.amount,
      t.paymentMode,
      t.description
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `finance_report_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200 w-fit">
          {(['INCOME', 'EXPENSE', 'BUDGET'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab 
                  ? 'bg-red-700 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab === 'INCOME' && 'Collection'}
              {tab === 'EXPENSE' && 'Expenses'}
              {tab === 'BUDGET' && 'Budget'}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
           <button onClick={printReport} className="p-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">
            <Printer size={20} />
          </button>
          <button onClick={exportCSV} className="p-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">
            <Download size={20} />
          </button>
          <button 
            onClick={() => {
                setTxnForm({ amount: 0, category: '', description: '', paymentMode: 'CASH', relatedMemberId: '' });
                setShowModal(true);
            }} 
            className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 flex items-center gap-2 font-medium shadow-sm"
          >
            <IndianRupee size={18} /> Add {activeTab === 'BUDGET' ? 'Budget' : activeTab === 'INCOME' ? 'Collection' : 'Expense'}
          </button>
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {activeTab === 'BUDGET' ? (
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold text-right">Planned Amount</th>
                  <th className="p-4 font-semibold text-right">Actual Spent</th>
                  <th className="p-4 font-semibold text-right">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {budgets.map(budget => {
                  const actual = data.transactions
                    .filter(t => t.year === year && t.type === 'EXPENSE' && t.category === budget.category)
                    .reduce((sum, t) => sum + t.amount, 0);
                  const remaining = budget.amount - actual;
                  
                  return (
                    <tr key={budget.id} className="hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-800">{budget.category}</td>
                      <td className="p-4 text-right">₹{budget.amount}</td>
                      <td className="p-4 text-right text-red-600">₹{actual}</td>
                      <td className={`p-4 text-right font-bold ${remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>
                        ₹{remaining}
                      </td>
                    </tr>
                  );
                })}
                 {budgets.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">No budget planned for {year}.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Category/Member</th>
                  <th className="p-4 font-semibold">Description</th>
                  <th className="p-4 font-semibold">Mode</th>
                  <th className="p-4 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map(t => {
                    const memberName = t.relatedMemberId ? data.members.find(m => m.id === t.relatedMemberId)?.fullName : null;
                    return (
                        <tr key={t.id} className="hover:bg-slate-50">
                        <td className="p-4 text-slate-500 text-sm">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="p-4 font-medium text-slate-800">
                            {memberName ? <span className="text-indigo-600">{memberName}</span> : t.category}
                        </td>
                        <td className="p-4 text-slate-600 text-sm">{t.description || '-'}</td>
                        <td className="p-4">
                            <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-600">
                            {t.paymentMode}
                            </span>
                        </td>
                        <td className={`p-4 text-right font-bold ${activeTab === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {activeTab === 'INCOME' ? '+' : '-'}₹{t.amount}
                        </td>
                        </tr>
                    );
                })}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">No records found for {year}.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold">Add {activeTab === 'BUDGET' ? 'Budget' : activeTab === 'INCOME' ? 'Contribution' : 'Expense'}</h2>
            </div>
            <form onSubmit={handleSaveTransaction} className="p-6 space-y-4">
              
              {activeTab === 'INCOME' && (
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Select Member (Optional)</label>
                   <select 
                      className="w-full border p-2 rounded"
                      value={txnForm.relatedMemberId}
                      onChange={e => setTxnForm({...txnForm, relatedMemberId: e.target.value})}
                   >
                     <option value="">-- External / General Donation --</option>
                     {data.members.map(m => (
                       <option key={m.id} value={m.id}>{m.fullName} ({m.phone})</option>
                     ))}
                   </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input required type="number" className="w-full border p-2 rounded" value={txnForm.amount || ''} onChange={e => setTxnForm({...txnForm, amount: Number(e.target.value)})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                {activeTab === 'INCOME' ? (
                     <input type="text" placeholder="e.g., Chanda, Donation" className="w-full border p-2 rounded" value={txnForm.category} onChange={e => setTxnForm({...txnForm, category: e.target.value})} />
                ) : (
                    <select className="w-full border p-2 rounded" value={txnForm.category} onChange={e => setTxnForm({...txnForm, category: e.target.value})}>
                        <option value="">Select Category</option>
                        {['Food', 'Decoration', 'Idol', 'Lighting', 'Sound', 'Priest', 'Miscellaneous'].map(c => <option key={c} value={c}>{c}</option>)}
                        <option value="Other">Other</option>
                    </select>
                )}
              </div>

              {activeTab !== 'BUDGET' && (
                  <>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea className="w-full border p-2 rounded" value={txnForm.description} onChange={e => setTxnForm({...txnForm, description: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
                        <select className="w-full border p-2 rounded" value={txnForm.paymentMode} onChange={e => setTxnForm({...txnForm, paymentMode: e.target.value as any})}>
                        <option value="CASH">Cash</option>
                        <option value="BANK">Bank Transfer</option>
                        <option value="QR">UPI / QR</option>
                        </select>
                    </div>
                  </>
              )}

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-red-700 text-white py-2 rounded-lg hover:bg-red-800">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
