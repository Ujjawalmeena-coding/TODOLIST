export interface ChecklistItem {
  id: number;
  text: string;
  completed: boolean;
}

export interface MasterChecklistItem {
  id: number;
  text: string;
}

export interface ActivityData {
  [date: string]: {
    level: number; // e.g., 0-4 for different shades of green
  };
}
