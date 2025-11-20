import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db/sequelize.js';
import { v4 as uuidv4 } from 'uuid';

interface ProductAttributes {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type ProductCreation = Optional<ProductAttributes, 'id'>;

export class Product extends Model<ProductAttributes, ProductCreation> implements ProductAttributes {
  public id!: string;
  public name!: string;
  public sku!: string;
  public stock!: number;
  public price!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    id: { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    sku: { type: DataTypes.STRING, allowNull: false, unique: true },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  },
  { sequelize, tableName: 'products' }
);
