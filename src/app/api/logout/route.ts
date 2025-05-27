import { NextResponse } from "next/server";
import { removeAuthCookie } from "@utils/auth";

export async function POST() {
  removeAuthCookie();
  return NextResponse.json({ success: true });
}