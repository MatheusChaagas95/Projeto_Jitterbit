const { Sequelize, DataTypes } = require('sequelize');
const { MongoClient } = require('mongodb');
const path = require('path');

/* =========================
   SQLITE (Sequelize)
========================= */

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


/* =========================
   MONGODB
========================= */

const mongoUri = "mongodb://localhost:27017";
const mongoClient = new MongoClient(mongoUri);

let mongoDB;

async function connectMongo() {
  try {
    await mongoClient.connect();
    mongoDB = mongoClient.db("ordersDB");
    console.log("MongoDB conectado");
  } catch (error) {
    console.error("Erro ao conectar no MongoDB:", error);
  }
}

function getMongoDB() {
  return mongoDB;
}


/* =========================
   EXPORTS
========================= */

module.exports = {
  sequelize,
  Order,
  Item,
  User,
  connectMongo,
  getMongoDB
};