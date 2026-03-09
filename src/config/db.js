<<<<<<< HEAD
/**
 * Configuração do banco de dados e definição dos modelos (User, Order, Item).
 * Este arquivo utiliza o Sequelize para mapeamento objeto-relacional (ORM) e o SQLite como banco de dados local.
 */

const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Inicialização da instância do Sequelize com SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  // Define o local do arquivo do banco de dados
  storage: path.join(__dirname, 'database.sqlite'),
  // Desativa os logs de SQL no console para manter a saída limpa
  logging: false
});

/**
 * Modelo 'Order' (Pedido)
 * Representa o cabeçalho de um pedido de venda.
 */
const Order = sequelize.define('Order', {
  // ID único do pedido, vindo do sistema de origem
=======
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

const Order = sequelize.define('Order', {
>>>>>>> f286f945c9f2b6783bf153d9e8b03420e8c4d624
  orderId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
<<<<<<< HEAD
  // Valor total acumulado do pedido
=======
>>>>>>> f286f945c9f2b6783bf153d9e8b03420e8c4d624
  value: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
<<<<<<< HEAD
  // Data e hora em que o pedido foi criado
=======
>>>>>>> f286f945c9f2b6783bf153d9e8b03420e8c4d624
  creationDate: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
<<<<<<< HEAD
  // Nome explícito da tabela no banco de dados
  tableName: 'Orders',
  // Desativa as colunas automáticas 'createdAt' e 'updatedAt'
  timestamps: false
});

/**
 * Modelo 'Item' (Item do Pedido)
 * Representa cada produto contido dentro de um pedido.
 */
const Item = sequelize.define('Item', {
  // ID interno auto-incrementado para cada item
=======
  tableName: 'Orders',
  timestamps: false
});

const Item = sequelize.define('Item', {
>>>>>>> f286f945c9f2b6783bf153d9e8b03420e8c4d624
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
<<<<<<< HEAD
  // Referência ao ID do pedido (Chave Estrangeira)
=======
>>>>>>> f286f945c9f2b6783bf153d9e8b03420e8c4d624
  orderId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Order,
      key: 'orderId'
    }
  },
<<<<<<< HEAD
  // Código do produto
=======
>>>>>>> f286f945c9f2b6783bf153d9e8b03420e8c4d624
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
<<<<<<< HEAD
  // Quantidade comprada deste produto
=======
>>>>>>> f286f945c9f2b6783bf153d9e8b03420e8c4d624
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
<<<<<<< HEAD
  // Preço unitário do produto no momento da compra
=======
>>>>>>> f286f945c9f2b6783bf153d9e8b03420e8c4d624
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName: 'Items',
  timestamps: false
});

<<<<<<< HEAD
/**
 * DEFINIÇÃO DE ASSOCIAÇÕES
 * Estabelece o relacionamento entre Pedidos e Itens.
 */

// Um Pedido possui muitos Itens (1:N)
Order.hasMany(Item, { foreignKey: 'orderId', as: 'items' });

// Um Item pertence a um único Pedido
Item.belongsTo(Order, { foreignKey: 'orderId' });

/**
 * Modelo 'User' (Usuário)
 * Representa os usuários que podem acessar a API.
 */
const User = sequelize.define('User', {
  // Nome de usuário único para login
=======
// Definir associações
Order.hasMany(Item, { foreignKey: 'orderId', as: 'items' });
Item.belongsTo(Order, { foreignKey: 'orderId' });

// Modelo de Usuário
const User = sequelize.define('User', {
>>>>>>> f286f945c9f2b6783bf153d9e8b03420e8c4d624
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
<<<<<<< HEAD
  // Senha (armazenada como hash criptografado)
=======
>>>>>>> f286f945c9f2b6783bf153d9e8b03420e8c4d624
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

<<<<<<< HEAD
// Exporta a instância de conexão e os modelos para uso em outros arquivos
=======
>>>>>>> f286f945c9f2b6783bf153d9e8b03420e8c4d624
module.exports = {
  sequelize,
  Order,
  Item,
  User
};
