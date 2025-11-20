import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db/sequelize.js';
import { v4 as uuidv4 } from 'uuid';

interface ReportAttributes {
  id: string;
  month: string; // YYYY-MM
  format: string; // pdf or csv
  url: string; // storage or local path stub
  userId: string | null; // ownership
  createdAt?: Date;
  updatedAt?: Date;
}

type ReportCreation = Optional<ReportAttributes, 'id' | 'userId'>;

export class Report extends Model<ReportAttributes, ReportCreation> implements ReportAttributes {
  public id!: string;
  public month!: string;
  public format!: string;
  public url!: string;
  public userId!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Report.init(
  {
    id: { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
    month: { type: DataTypes.STRING, allowNull: false },
    format: { type: DataTypes.STRING, allowNull: false },
    url: { type: DataTypes.STRING, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: true },
  },
  { sequelize, tableName: 'reports', indexes: [ { unique: true, fields: ['month','userId','format'] } ] }
);
