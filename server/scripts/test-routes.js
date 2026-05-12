/* eslint-disable no-console */
/**
 * Lightweight route-ordering audit for the Express routers we own.
 *
 * Why: Express matches routes in registration order. A parameterized route
 * like `GET /:ref` registered BEFORE a sibling specific route like
 * `GET /stats` will swallow the request and produce confusing 404s/empty
 * payloads (the actual bug that caused `/api/orders/stats` to return
 * "order not found" and the customer overview to show 0 for everything).
 *
 * This script walks each router's stack and asserts:
 *   1. Every specific literal path (e.g. `/stats`) is registered BEFORE any
 *      same-method parameterized path that would shadow it (e.g. `/:ref`).
 *   2. A small allowlist of known endpoints exist on each router.
 *
 * Run:  node server/scripts/test-routes.js
 * Exit: 0 on pass, 1 on failure (suitable for CI).
 */

const path = require('path');

const ROUTERS = [
  {
    name: 'orders',
    module: path.resolve(__dirname, '..', 'routes', 'orders.js'),
    requiredEndpoints: [
      { method: 'POST', path: '/checkout' },
      { method: 'GET', path: '/' },
      { method: 'GET', path: '/stats' },
      { method: 'GET', path: '/:ref' },
      { method: 'POST', path: '/:ref/pay' },
      { method: 'POST', path: '/:ref/confirm' },
      { method: 'POST', path: '/:ref/claim' },
      { method: 'POST', path: '/:ref/cancel' },
      { method: 'POST', path: '/:ref/reorder' },
    ],
  },
  {
    name: 'customerAuth',
    module: path.resolve(__dirname, '..', 'routes', 'customerAuth.js'),
    requiredEndpoints: [
      { method: 'GET', path: '/me' },
      { method: 'PATCH', path: '/me' },
    ],
  },
  {
    name: 'admin',
    module: path.resolve(__dirname, '..', 'routes', 'admin.js'),
    requiredEndpoints: [
      { method: 'GET', path: '/activity-feed' },
      { method: 'GET', path: '/users/directory' },
      { method: 'GET', path: '/users' },
      { method: 'GET', path: '/users/:id' },
      { method: 'POST', path: '/users' },
      { method: 'PUT', path: '/users/:id' },
      { method: 'DELETE', path: '/users/:id' },
    ],
  },
  {
    name: 'adminStorefront',
    module: path.resolve(__dirname, '..', 'routes', 'adminStorefront.js'),
    requiredEndpoints: [
      { method: 'GET', path: '/store/orders/stats' },
      { method: 'GET', path: '/store/orders' },
      { method: 'GET', path: '/store/orders/:ref' },
      { method: 'PATCH', path: '/store/orders/:ref' },
      { method: 'GET', path: '/store/customers' },
      { method: 'GET', path: '/store/customers/:id' },
      { method: 'GET', path: '/store/order-requests' },
      { method: 'GET', path: '/store/order-requests/:id' },
      { method: 'PATCH', path: '/store/order-requests/:id' },
      { method: 'GET', path: '/store/leads/stats' },
      { method: 'GET', path: '/store/leads' },
      { method: 'GET', path: '/store/leads/:id' },
      { method: 'PATCH', path: '/store/leads/:id' },
    ],
  },
];

/** Returns the methods+route entries from an Express router's internal stack. */
function listRoutes(router) {
  const out = [];
  for (const layer of router.stack || []) {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods || {})
        .filter((m) => layer.route.methods[m])
        .map((m) => m.toUpperCase());
      for (const method of methods) {
        out.push({ method, path: layer.route.path });
      }
    }
  }
  return out;
}

/**
 * For a given (method, path) pair, build a regex describing what concrete
 * URLs would match — when path = '/stats', we want to know whether any
 * earlier '/:something' pattern with the same method would also match.
 */
function pathToTestUrl(p) {
  // Replace any :param segment with a sample literal so we can test against
  // earlier patterns.
  return p.replace(/:[^/]+/g, 'sample');
}

function pathToMatcher(p) {
  // Convert Express path to a RegExp (mirrors Express' path-to-regexp v0 behavior
  // for the subset we use: literal segments and :param segments).
  const escaped = p
    .replace(/\//g, '\\/')
    .replace(/:[^\\/]+/g, '[^/]+');
  return new RegExp('^' + escaped + '$');
}

function hasShadowingPredecessor(routes, currentIdx) {
  const { method, path: currentPath } = routes[currentIdx];
  const url = pathToTestUrl(currentPath);
  for (let i = 0; i < currentIdx; i++) {
    const earlier = routes[i];
    if (earlier.method !== method) continue;
    if (earlier.path === currentPath) continue;
    // An earlier parameterized path shadows when its regex matches our literal URL.
    const matcher = pathToMatcher(earlier.path);
    if (matcher.test(url) && earlier.path.includes(':')) {
      return earlier;
    }
  }
  return null;
}

let pass = true;

for (const def of ROUTERS) {
  console.log(`\n[routes] auditing ${def.name}`);
  let router;
  try {
    router = require(def.module);
  } catch (e) {
    console.error(`  ✗ could not load ${def.module}: ${e.message}`);
    pass = false;
    continue;
  }
  const routes = listRoutes(router);
  console.log(`  • registered ${routes.length} route(s)`);

  // 1. Shadowing check
  for (let i = 0; i < routes.length; i++) {
    const r = routes[i];
    if (r.path.includes(':')) continue; // only check literal paths
    const shadower = hasShadowingPredecessor(routes, i);
    if (shadower) {
      console.error(
        `  ✗ ${r.method} ${r.path} is shadowed by earlier ${shadower.method} ${shadower.path}`,
      );
      pass = false;
    } else {
      console.log(`  ✓ ${r.method} ${r.path} (no shadow)`);
    }
  }

  // 2. Required endpoints
  for (const req of def.requiredEndpoints) {
    const found = routes.find((r) => r.method === req.method && r.path === req.path);
    if (!found) {
      console.error(`  ✗ missing required ${req.method} ${req.path}`);
      pass = false;
    } else {
      console.log(`  ✓ has ${req.method} ${req.path}`);
    }
  }
}

if (!pass) {
  console.error('\n[routes] AUDIT FAILED');
  process.exit(1);
}
console.log('\n[routes] AUDIT OK');
