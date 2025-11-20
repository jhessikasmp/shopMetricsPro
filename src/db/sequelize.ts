import { Sequelize } from 'sequelize';
import { env, skipDbInit } from '../config/env.js';

export const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  logging: env.NODE_ENV === 'development' ? console.log : false,
});

export async function initDb() {
  try {
    if (skipDbInit) {
      console.log('DB init skipped by SKIP_DB_INIT');
      return;
    }
    await sequelize.authenticate();
    console.log('DB connected');
  } catch (err) {
    console.error('DB connection error', err);
    throw err;
  }
}
