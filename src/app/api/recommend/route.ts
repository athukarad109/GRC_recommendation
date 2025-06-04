import { NextResponse } from "next/server";
import { recommendFrameworks } from "@utils/rules";
import type { OrgFormData } from "@/types/formData";

export async function POST(req: Request) {
  const body = await req.json();
  const data: OrgFormData = body;
  const result = recommendFrameworks(data);
  return NextResponse.json(result);
}
