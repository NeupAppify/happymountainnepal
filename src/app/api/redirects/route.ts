
'use server';
import { NextResponse } from 'next/server';
import redirects from '@base/core/redirects.json';

// GET - Fetch all redirects from local file
export async function GET() {
    return NextResponse.json({ redirects });
}

// POST - Add or delete a redirect (Not implemented for local file yet, needs FS write)
export async function POST(request: Request) {
    return NextResponse.json({ error: 'Modification not supported for local file system yet.' }, { status: 501 });
}
