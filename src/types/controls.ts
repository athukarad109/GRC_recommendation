export interface Control {
  id: string;
  text: string;
  category: string;
  frameworks: string[];
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ChecklistItem {
  id: string;
  text: string;
  category: string;
  frameworks: string[];
  description?: string;
  priority: 'high' | 'medium' | 'low';
} 