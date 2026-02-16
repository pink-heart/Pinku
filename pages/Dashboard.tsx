import React, { useEffect, useState } from 'react';
import { AppData } from '../types';
import { generateFinancialReport } from '../services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Sparkles, TrendingUp, TrendingDown, Users, IndianRupee } from 'lucide-react';

interface DashboardProps {
  data: AppData;
  year: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

export const Dashboard: React.FC<DashboardProps> = ({ data, year }) => {
  const [aiReport, setAiReport] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Calculations
  const yearTransactions = data.transactions.filter(t => t.year === year);
  const totalCollection = yearTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = yearTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalCollection - totalExpense;

  const expenseByCategory = yearTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));
  
  const topContributors = [...data.members]
    .sort((a, b) => (b.contributions[year] || 0) - (a.contributions[year] || 0))
    .slice(0, 5);

  const handleGenerateAiReport = async () => {
    setLoadingAi(true);
    const report = await generateFinancialReport(
      year, 
      data.transactions, 
      data.budgets, 
      totalCollection, 
      totalExpense
    );
    setAiReport(report);
    setLoadingAi(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard {year}</h2>
          <p className="text-slate-500">Financial Overview & Insights</p>
        </div>
        <button 
          onClick={handleGenerateAiReport}
          disabled={loadingAi}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow hover:opacity-90 flex items-center gap-2 transition-all"
        >
          <Sparkles size={18} />
          {loadingAi ? 'Analyzing...' : 'Ask AI Analysis'}
        </button>
      </div>

      {/* AI Report Section */}
      {aiReport && (
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500 animate-fade-in">
          <h3 className="text-lg font-semibold text-purple-800 flex items-center gap-2 mb-2">
            <Sparkles size={20} />
            Gemini AI Insights
          </h3>
          <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line">
            {aiReport}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Collection</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">₹{totalCollection}</h3>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Expense</p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">₹{totalExpense}</h3>
            </div>
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <TrendingDown size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Current Balance</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">₹{balance}</h3>
            </div>
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <IndianRupee size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Members</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">{data.members.length}</h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Users size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-4">Expense Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-4">Top Contributors ({year})</h3>
          <div className="space-y-4">
            {topContributors.length > 0 ? topContributors.map((member, idx) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-medium text-slate-800">{member.fullName}</p>
                    <p className="text-xs text-slate-500">{member.role}</p>
                  </div>
                </div>
                <span className="font-bold text-green-600">₹{member.contributions[year] || 0}</span>
              </div>
            )) : (
              <p className="text-slate-400 text-center py-8">No contributions recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
