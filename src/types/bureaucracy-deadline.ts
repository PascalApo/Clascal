export type BureaucracyCategory =
  | 'fahrzeug'
  | 'versicherung'
  | 'steuer'
  | 'miete'
  | 'behoerde'
  | 'sonstiges';

export interface BureaucracyTemplate {
  id: string;
  title: string;
  category: BureaucracyCategory;
  description: string;
  /** Tage vor Frist für Erinnerung */
  remindDaysBefore: number;
  /** Optionale geschätzte Kosten für Budget-Hinweis */
  estimatedCost?: number;
  checklist: string[];
}

export interface BureaucracyDeadline {
  id: string;
  templateId: string;
  title: string;
  category: BureaucracyCategory;
  /** YYYY-MM-DD */
  dueDate: string;
  completed: boolean;
  assignedTo: 'user1' | 'user2' | 'both';
  notes?: string;
  estimatedCost?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export function daysUntilDue(dueDate: string, today = new Date()): number {
  const [y, m, d] = dueDate.split('-').map(Number);
  const due = new Date(y, m - 1, d);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.ceil((due.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}
