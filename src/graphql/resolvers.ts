import { GraphQLResolveInfo } from 'graphql';
import { getMetrics } from '../services/metrics.js';
import { syncShopifyStub } from '../services/shopify.js';
import { generateReport } from '../services/report.js';
import { verifyAccess } from '../services/jwt.js';

export const resolvers = {
  Query: {
    health: () => 'ok',
    metrics: async () => getMetrics(),
  },
  Mutation: {
    syncShopify: async (_: unknown, __: unknown, ctx: { token?: string | null }) => {
      if (!ctx?.token) throw new Error('Unauthorized');
      try { verifyAccess(ctx.token.replace(/^Bearer\s+/i, '')); } catch { throw new Error('Unauthorized'); }
      await syncShopifyStub();
      return true;
    },
    generateReport: async (_: unknown, args: { month: string; format: string }, ctx: { token?: string | null }) => {
      let userId: string | null = null;
      if (ctx?.token) {
        try { const payload = verifyAccess(ctx.token.replace(/^Bearer\s+/i, '')); userId = payload.sub; } catch {}
      }
      if (!userId) throw new Error('Unauthorized');
      const rpt = await generateReport(args.month, args.format, userId);
      return {
        id: rpt.id,
        month: rpt.month,
        format: rpt.format,
        url: rpt.url,
        createdAt: rpt.createdAt,
      };
    },
  },
};
