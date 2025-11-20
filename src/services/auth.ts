import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import { env, googleOauthDisabled } from '../config/env.js';
import { User, RefreshToken } from '../models/index.js';
import { signAccess, signRefresh } from './jwt.js';
import crypto from 'crypto';

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  const user = await User.findByPk(id);
  done(null, user);
});

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && !googleOauthDisabled) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken: string, _refreshToken: string, profile: Profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('Email not provided by Google'));
          let user = await User.findOne({ where: { email } });
          if (!user) {
            user = await User.create({ email, name: profile.displayName, googleId: profile.id });
          }
          return done(null, user);
        } catch (err) {
          return done(err as any, undefined);
        }
      }
    )
  );
}

export async function hashPassword(password: string) {
  const rounds = 10; // TODO: env-driven
  return bcrypt.hash(password, rounds);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function issueTokens(userId: string) {
  const access = signAccess(userId);
  const refresh = signRefresh(userId);
  const tokenHash = crypto.createHash('sha256').update(refresh).digest('hex');
  const expiresAt = new Date(Date.now() + ttlToMillis(env.JWT_REFRESH_TTL));
  const jti = crypto.randomUUID();
  await RefreshToken.create({ id: jti, userId, tokenHash, expiresAt });
  return { access, refresh, jti };
}

function ttlToMillis(ttl: string) {
  const regex = /(\d+)([smhd])/g;
  let match: RegExpExecArray | null;
  let total = 0;
  while ((match = regex.exec(ttl)) !== null) {
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's': total += value * 1000; break;
      case 'm': total += value * 60 * 1000; break;
      case 'h': total += value * 60 * 60 * 1000; break;
      case 'd': total += value * 24 * 60 * 60 * 1000; break;
    }
  }
  return total || 0;
}

export async function rotateRefresh(oldToken: string) {
  const hash = crypto.createHash('sha256').update(oldToken).digest('hex');
  const stored = await RefreshToken.findOne({ where: { tokenHash: hash } });
  if (!stored || stored.revoked || stored.expiresAt.getTime() < Date.now()) {
    throw new Error('Invalid refresh token');
  }
  if (stored.rotatedTo) {
    stored.revoked = true;
    await stored.save();
    throw new Error('Refresh token already rotated');
  }
  stored.revoked = true;
  const { access, refresh, jti } = await issueTokens(stored.userId);
  stored.rotatedTo = jti;
  await stored.save();
  return { access, refresh };
}

export async function revokeRefreshToken(refreshToken: string) {
  const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const stored = await RefreshToken.findOne({ where: { tokenHash: hash } });
  if (!stored) throw new Error('Not found');
  stored.revoked = true;
  await stored.save();
}

export async function revokeAllForUser(userId: string) {
  await RefreshToken.update({ revoked: true }, { where: { userId, revoked: false } });
}

export async function cleanupExpiredRefreshTokens() {
  await RefreshToken.destroy({ where: { expiresAt: { lt: new Date() } as any } });
}
