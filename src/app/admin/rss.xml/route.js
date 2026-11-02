import { NextResponse } from 'next/server';
import { readerRequest, setSession } from '../../../lib/server-api';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };
  try {
    // Layouts do not protect route handlers. The backend checks staff access.
    const { response, session } = await readerRequest(`/rss/${new URL(request.url).search}`);
    const result = new NextResponse(await response.text(), {
      status: response.status,
      headers: { ...headers, 'Content-Type': response.headers.get('content-type') || 'text/plain' },
    });
    if (session) setSession(result, session);
    return result;
  } catch {
    return new NextResponse('RSS service unavailable. Please retry.', { status: 503, headers });
  }
}
