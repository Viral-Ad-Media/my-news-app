// Browser-only request coalescing. A consumer abort must not cancel other readers.
const requests = new Map();
export function clearSharedJSON() { requests.clear(); }
if (typeof window !== 'undefined') window.addEventListener('news-session', clearSharedJSON);

export function sharedJSON(url, { privateFeed = false, force = false } = {}) {
  const key = `${privateFeed ? 'private' : 'public'}:${url}`;
  const now = Date.now();
  const previous = requests.get(key);
  if (previous?.pending || (!force && previous?.expires > now)) return previous.promise;
  for (const [oldKey, entry] of requests) if (!entry.pending && entry.expires <= now) requests.delete(oldKey);
  const entry = { pending: true, expires: 0, promise: null };
  entry.promise = fetch(url, { cache: privateFeed ? 'no-store' : 'default', signal: AbortSignal.timeout(15000) })
    .then(async response => {
      if (!response.ok) {
        const error = new Error([401,403].includes(response.status) ? 'Please login to view this feed.' : 'Unable to load stories. Please try again.');
        error.status = response.status;
        throw error;
      }
      return response.json();
    }).then(data => {
      entry.pending = false;
      entry.expires = Date.now() + (privateFeed ? 0 : 2000);
      if (privateFeed && requests.get(key) === entry) requests.delete(key);
      return data;
    }).catch(error => {
      if (requests.get(key) === entry) requests.delete(key);
      throw error;
    });
  requests.set(key, entry);
  return entry.promise;
}
