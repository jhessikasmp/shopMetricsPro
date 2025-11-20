import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db/sequelize.js';
import { v4 as uuidv4 } from 'uuid';
import { Product } from './product.js';

interface OrderAttributes {
  id: string;
  productId: string;
  userId: string | null; // ownership
  quantity: number;
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type OrderCreation = Optional<OrderAttributes, 'id' | 'userId'>;

export class Order extends Model<OrderAttributes, OrderCreation> implements OrderAttributes {
  public id!: string;
  public productId!: string;
  public userId!: string | null;
  public quantity!: number;
  public totalPrice!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
  productId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    totalPrice: { type: DataTypes.FLOAT, allowNull: false },
  },
  { sequelize, tableName: 'orders' }
);

Product.hasMany(Order, { foreignKey: 'productId' });
Order.belongsTo(Product, { foreignKey: 'productId' });

// User association added lazily to avoid circular import issues; imported dynamically in index or usage.
