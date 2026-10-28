import { NextResponse } from 'next/server';
import { readerRequest, sameOrigin, setSession } from '../../../../lib/server-api';

async function proxy(request, { params }) {
  const { path } = await params;
  const route = path.join('/');
  if (!/^(me|dashboard|settings|preparations|articles(?:\/\d+(?:\/prepare)?)?|categories(?:\/\d+)?|sources(?:\/\d+(?:\/test)?)?|runs(?:\/\d+)?|logs)$/.test(route))
    return NextResponse.json({ detail: 'Not found' }, { status: 404 });
  if (request.method !== 'GET' && !sameOrigin(request))
    return NextResponse.json({ detail: 'Invalid origin' }, { status: 403 });
  try {
    if (Number(request.headers.get('content-length') || 0) > 131072)
      return NextResponse.json({ detail: 'Request too large' }, { status: 413 });
    const body = ['POST', 'PUT'].includes(request.method) ? JSON.stringify(await request.json()) : undefined;
    if (body && body.length > 131072) return NextResponse.json({ detail: 'Request too large' }, { status: 413 });
    const { response, session } = await readerRequest(`/admin/${route}/${new URL(request.url).search}`, { method: request.method, body });
    const result = response.status === 204 ? new NextResponse(null, { status: 204 }) :
      NextResponse.json(await response.json(), { status: response.status });
    result.headers.set('Cache-Control', 'private, no-store');
    if (session) setSession(result, session);
    return result;
  } catch {
    return NextResponse.json({ detail: 'Admin service unavailable. Please retry.' }, { status: 502 });
  }
}
export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
