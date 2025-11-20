import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as controller from '../controllers/productsController.js';

export const productsRouter = express.Router();

productsRouter.get('/', requireAuth, controller.list);
productsRouter.post('/', requireAuth, controller.create);
productsRouter.put('/:id', requireAuth, controller.update);
productsRouter.delete('/:id', requireAuth, controller.remove);
