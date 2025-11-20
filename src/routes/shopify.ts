import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as controller from '../controllers/shopifyController.js';

export const shopifyRouter = express.Router();

shopifyRouter.get('/sync', requireAuth, controller.sync);
shopifyRouter.get('/status', requireAuth, controller.status);
