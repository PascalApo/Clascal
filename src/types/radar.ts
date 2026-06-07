import type { UserId } from '@/types/user';
import type { Recipe } from '@/types/recipe';
import type { PantryItem } from '@/types/pantry';
import type { BureaucracyDeadline } from '@/types/bureaucracy-deadline';

export type RadarCollisionSeverity = 'info' | 'warning' | 'urgent';

export interface RadarCollision {
  id: string;
  severity: RadarCollisionSeverity;
  title: string;
  description: string;
  /** YYYY-MM-DD */
  date?: string;
  weekday?: number;
  relatedModule: 'kalender' | 'essen' | 'einkauf' | 'buerokratie' | 'fairness';
}

export interface RadarFoodAction {
  type: 'expiry' | 'guest' | 'missing_meal';
  title: string;
  description: string;
  recipe?: Recipe;
  pantryItems?: PantryItem[];
  weekday?: number;
}

export interface RadarAssignment {
  title: string;
  description: string;
  suggestedAssignee: UserId | 'both';
  reason: string;
  /** Optional: Aufgabe direkt anlegen */
  taskTitle?: string;
  weekday?: number;
}

export interface RadarShoppingSuggestion {
  name: string;
  reason: string;
}

export interface FairnessReport {
  user1Score: number;
  user2Score: number;
  user1Planning: number;
  user2Planning: number;
  user1Execution: number;
  user2Execution: number;
  balanceHint: string;
}

export interface RadarBriefing {
  weekLabel: string;
  generatedAt: string;
  summary: string;
  collisionCount: number;
  collisions: RadarCollision[];
  foodActions: RadarFoodAction[];
  assignments: RadarAssignment[];
  shoppingSuggestions: RadarShoppingSuggestion[];
  upcomingDeadlines: BureaucracyDeadline[];
  fairness: FairnessReport;
}
