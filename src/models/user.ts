import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db/sequelize.js';
import { v4 as uuidv4 } from 'uuid';

interface UserAttributes {
  id: string;
  email: string;
  name: string | null;
  googleId: string | null;
  passwordHash: string | null; // fallback if needed
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreation = Optional<UserAttributes, 'id' | 'name' | 'googleId' | 'passwordHash'>;

export class User extends Model<UserAttributes, UserCreation> implements UserAttributes {
  public id!: string;
  public email!: string;
  public name!: string | null;
  public googleId!: string | null;
  public passwordHash!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: { type: DataTypes.STRING },
    googleId: { type: DataTypes.STRING },
    passwordHash: { type: DataTypes.STRING },
  },
  { sequelize, tableName: 'users' }
);
