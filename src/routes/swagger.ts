import { env } from '../config/env.js';

export const swaggerDoc = {
  openapi: '3.0.0',
  info: {
    title: env.SWAGGER_TITLE,
    version: env.SWAGGER_VERSION,
    description: env.SWAGGER_DESC,
  },
  servers: [{ url: 'http://localhost:' + env.PORT }],
  tags: [
    { name: 'Health', description: 'Check if the API is online and responding.' },
    { name: 'Auth', description: 'Sign in, sign out, and refresh access securely.' },
    { name: 'Products', description: 'Manage store products (list, create, edit, delete).' },
    { name: 'Orders', description: 'View and create orders for the signed-in user.' },
    { name: 'Reports', description: 'Generate and download monthly reports (PDF/CSV).' },
    { name: 'Shopify', description: 'Check and sync data with your Shopify store.' },
  ],
  paths: {
    '/healthz': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Use this endpoint to quickly confirm the system is healthy.',
        responses: { '200': { description: 'ok' } },
      },
    },
    '/auth/google': {
      get: {
        tags: ['Auth'],
        summary: 'Google OAuth redirect',
        description: 'Starts Google login. If not configured, the API reports this method is unavailable.',
        responses: { '302': { description: 'Redirect to Google' }, '501': { description: 'Not configured' } },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh tokens',
        description: 'When your access expires, exchange it for a new one using the refresh token. Think of it as renewing your access card.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshRequest' } } } },
        responses: { '200': { description: 'New tokens', content: { 'application/json': { schema: { $ref: '#/components/schemas/Tokens' } } } }, '401': { description: 'Invalid refresh token' } },
      },
    },
    '/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Signup with email/password',
        description: 'Create your account with email and password. You will receive tokens to use the API right away.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SignupRequest' } } } },
        responses: { '201': { description: 'Created + tokens', content: { 'application/json': { schema: { $ref: '#/components/schemas/TokensWithUser' } } } }, '400': { description: 'Validation error' }, '409': { description: 'Email already registered' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email/password',
        description: 'Sign in with email and password. The response includes tokens for your next requests.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
        responses: { '200': { description: 'Tokens', content: { 'application/json': { schema: { $ref: '#/components/schemas/TokensWithUser' } } } }, '401': { description: 'Invalid credentials' } },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout (revoke one refresh token)',
        description: 'Sign out on this device. Invalidates the provided refresh token to prevent automatic re-login.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshRequest' } } } },
        responses: { '200': { description: 'Revoked', content: { 'application/json': { schema: { $ref: '#/components/schemas/Ok' } } } }, '400': { description: 'Missing/invalid token' } },
      },
    },
    '/auth/logout/all': {
      post: {
        tags: ['Auth'],
        summary: 'Logout all (revoke all refresh tokens for current user)',
        description: 'Sign out on all devices connected to your account. Useful if you lost your phone or computer.',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'All revoked', content: { 'application/json': { schema: { $ref: '#/components/schemas/Ok' } } } }, '401': { description: 'Unauthorized' } },
      },
    },
    '/reports': {
      post: {
        tags: ['Reports'],
        summary: 'Generate report',
        description: 'Generates a report for the selected month in PDF or CSV. The file is created and available to download via the returned link.',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/GenerateReportRequest' } } } },
        responses: { '200': { description: 'Report metadata', content: { 'application/json': { schema: { $ref: '#/components/schemas/ReportMeta' } } } }, '400': { description: 'Validation error' } },
      },
    },
    '/reports/{id}/download': {
      get: {
        tags: ['Reports'],
        summary: 'Download report file',
        description: 'Downloads the report file you generated earlier.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'File stream' }, '404': { description: 'Not found' } },
      },
    },
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'List products',
        description: 'Lists the products available in the store with price and stock.',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Array of products', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Product' } } } } } },
      },
      post: {
        tags: ['Products'],
        summary: 'Create product',
        description: 'Registers a new product with name, SKU, stock, and price.',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductCreate' } } } },
        responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } }, '400': { description: 'Validation error' } },
      },
    },
    '/products/{id}': {
      put: {
        tags: ['Products'],
        summary: 'Update product',
        description: 'Updates an existing product. You can change name, SKU, stock, and price.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductUpdate' } } } },
        responses: { '200': { description: 'Updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } }, '404': { description: 'Not found' } },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete product',
        description: 'Removes a product from the store. This action cannot be undone.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Ok' } } } }, '404': { description: 'Not found' } },
      },
    },
    '/orders': {
      get: {
        tags: ['Orders'],
        summary: 'List orders (current user)',
        description: 'Shows your most recent orders. Useful to track purchases and status.',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Array of orders', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Order' } } } } } },
      },
      post: {
        tags: ['Orders'],
        summary: 'Create order',
        description: 'Creates an order for a selected product. Stock is checked and the total is calculated automatically.',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/OrderCreate' } } } },
        responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } }, '400': { description: 'Validation / stock error' }, '404': { description: 'Product not found' } },
      },
    },
    '/shopify/sync': {
      get: {
        tags: ['Shopify'],
        summary: 'Run Shopify sync (REST if configured, else stub)',
        description: 'Updates counts from your Shopify store when configured. If not configured, uses local system numbers so you can test.',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Sync result', content: { 'application/json': { schema: { $ref: '#/components/schemas/ShopifySync' } } } }, '500': { description: 'Sync failed' } },
      },
    },
    '/shopify/status': {
      get: {
        tags: ['Shopify'],
        summary: 'Check Shopify integration status',
        description: 'Tells whether the Shopify integration is active and reachable. Also shows sample numbers when possible.',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Status info', content: { 'application/json': { schema: { $ref: '#/components/schemas/ShopifyStatus' } } } } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Ok: { description: 'Simple response indicating success.', type: 'object', properties: { success: { type: 'boolean', example: true } } },
      Tokens: {
        description: 'Pair of codes used to access the API (access) and renew access (refresh).',
        type: 'object',
        properties: { access: { type: 'string' }, refresh: { type: 'string' }, jti: { type: 'string' } },
      },
      TokensWithUser: {
        description: 'Same as Tokens, including the user identifier.',
        type: 'object',
        properties: { userId: { type: 'string' }, access: { type: 'string' }, refresh: { type: 'string' }, jti: { type: 'string' } },
      },
      RefreshRequest: { description: 'Provide the refresh token here to receive new access.', type: 'object', properties: { refresh: { type: 'string' } }, required: ['refresh'] },
      SignupRequest: { description: 'Basic data to create your account.', type: 'object', properties: { email: { type: 'string' }, password: { type: 'string', minLength: 6 }, name: { type: 'string' } }, required: ['email', 'password'] },
      LoginRequest: { description: 'Your credentials to sign in.', type: 'object', properties: { email: { type: 'string' }, password: { type: 'string', minLength: 6 } }, required: ['email', 'password'] },
      Product: {
        description: 'An item you sell in the store.',
        type: 'object',
        properties: {
          id: { type: 'string' }, name: { type: 'string' }, sku: { type: 'string' }, stock: { type: 'integer' }, price: { type: 'number' }, createdAt: { type: 'string', format: 'date-time' }, updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ProductCreate: { description: 'Required data to register a product.', type: 'object', properties: { name: { type: 'string' }, sku: { type: 'string' }, stock: { type: 'integer' }, price: { type: 'number' } }, required: ['name', 'sku', 'stock', 'price'] },
      ProductUpdate: { description: 'Fields you can change on a product.', type: 'object', properties: { name: { type: 'string' }, sku: { type: 'string' }, stock: { type: 'integer' }, price: { type: 'number' } } },
      Order: {
        description: 'A purchase made by the current user.',
        type: 'object',
        properties: {
          id: { type: 'string' }, productId: { type: 'string' }, userId: { type: 'string', nullable: true }, quantity: { type: 'integer' }, totalPrice: { type: 'number' }, createdAt: { type: 'string', format: 'date-time' }, updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      OrderCreate: { description: 'Which product you want to buy and in what quantity.', type: 'object', properties: { productId: { type: 'string' }, quantity: { type: 'integer', minimum: 1 } }, required: ['productId', 'quantity'] },
      ReportMeta: { description: 'Information about the generated report, including where to download it.', type: 'object', properties: { id: { type: 'string' }, month: { type: 'string' }, format: { type: 'string', enum: ['pdf', 'csv'] }, url: { type: 'string' } } },
      GenerateReportRequest: { description: 'Choose the month and the format (PDF or CSV).', type: 'object', properties: { month: { type: 'string' }, format: { type: 'string', enum: ['pdf', 'csv'] } }, required: ['month', 'format'] },
      ShopifySync: {
        description: 'Sync result. Shows counts and where they came from (real Shopify or local numbers).',
        type: 'object',
        properties: { success: { type: 'boolean' }, products: { type: 'integer' }, orders: { type: 'integer' }, lastSyncAt: { type: 'string', format: 'date-time' }, source: { type: 'string', enum: ['shopify-rest', 'stub-db'] } },
      },
      ShopifyStatus: {
        description: 'Status of the Shopify integration in plain language.',
        type: 'object',
        properties: {
          success: { type: 'boolean' }, active: { type: 'boolean' }, source: { type: 'string', enum: ['shopify-rest', 'stub-db'] }, shopDomain: { type: 'string', nullable: true }, apiVersion: { type: 'string' }, hasAdminToken: { type: 'boolean' }, hasAesSecret: { type: 'boolean' }, reachable: { type: 'boolean', nullable: true }, sample: { type: 'object', nullable: true, properties: { productsCount: { type: 'integer' } } }, error: { type: 'string', nullable: true },
        },
      },
    },
  },
} as const;
