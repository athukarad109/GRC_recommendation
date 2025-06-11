export interface Control {
  id: string;
  text: string;
  name: string;
  category: string;
  frameworks: string[];
  description: string;
  priority: 'high' | 'medium' | 'low';
  implementationSteps?: string[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  name: string;
  category: string;
  frameworks: string[];
  description?: string;
  priority: 'high' | 'medium' | 'low';
  implementationSteps?: string[];
} 