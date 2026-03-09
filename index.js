const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sequelize, Order, Item, User } = require('./db');
const { authenticateToken, generateToken, bcrypt } = require('./auth');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Mapeamento de campos solicitado: transforma o JSON de entrada para o formato do banco
const mapRequestToOrder = (data) => ({
  orderId: data.numeroPedido.split('-')[0],
  value: data.valorTotal,
  creationDate: new Date(data.dataCriacao).toISOString(),
  items: data.items.map(item => ({
    productId: parseInt(item.idItem),
    quantity: item.quantidadeItem,
    price: item.valorItem
  }))
});

// --- Rota de Registro e Login ---
app.post('/register', async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  await User.create({ username: req.body.username, password: hashedPassword });
  res.status(201).json({ message: 'Usuário criado' });
});

app.post('/login', async (req, res) => {
  const user = await User.findOne({ where: { username: req.body.username } });
  if (user && await bcrypt.compare(req.body.password, user.password)) {
    res.json({ token: generateToken(user) });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

// --- Endpoints de Pedidos ---

// 1. Criar Pedido (POST /order)
app.post('/order', authenticateToken, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const mapped = mapRequestToOrder(req.body);
    const order = await Order.create({ orderId: mapped.orderId, value: mapped.value, creationDate: mapped.creationDate }, { transaction: t });
    for (const item of mapped.items) {
      await Item.create({ ...item, orderId: order.orderId }, { transaction: t });
    }
    await t.commit();
    res.status(201).json({ message: 'Pedido criado com sucesso', orderId: order.orderId });
  } catch (e) {
    await t.rollback();
    res.status(400).json({ error: e.message });
  }
});

// 2. Listar Pedidos (GET /order/list)
app.get('/order/list', authenticateToken, async (req, res) => {
  const orders = await Order.findAll({ include: [{ model: Item, as: 'items' }] });
  res.json(orders);
});

// 3. Obter Pedido por ID (GET /order/:id)
app.get('/order/:orderId', authenticateToken, async (req, res) => {
  const order = await Order.findByPk(req.params.orderId, { include: [{ model: Item, as: 'items' }] });
  order ? res.json(order) : res.status(404).json({ error: 'Não encontrado' });
});

// 4. Atualizar Pedido (PUT /order/:id)
app.put('/order/:orderId', authenticateToken, async (req, res) => {
  const order = await Order.findByPk(req.params.orderId);
  if (!order) return res.status(404).json({ error: 'Não encontrado' });
  await order.update({ value: req.body.valorTotal });
  res.json({ message: 'Atualizado' });
});

// 5. Deletar Pedido (DELETE /order/:id)
app.delete('/order/:orderId', authenticateToken, async (req, res) => {
  await Item.destroy({ where: { orderId: req.params.orderId } });
  await Order.destroy({ where: { orderId: req.params.orderId } });
  res.json({ message: 'Deletado' });
});

sequelize.sync().then(() => app.listen(3000, () => console.log('API rodando na porta 3000')));
