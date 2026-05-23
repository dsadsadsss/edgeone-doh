const DOH_SERVERS = [
  'https://cloudflare-dns.com/dns-query',
  'https://dns.google/dns-query',
  'https://dns.quad9.net/dns-query',
  'https://doh.opendns.com/dns-query',
];

export async function onRequest() {
  return new Response(JSON.stringify({
    status: 'healthy',
    service: 'DoH Proxy',
    timestamp: new Date().toISOString(),
    upstreamDNS: DOH_SERVERS,
    version: '1.2.0',
  }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
