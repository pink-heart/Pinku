import { AppData, Member, Transaction, CommitteeMember, Budget, BankDetails, AppSettings, Rule } from '../types';

const DB_KEY = 'annapurna_puja_db_v1';

const DEFAULT_COMMITTEE: CommitteeMember[] = [
  { id: 'c1', name: 'Rajendranath Das', role: 'Secretary', phone: '' },
  { id: 'c2', name: 'Girish Chandra Ranu', role: 'President', phone: '' },
  { id: 'c3', name: 'Saikat Saha', role: 'Vice Secretary', phone: '' },
  { id: 'c4', name: 'Pinku Singha', role: 'Vice President', phone: '' },
  { id: 'c5', name: 'Sisir Hore', role: 'Cashier', phone: '' },
];

const DEFAULT_SETTINGS: AppSettings = {
  clubName: 'Annapurna Boys Saraswati Puja Committee',
  establishedYear: 2023,
  adminPassword: 'admin', // Default password
  rules: [
    { id: 'r1', text: 'All members must pay chanda before the puja week.', lastUpdated: new Date().toISOString() },
    { id: 'r2', text: 'Committee meetings are mandatory for core members.', lastUpdated: new Date().toISOString() },
  ],
};

const DEFAULT_BANK: BankDetails = {
  holderName: 'Annapurna Boys Club',
  accountNumber: '1234567890',
  ifsc: 'SBIN0001234',
  branch: 'Kolkata Main',
};

const INITIAL_DATA: AppData = {
  settings: DEFAULT_SETTINGS,
  members: [],
  committee: DEFAULT_COMMITTEE,
  transactions: [],
  budgets: [],
  bankDetails: DEFAULT_BANK,
  years: ['2023', '2024', '2025', '2026'],
};

export const loadData = (): AppData => {
  const stored = localStorage.getItem(DB_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return INITIAL_DATA;
};

export const saveData = (data: AppData) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

// Helper to update specific parts of the store
export const updateStore = (updater: (prev: AppData) => AppData) => {
  const current = loadData();
  const next = updater(current);
  saveData(next);
  return next;
};

export const addTransaction = (t: Transaction) => {
  return updateStore((data) => ({
    ...data,
    transactions: [...data.transactions, t],
  }));
};

export const updateMember = (m: Member) => {
  return updateStore((data) => ({
    ...data,
    members: data.members.map((ex) => (ex.id === m.id ? m : ex)),
  }));
};

export const addMember = (m: Member) => {
  return updateStore((data) => ({
    ...data,
    members: [...data.members, m],
  }));
};
