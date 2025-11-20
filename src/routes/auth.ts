import express from 'express';
import passport from 'passport';
import { env, googleOauthDisabled } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import * as controller from '../controllers/authController.js';

export const authRouter = express.Router();

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && !googleOauthDisabled) {
  authRouter.get('/google', controller.googleStart());
  authRouter.get('/google/callback', passport.authenticate('google', { session: false }), controller.googleCallback);
} else {
  authRouter.get('/google', controller.googleStart());
}

authRouter.post('/refresh', controller.refresh);

// Logout (revoke single refresh token provided)
authRouter.post('/logout', controller.logout);

// Logout all (requires auth) - revoke all tokens for user
authRouter.post('/logout/all', requireAuth, controller.logoutAll);

authRouter.get('/me', requireAuth, controller.me);

// Local email/password auth (medium-level alternative to Google OAuth)
authRouter.post('/signup', controller.signup);

authRouter.post('/login', controller.login);
