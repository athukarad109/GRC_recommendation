import { NextResponse } from 'next/server';
import { getControlsForFrameworks } from '@utils/enhancedControls';
import type { ChecklistItem } from '../../../types/controls';

export async function POST(req: Request) {
  try {
    const { frameworks } = await req.json();
    
    if (!Array.isArray(frameworks) || frameworks.length === 0) {
      return NextResponse.json(
        { error: 'Invalid frameworks data. Please select at least one framework.' },
        { status: 400 }
      );
    }

    const controls = await getControlsForFrameworks(frameworks);

    if (!controls || !Array.isArray(controls)) {
      return NextResponse.json(
        { error: 'Failed to generate controls. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      checklist: controls.map((control): ChecklistItem => ({
        id: control.id,
        text: control.text,
        name: control.name,
        category: control.category,
        frameworks: control.frameworks,
        description: control.description,
        priority: control.priority,
        implementationSteps: control.implementationSteps
      }))
    });
  } catch (error) {
    console.error('Error in custom-checklist:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating the checklist. Please try again.' },
      { status: 500 }
    );
  }
}