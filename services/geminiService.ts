import { GoogleGenAI } from "@google/genai";
import { AppData, Transaction } from "../types";

// In a real app, this key would come from a secure backend or environment variable.
// Since this is a client-side demo, we assume the user has configured it or we rely on the prompt instructions.
const API_KEY = process.env.API_KEY || ''; 

export const generateFinancialReport = async (
  year: string,
  transactions: Transaction[],
  budget: any[],
  totalCollection: number,
  totalExpense: number
): Promise<string> => {
  if (!API_KEY) return "API Key missing. Cannot generate report.";

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `
    You are a financial advisor for the "Annapurna Boys Saraswati Puja Committee".
    Analyze the following data for the year ${year}:
    
    Total Collection: ₹${totalCollection}
    Total Expense: ₹${totalExpense}
    Balance: ₹${totalCollection - totalExpense}
    
    Expense Categories Breakdown:
    ${transactions
      .filter(t => t.year === year && t.type === 'EXPENSE')
      .map(t => `- ${t.category}: ₹${t.amount}`)
      .join('\n')}

    Budget Plan:
    ${budget.filter(b => b.year === year).map(b => `- ${b.category}: ₹${b.amount}`).join('\n')}

    Please provide a brief, professional summary (3-4 bullet points) in English.
    Highlight any overspending compared to budget, suggest savings, and comment on the financial health.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No analysis available.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate report due to an error.";
  }
};
