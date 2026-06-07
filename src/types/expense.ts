export type ExpenseCategory =
  | 'lebensmittel'
  | 'wohnen'
  | 'transport'
  | 'freizeit'
  | 'gesundheit'
  | 'kleidung'
  | 'sonstiges';

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  source: 'manual' | 'pdf';
  createdBy: string;
  createdAt: string;
}

export const EXPENSE_CATEGORIES: { id: ExpenseCategory; label: string; color: string }[] = [
  { id: 'lebensmittel', label: 'Lebensmittel', color: '#00d4ff' },
  { id: 'wohnen', label: 'Wohnen', color: '#ff00aa' },
  { id: 'transport', label: 'Transport', color: '#a855f7' },
  { id: 'freizeit', label: 'Freizeit', color: '#f59e0b' },
  { id: 'gesundheit', label: 'Gesundheit', color: '#10b981' },
  { id: 'kleidung', label: 'Kleidung', color: '#ec4899' },
  { id: 'sonstiges', label: 'Sonstiges', color: '#6b7280' },
];
