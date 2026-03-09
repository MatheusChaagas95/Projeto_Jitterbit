const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

const Order = sequelize.define('Order', {
  orderId: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
  value: { type: DataTypes.FLOAT, allowNull: false },
  creationDate: { type: DataTypes.DATE, allowNull: false }
}, { tableName: 'Orders', timestamps: false });

const Item = sequelize.define('Item', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.STRING, allowNull: false, references: { model: Order, key: 'orderId' } },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false }
}, { tableName: 'Items', timestamps: false });

Order.hasMany(Item, { foreignKey: 'orderId', as: 'items' });
Item.belongsTo(Order, { foreignKey: 'orderId' });

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false }
});

module.exports = { sequelize, Order, Item, User };
