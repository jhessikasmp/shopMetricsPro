export * from './user.js';
export * from './product.js';
export * from './order.js';
export * from './report.js';
export * from './refreshToken.js';

// Explicit associations to enable eager loading and foreign key integrity usage.
import { User } from './user.js';
import { Order } from './order.js';
import { Report } from './report.js';
import { RefreshToken } from './refreshToken.js';

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Report, { foreignKey: 'userId' });
Report.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(RefreshToken, { foreignKey: 'userId' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

