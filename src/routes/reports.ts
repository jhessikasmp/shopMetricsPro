import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as controller from '../controllers/reportsController.js';

export const reportsRouter = express.Router();

reportsRouter.post('/', requireAuth, controller.generate);
reportsRouter.get('/:id/download', requireAuth, controller.download);
