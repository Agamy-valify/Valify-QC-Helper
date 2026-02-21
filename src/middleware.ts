import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
    if (process.env.NODE_ENV === 'development') {
        console.log(`Request made to: ${req.nextUrl.pathname}`);
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/api/:path*'], // Apply this middleware to all API routes
};