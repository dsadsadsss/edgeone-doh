const DOH_SERVERS = [
  'https://cloudflare-dns.com/dns-query',
  'https://dns.google/dns-query',
  'https://dns.quad9.net/dns-query',
  'https://doh.opendns.com/dns-query',
];

const TYPE_BINARY = 'application/dns-message';
const TYPE_JSON   = 'application/dns-json';

export async function onRequest(context) {
  const request = context.request;
  const { method, headers } = request;
  const { searchParams, search } = new URL(request.url);

  let upstreamURL = '';
  let fetchOptions = {};

  if (method === 'GET' && searchParams.has('dns')) {
    upstreamURL = '?dns=' + searchParams.get('dns');
    fetchOptions = { method: 'GET', headers: { Accept: TYPE_BINARY } };
  } else if (method === 'POST' && headers.get('content-type') === TYPE_BINARY) {
    fetchOptions = {
      method: 'POST',
      headers: { Accept: TYPE_BINARY, 'Content-Type': TYPE_BINARY },
      body: request.body,
    };
  } else if (method === 'GET' && headers.get('accept') === TYPE_JSON) {
    upstreamURL = search;
    fetchOptions = { method: 'GET', headers: { Accept: TYPE_JSON } };
  } else {
    return new Response('Bad Request', { status: 400 });
  }

  let lastError = '';
  for (const server of DOH_SERVERS) {
    try {
      const res = await fetch(server + upstreamURL, fetchOptions);
      if (res.ok) {
        const respHeaders = new Headers(res.headers);
        respHeaders.set('Access-Control-Allow-Origin', '*');
        respHeaders.set('X-DoH-Server', server);
        return new Response(res.body, { status: res.status, headers: respHeaders });
      }
      lastError = `${server} → HTTP ${res.status}`;
    } catch (err) {
      lastError = `${server} → ${err.message}`;
    }
  }

  return new Response(`All DoH servers failed. Last error: ${lastError}`, {
    status: 502,
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
}
