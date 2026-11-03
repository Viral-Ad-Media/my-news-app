import { renderNewsIllustration } from '../../../lib/news-illustration';

export function GET(request) {
  const params = new URL(request.url).searchParams;
  return new Response(renderNewsIllustration({ story: params.get('story'), topic: params.get('topic'), title: params.get('title') }), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
