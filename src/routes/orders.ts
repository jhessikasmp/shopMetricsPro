import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as controller from '../controllers/ordersController.js';

export const ordersRouter = express.Router();

ordersRouter.get('/', requireAuth, controller.list);
ordersRouter.post('/', requireAuth, controller.create);
