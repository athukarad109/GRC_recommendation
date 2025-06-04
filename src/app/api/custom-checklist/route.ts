import { NextResponse } from 'next/server';
import { getControlsForFrameworks } from '@utils/enhancedControls';
import type { ChecklistItem } from '../../../types/controls';

export async function POST(req: Request) {
  const { frameworks } = await req.json();
  
  const controls = getControlsForFrameworks(frameworks);

  return NextResponse.json({ 
    checklist: controls.map((control): ChecklistItem => ({
      id: control.id,
      text: control.text,
      category: control.category,
      frameworks: control.frameworks,
      description: control.description,
      priority: control.priority
    }))
  });
}