export type MentalLoadType = 'planning' | 'execution' | 'coordination' | 'reminder';

export interface MentalLoadEvent {
  id: string;
  userId: string;
  type: MentalLoadType;
  /** Gewichtung: Planung/Koordination zählt mehr */
  weight: number;
  description: string;
  /** YYYY-MM-DD */
  date: string;
  createdAt: string;
}

/** Kognitive Last-Multiplikatoren */
export const MENTAL_LOAD_WEIGHTS: Record<MentalLoadType, number> = {
  planning: 3,
  coordination: 2.5,
  reminder: 2,
  execution: 1,
};
