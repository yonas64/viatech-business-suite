const baseUrl = (process.env.API_BASE_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '');
const requestTimeoutMs = 15_000;
let passed = 0;
let token;
let productId;
let categoryId;
let managedUserId;
let expenseId;

async function request(method, path, { body, auth = true } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(requestTimeoutMs),
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const detail = typeof data === 'string' ? data : JSON.stringify(data);
    throw new Error(`${method} ${path} returned ${response.status}: ${detail}`);
  }

  passed += 1;
  console.log(`PASS ${method.padEnd(6)} ${path} (${response.status})`);
  return data;
}

async function expectStatus(method, path, expectedStatus, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
  if (response.status !== expectedStatus) {
    const detail = await response.text();
    throw new Error(`${method} ${path} returned ${response.status}, expected ${expectedStatus}: ${detail}`);
  }
  passed += 1;
  console.log(`PASS ${method.padEnd(6)} ${path} (${response.status}, expected)`);
}

function requireValue(value, description) {
  if (!value) throw new Error(`Response did not include ${description}`);
  return value;
}

async function bestEffortCleanup() {
  if (!token) return;
  for (const [path, id] of [
    ['/products', productId],
    ['/users', managedUserId],
    ['/expenses', expenseId],
  ]) {
    if (!id) continue;
    try {
      await fetch(`${baseUrl}${path}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(3000),
      });
    } catch {
      // Keep the primary smoke-test error visible if cleanup also fails.
    }
  }
}

async function main() {
  console.log(`Running Viatech API smoke test against ${baseUrl}`);

  await request('GET', '/');

  const suffix = `${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
  const email = `api-smoke-${suffix}@example.test`;
  const username = `smoke${suffix}`;
  const password = `Smoke-${suffix}-Pass!`;

  const registered = await request('POST', '/auth/register', {
    auth: false,
    body: {
      name: 'API Smoke Test Admin',
      username,
      email,
      password,
      role: 'admin',
    },
  });
  if (registered.role !== 'admin') {
    throw new Error(`Expected a newly registered admin, got role: ${registered.role}`);
  }

  const login = await request('POST', '/auth/login', {
    auth: false,
    body: { emailOrUsername: email, password },
  });
  token = requireValue(login.access_token, 'access_token from login');
  await request('GET', '/auth/me');

  const managedUser = await request('POST', '/users', {
    body: {
      name: 'API Smoke Test Staff',
      username: `staff${suffix}`,
      email: `staff-${suffix}@example.test`,
      password,
      role: 'staff',
    },
  });
  managedUserId = requireValue(managedUser.id, 'managed user id');
  await request('GET', '/users');
  await request('GET', `/users/${managedUserId}`);
  await request('PATCH', `/users/${managedUserId}`, {
    body: { name: 'API Smoke Test Staff Updated' },
  });
  await request('DELETE', `/users/${managedUserId}`);
  managedUserId = undefined;

  const category = await request('POST', '/categories', {
    body: {
      name: `API Smoke ${suffix}`,
      description: 'Temporary smoke test category',
      specificationFields: [
        { key: 'micaThickness', label: 'Mica thickness', type: 'number', unit: 'mm' },
        { key: 'dimensions', label: 'Dimensions', type: 'dimensions', unit: 'mm', required: false },
      ],
    },
  });
  categoryId = requireValue(category._id, 'category _id');
  await request('GET', '/categories');
  await request('GET', `/categories/${categoryId}`);
  await request('PATCH', `/categories/${categoryId}`, {
    body: { description: 'Updated by API smoke test' },
  });

  const product = await request('POST', '/products', {
    body: {
      name: `API Smoke Product ${suffix}`,
      description: 'Temporary product used by the API smoke test',
      categoryId,
      variants: [
        {
          specification: 'test-unit',
          specifications: {
            micaThickness: 3,
            dimensions: { width: 600, height: 300 },
          },
          sku: `SMOKE-${suffix}`,
          costPrice: 10,
          sellingPrice: 20,
          quantity: 8,
          unit: 'pcs',
          lowStockThreshold: 20,
        },
      ],
    },
  });
  productId = requireValue(product._id, 'product _id');
  const variantId = requireValue(product.variants?.[0]?._id, 'variant _id');
  await request('GET', '/products');
  await request(
    'GET',
    `/products?categoryId=${categoryId}&search=${encodeURIComponent('API Smoke')}&page=1&limit=10&specificationKey=micaThickness&specificationValue=3`,
  );
  await request('GET', `/products/${productId}`);
  await request('PATCH', `/products/${productId}`, {
    body: { name: `API Smoke Product Updated ${suffix}` },
  });

  const addedVariant = await request('POST', `/products/${productId}/variants`, {
    body: {
      specification: 'test-second-unit',
      specifications: { micaThickness: 4 },
      sku: `SMOKE-SECOND-${suffix}`,
      costPrice: 11,
      sellingPrice: 22,
      quantity: 3,
      unit: 'pcs',
    },
  });
  const addedVariantId = requireValue(addedVariant._id, 'added variant _id');
  await expectStatus('POST', `/products/${productId}/variants`, 409, {
    specification: 'duplicate sku attempt',
    specifications: { micaThickness: 3 },
    sku: `SMOKE-${suffix}`,
    costPrice: 10,
    sellingPrice: 20,
    quantity: 1,
  });
  await request('PATCH', `/products/${productId}/variants/${addedVariantId}`, {
    body: { sellingPrice: 23 },
  });
  await request('DELETE', `/products/${productId}/variants/${addedVariantId}`);

  const movement = { productId, variantId, quantity: 4, reason: 'Smoke test add' };
  await request('POST', '/inventory/stock/add', { body: movement });
  await request('POST', '/inventory/stock/remove', {
    body: { ...movement, quantity: 1, reason: 'Smoke test remove' },
  });
  await request('POST', '/inventory/stock/adjust', {
    body: { ...movement, quantity: 10, reason: 'Smoke test adjustment' },
  });
  await expectStatus('POST', '/inventory/stock/remove', 400, {
    ...movement,
    quantity: 999,
    reason: 'Smoke test insufficient stock guard',
  });
  await request('GET', '/inventory/stock');
  await request(
    'GET',
    `/inventory/stock?productId=${encodeURIComponent(productId)}&variantId=${encodeURIComponent(variantId)}`,
  );
  await request(
    'GET',
    `/inventory/movements?productId=${encodeURIComponent(productId)}&variantId=${encodeURIComponent(variantId)}`,
  );
  await request('GET', '/inventory/movements');
  await request(
    'GET',
    `/inventory/movements?productId=${encodeURIComponent(productId)}&variantId=${encodeURIComponent(variantId)}&movementType=out&page=1&limit=10`,
  );
  await request('GET', '/inventory/low-stock');

  const sale = await request('POST', '/sales', {
    body: {
      items: [{ productId, variantId, quantity: 2, unitPrice: 20 }],
      paymentMethod: 'cash',
      paymentStatus: 'pending',
    },
  });
  const saleId = requireValue(sale._id, 'sale _id');
  requireValue(sale.saleReference, 'sale reference');
  requireValue(sale.saleDate, 'sale date');
  if (
    sale.paymentStatus !== 'pending' ||
    sale.subtotal !== 40 ||
    sale.vat !== 6 ||
    sale.total !== 46
  ) {
    throw new Error(`Sale totals or payment status were unexpected: ${JSON.stringify(sale)}`);
  }
  await request(
    'GET',
    `/inventory/movements?productId=${encodeURIComponent(productId)}&variantId=${encodeURIComponent(variantId)}&movementType=sale`,
  );
  await request('GET', '/sales');
  await request('GET', `/sales/${saleId}`);

  const expenseDate = new Date().toISOString();
  const expense = await request('POST', '/expenses', {
    body: {
      category: 'Transport',
      amount: 5,
      expenseDate,
      description: `API smoke transport expense ${suffix}`,
      reference: `EXP-${suffix}`,
    },
  });
  expenseId = requireValue(expense._id, 'expense _id');
  await request('GET', '/expenses?category=transport&page=1&limit=10');
  await request('GET', `/expenses/${expenseId}`);
  await request('PATCH', `/expenses/${expenseId}`, {
    body: { description: `Updated API smoke expense ${suffix}` },
  });

  const reportDate = new Date().toISOString().slice(0, 10);
  const report = await request(
    'GET',
    `/reports/summary?from=${reportDate}&to=${reportDate}&productId=${productId}&categoryId=${categoryId}`,
  );
  if (
    report.salesCount !== 1 ||
    report.salesSubtotal !== 40 ||
    report.vat !== 6 ||
    report.totalDue !== 46 ||
    report.costOfGoodsSold !== 20 ||
    report.expenses !== 5 ||
    report.estimatedProfit !== 15 ||
    !Array.isArray(report.recentSales) ||
    !Array.isArray(report.recentStockMovements)
  ) {
    throw new Error(`Filtered report totals were unexpected: ${JSON.stringify(report)}`);
  }
  await request('GET', '/finance/summary');
  const financialSummary = await request(
    'GET',
    `/finance/summary?from=${reportDate}&to=${reportDate}`,
  );
  if (financialSummary.expenses !== 5 || financialSummary.costOfGoodsSold !== 20) {
    throw new Error(`Finance summary totals were unexpected: ${JSON.stringify(financialSummary)}`);
  }
  await request('GET', '/reports/daily');
  await request('GET', '/reports/weekly');
  await request('GET', '/reports/monthly');

  await request('DELETE', `/products/${productId}`);
  productId = undefined;
  await request('DELETE', `/expenses/${expenseId}`);
  expenseId = undefined;

  console.log(`\nAll ${passed} API smoke checks passed.`);
  console.log(`A test admin, soft-deleted product and category, sale, and inventory movements remain in the database.`);
}

main().catch(async (error) => {
  console.error(`\nAPI smoke test failed after ${passed} successful checks.`);
  console.error(error instanceof Error ? error.message : error);
  await bestEffortCleanup();
  process.exitCode = 1;
});
