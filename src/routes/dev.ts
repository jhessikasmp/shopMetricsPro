import express from 'express';
import * as controller from '../controllers/devController.js';

export const devRouter = express.Router();

devRouter.post('/login', controller.login);
