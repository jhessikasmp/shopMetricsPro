import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db/sequelize.js';
import { v4 as uuidv4 } from 'uuid';

interface RefreshTokenAttributes {
  id: string; // jti
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revoked: boolean;
  rotatedTo?: string | null; // jti of successor token (reuse detection)
  createdAt?: Date;
  updatedAt?: Date;
}

type RefreshTokenCreation = Optional<RefreshTokenAttributes, 'id' | 'revoked'>;

export class RefreshToken extends Model<RefreshTokenAttributes, RefreshTokenCreation> implements RefreshTokenAttributes {
  public id!: string;
  public userId!: string;
  public tokenHash!: string;
  public expiresAt!: Date;
  public revoked!: boolean;
  public rotatedTo!: string | null; // jti of successor
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const RefreshTokenModel = RefreshToken.init(
  {
    id: { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    tokenHash: { type: DataTypes.STRING, allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    revoked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    rotatedTo: { type: DataTypes.UUID, allowNull: true },
  },
  { sequelize, tableName: 'refresh_tokens', indexes: [ { fields: ['userId'] }, { fields: ['revoked'] } ] }
);

