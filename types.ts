export interface Member {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  role: 'Member' | 'Committee' | 'Admin';
  wifeName?: string;
  joinDate: string;
  profilePic?: string; // Base64
  wifePic?: string; // Base64
  creditScore: number;
  contributions: Record<string, number>; // year -> amount
  createdAt: string;
}

export interface CommitteeMember {
  id: string;
  name: string;
  role: string; // e.g., Secretary, President
  phone: string;
  photo?: string;
}

export interface Transaction {
  id: string;
  year: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  date: string;
  description: string;
  paymentMode: 'CASH' | 'BANK' | 'QR';
  relatedMemberId?: string; // If it's a member contribution
}

export interface Budget {
  id: string;
  year: string;
  category: string;
  amount: number;
}

export interface BankDetails {
  holderName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  qrCode?: string;
}

export interface AppSettings {
  clubName: string;
  establishedYear: number;
  logo?: string;
  adminPassword?: string; // Simple storage for demo
  rules: Rule[];
}

export interface Rule {
  id: string;
  text: string;
  lastUpdated: string;
}

export interface AppData {
  settings: AppSettings;
  members: Member[];
  committee: CommitteeMember[];
  transactions: Transaction[];
  budgets: Budget[];
  bankDetails: BankDetails;
  years: string[];
}
