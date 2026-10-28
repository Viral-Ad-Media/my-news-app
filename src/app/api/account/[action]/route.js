import { NextResponse } from 'next/server';
import { buildServerApiUrl, sameOrigin, clearSession } from '../../../../lib/server-api';
export async function POST(request, { params }) {
  const { action } = await params;
  const path = { 'reset-request': '/password-reset/', 'reset-confirm': '/password-reset/confirm/' }[action];
  if (!path) return NextResponse.json({ detail: 'Not found' }, { status: 404 });
  if (!sameOrigin(request)) return NextResponse.json({ detail: 'Invalid origin' }, { status: 403 });
  try {
    const url = buildServerApiUrl(path);
    if (!url) return NextResponse.json({ detail: 'Account service is not configured.' }, { status: 503 });
    const data = await request.json();
    if (JSON.stringify(data).length > 12000) return NextResponse.json({ detail: 'Request too large' }, { status: 413 });
    const upstream = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), cache: 'no-store', signal: AbortSignal.timeout(15000) });
    const response = NextResponse.json(await upstream.json(), { status: upstream.status });
    response.headers.set('Cache-Control', 'private, no-store');
    if (action === 'reset-confirm' && upstream.ok) clearSession(response);
    return response;
  } catch {
    return NextResponse.json({ detail: 'Account service is unavailable. Please try again later.' }, { status: 502 });
  }
}
