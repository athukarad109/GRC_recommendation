import { NextResponse } from 'next/server';
import { frameworkControls } from '@utils/controls';

export async function POST(req: Request) {
  const { frameworks } = await req.json();
  
  // Unified dummy checklist
  // const checklist = [
  //   "Implement access control policies",
  //   "Conduct regular security assessments",
  //   "Maintain audit logs",
  //   "Implement data encryption",
  //   "Establish incident response procedures",
  //   "Perform regular backups",
  //   "Document security procedures",
  //   "Train employees on security practices",
  //   "Monitor system access",
  //   "Review and update security measures"
  // ];

  const allControls = frameworks.flatMap((fw: string) => frameworkControls[fw] || []);
  const uniqueControls = [...new Set(allControls)];

  return NextResponse.json({ checklist: uniqueControls });

}