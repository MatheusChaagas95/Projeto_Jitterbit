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
  orderId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  // Valor total acumulado do pedido
  value: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  // Data e hora em que o pedido foi criado
  creationDate: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
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
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Referência ao ID do pedido (Chave Estrangeira)
  orderId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Order,
      key: 'orderId'
    }
  },
  // Código do produto
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Quantidade comprada deste produto
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Preço unitário do produto no momento da compra
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName: 'Items',
  timestamps: false
});

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
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  // Senha (armazenada como hash criptografado)
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Exporta a instância de conexão e os modelos para uso em outros arquivos
module.exports = {
  sequelize,
  Order,
  Item,
  User
};
