const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize, Order, Item, User } = require('./src/config/db');

const app = express();
const port = 3000;
const SECRET = "segredo123";

app.use(cors());
app.use(express.json());

/* ===========================
   AUTENTICAÇÃO JWT
=========================== */

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    SECRET,
    { expiresIn: '1h' }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

/* ===========================
   TRANSFORMAÇÃO DE DADOS
=========================== */

const mapRequestToOrder = (data) => {
  return {
    orderId: data.numeroPedido.split('-')[0],
    value: data.valorTotal,
    creationDate: new Date(data.dataCriacao),
    items: data.items.map(item => ({
      productId: parseInt(item.idItem),
      quantity: item.quantidadeItem,
      price: item.valorItem
    }))
  };
};

/* ===========================
   REGISTER
=========================== */

app.post('/register', async (req, res) => {
  try {

    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      password: hashedPassword
    });

    res.status(201).json({ message: 'Usuário criado com sucesso' });

  } catch (error) {

    res.status(400).json({ error: error.message });

  }
});

/* ===========================
   LOGIN
=========================== */

app.post('/login', async (req, res) => {

  const { username, password } = req.body;

  const user = await User.findOne({ where: { username } });

  if (!user) {
    return res.status(401).json({ error: "Usuário inválido" });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(401).json({ error: "Senha inválida" });
  }

  const token = generateToken(user);

  res.json({ token });

});

/* ===========================
   CRIAR PEDIDO
=========================== */

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

    res.status(201).json(order);

  } catch (error) {

    await t.rollback();

    res.status(400).json({ error: error.message });

  }

});

/* ===========================
   LISTAR PEDIDOS
=========================== */

app.get('/order/list', authenticateToken, async (req, res) => {

  const orders = await Order.findAll({

    include: [{ model: Item, as: 'items' }]

  });

  res.json(orders);

});

/* ===========================
   BUSCAR PEDIDO
=========================== */

app.get('/order/:orderId', authenticateToken, async (req, res) => {

  const order = await Order.findByPk(req.params.orderId, {

    include: [{ model: Item, as: 'items' }]

  });

  if (!order) {
    return res.status(404).json({ error: "Pedido não encontrado" });
  }

  res.json(order);

});

/* ===========================
   DELETE
=========================== */

app.delete('/order/:orderId', authenticateToken, async (req, res) => {

  const t = await sequelize.transaction();

  try {

    const orderId = req.params.orderId;

    await Item.destroy({ where: { orderId }, transaction: t });

    await Order.destroy({ where: { orderId }, transaction: t });

    await t.commit();

    res.json({ message: "Pedido deletado" });

  } catch (error) {

    await t.rollback();

    res.status(500).json({ error: error.message });

  }

});

/* ===========================
   START SERVER
=========================== */

sequelize.sync().then(() => {

  app.listen(port, () => {

    console.log(`Servidor rodando em http://localhost:${port}`);

  });

});