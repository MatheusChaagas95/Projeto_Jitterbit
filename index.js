const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { sequelize, Order, Item, User } = require('./db');
const { authenticateToken, generateToken } = require('./auth');
const { swaggerUi, specs } = require('./swagger');

const app = express();

// Rota para documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Função de mapeamento de dados (Transformação)
const mapRequestToOrder = (data) => {

  return {
    orderId: data.numeroPedido.split('-')[0],
    value: data.valorTotal,
    creationDate: new Date(data.dataCriacao).toISOString(),
    items: data.items.map(item => ({
      productId: parseInt(item.idItem),
      quantity: item.quantidadeItem,
      price: item.valorItem
    }))
  };
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - orderId
 *         - value
 *         - creationDate
 *       properties:
 *         orderId:
 *           type: string
 *           description: ID único do pedido
 *         value:
 *           type: number
 *           description: Valor total do pedido
 *         creationDate:
 *           type: string
 *           format: date-time
 *           description: Data de criação do pedido
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Item'
 *     Item:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *         - price
 *       properties:
 *         productId:
 *           type: integer
 *           description: ID do produto
 *         quantity:
 *           type: integer
 *           description: Quantidade do item
 *         price:
 *           type: number
 *           description: Preço unitário
 *     OrderInput:
 *       type: object
 *       required:
 *         - numeroPedido
 *         - valorTotal
 *         - dataCriacao
 *         - items
 *       properties:
 *         numeroPedido:
 *           type: string
 *         valorTotal:
 *           type: number
 *         dataCriacao:
 *           type: string
 *           format: date-time
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               idItem:
 *                 type: string
 *               quantidadeItem:
 *                 type: integer
 *               valorItem:
 *                 type: number
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registrar um novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Erro ao registrar usuário
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Realizar login e obter token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token gerado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao registrar usuário: ' + error.message });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });

  if (user && await bcrypt.compare(password, user.password)) {
    const token = generateToken(user);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

/**
 * Endpoints de Pedidos (CRUD)
 */

/**
 * @swagger
 * /order:
 *   post:
 *     summary: Criar um novo pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderInput'
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       400:
 *         description: Erro ao criar pedido
 */
app.post('/order', authenticateToken, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const mappedData = mapRequestToOrder(req.body);

    const order = await Order.create({
      orderId: mappedData.orderId,
      value: mappedData.value,
      creationDate: mappedData.creationDate
    }, { transaction: t });

    for (const item of mappedData.items) {
      await Item.create({
        orderId: order.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ message: 'Pedido criado com sucesso', orderId: order.orderId });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ error: 'Erro ao criar pedido: ' + error.message });
  }
});

/**
 * @swagger
 * /order/list:
 *   get:
 *     summary: Listar todos os pedidos
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
app.get('/order/list', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.findAll({ include: [{ model: Item, as: 'items' }] });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar pedidos' });
  }
});

/**
 * @swagger
 * /order/{orderId}:
 *   get:
 *     summary: Obter detalhes de um pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalhes do pedido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Pedido não encontrado
 */
app.get('/order/:orderId', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.orderId, {
      include: [{ model: Item, as: 'items' }]
    });

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: 'Pedido não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
});

/**
 * @swagger
 * /order/{orderId}:
 *   put:
 *     summary: Atualizar um pedido existente
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderInput'
 *     responses:
 *       200:
 *         description: Pedido atualizado com sucesso
 *       404:
 *         description: Pedido não encontrado
 */
app.put('/order/:orderId', authenticateToken, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { valorTotal, items } = req.body;
    const orderId = req.params.orderId;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    await Order.update({ value: valorTotal }, { where: { orderId }, transaction: t });

    if (items && items.length > 0) {
      // Simplificação: remove itens antigos e insere novos
      await Item.destroy({ where: { orderId }, transaction: t });
      for (const item of items) {
        await Item.create({
          orderId,
          productId: parseInt(item.idItem),
          quantity: item.quantidadeItem,
          price: item.valorItem
        }, { transaction: t });
      }
    }

    await t.commit();
    res.json({ message: 'Pedido atualizado com sucesso' });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ error: 'Erro ao atualizar pedido: ' + error.message });
  }
});

/**
 * @swagger
 * /order/{orderId}:
 *   delete:
 *     summary: Deletar um pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pedido deletado com sucesso
 *       404:
 *         description: Pedido não encontrado
 */
app.delete('/order/:orderId', authenticateToken, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const orderId = req.params.orderId;
    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    await Item.destroy({ where: { orderId }, transaction: t });
    await Order.destroy({ where: { orderId }, transaction: t });

    await t.commit();
    res.json({ message: 'Pedido deletado com sucesso' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Erro ao deletar pedido' });
  }
});

// Inicializar banco e servidor
sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`API rodando em http://localhost:${port}`);
  });
});

module.exports = app;
