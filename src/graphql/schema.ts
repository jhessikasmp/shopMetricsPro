import { gql } from 'graphql-tag';

export const typeDefs = gql`
  scalar Date

  type ProductMetric {
    productId: String!
    name: String!
    totalSold: Int!
  }

  type LowStockProduct {
    productId: String!
    name: String!
    stock: Int!
  }

  type Metrics {
    totalSales: Float!
    topProducts: [ProductMetric!]!
    lowStock: [LowStockProduct!]!
  }

  type Report {
    id: String!
    month: String!
    format: String!
    url: String!
    createdAt: Date!
  }

  type Query {
    metrics: Metrics!
    health: String!
  }

  type Mutation {
    syncShopify: Boolean!
    generateReport(month: String!, format: String!): Report!
  }
`;
