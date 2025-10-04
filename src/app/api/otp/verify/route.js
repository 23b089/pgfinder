// OTP removed: this endpoint is deprecated.
import { NextResponse } from 'next/server';
export const runtime = 'edge';
export async function POST() {
  return NextResponse.json({ error: 'OTP has been removed' }, { status: 410 });
}
