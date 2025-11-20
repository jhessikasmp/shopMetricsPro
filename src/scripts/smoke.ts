import http from 'http';

interface Resp { status: number; data: string }

function req(method: string, path: string, body?: any, token?: string): Promise<Resp> {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : undefined;
    const headers: Record<string, string | number> = data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const port = Number(process.env.PORT || 4000);
    const r = http.request({ hostname: 'localhost', port, path, method, headers }, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => resolve({ status: res.statusCode || 0, data: raw }));
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

function parseJson<T>(resp: Resp): T | null {
  try { return JSON.parse(resp.data); } catch { return null; }
}

async function run() {
  try {
    const health = await req('GET', '/healthz');
    console.log('Health:', health.status, health.data);

    // Signup or login with email/password
    const email = `smoke+${Date.now()}@example.com`;
    const password = 'secret123';
    const signup = await req('POST', '/auth/signup', { email, password, name: 'Smoke' });
    console.log('Signup:', signup.status, signup.data);
    // Always login to get fresh tokens
    const login = await req('POST', '/auth/login', { email, password });
    console.log('Login:', login.status, login.data);
    const loginJson = parseJson<{ access: string; refresh: string }>(login);
    const access = loginJson?.access;
    if (!access) throw new Error('Missing access token in login response');

    // List products (authorized)
    const products = await req('GET', '/products', undefined, access);
    console.log('Products:', products.status, products.data);

    // GraphQL metrics with auth optional (context uses header token if present)
    const metrics = await req('POST', '/graphql', { query: '{ metrics { totalSales topProducts { name totalSold } } }' }, access);
    console.log('Metrics:', metrics.status, metrics.data);

    // GraphQL generate report
    const genBody = { query: 'mutation($m:String!,$f:String!){ generateReport(month:$m, format:$f){ id month format url createdAt } }', variables: { m: '2025-11', f: 'pdf' } };
    const gen = await req('POST', '/graphql', genBody, access);
    console.log('GenerateReport:', gen.status, gen.data);

    // Create order using first product if exists
    const prodJson = parseJson<any[]>(products);
    if (Array.isArray(prodJson) && prodJson.length) {
      const first = prodJson[0];
      const newOrder = await req('POST', '/orders', { productId: first.id, quantity: 1 }, access);
      console.log('NewOrder:', newOrder.status, newOrder.data);
    } else {
      console.log('No products available to create order.');
    }

    // Shopify stub sync (REST)
    const shopify = await req('GET', '/shopify/sync', undefined, access);
    console.log('ShopifySync:', shopify.status, shopify.data);

    console.log('Smoke test completed successfully');
  } catch (err) {
    console.error('Smoke test failed', err);
    process.exit(1);
  }
}

run();
