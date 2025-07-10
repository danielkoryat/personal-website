import { NextResponse } from "next/server";

// app/api/health/route.js
export async function GET() {
  return Response.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}
