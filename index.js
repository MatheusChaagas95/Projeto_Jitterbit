/**
 * Ponto de entrada da aplicação Order API.
 * Este arquivo configura o servidor Express, define as rotas de autenticação e CRUD de pedidos,
 * e integra o Sequelize para persistência de dados.
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize, Order, Item, User } = require('./src/config/db');
const { swaggerUi, specs } = require('./docs/swagger');

const app = express();
const port = 3000;

// Chave secreta para assinatura dos tokens JWT. Em produção, deve estar em variáveis de ambiente.
const SECRET = "segredo123";

// Middleware para permitir requisições de diferentes origens (CORS)
app.use(cors());

// Middleware para interpretar corpos de requisições em formato JSON
app.use(express.json());

// Rota para a documentação da API (Swagger UI)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/* ===========================
   AUTENTICAÇÃO JWT
=========================== */

/**
 * Gera um token JWT para um usuário autenticado.
 * @param {Object} user - Objeto do usuário contendo id e username.
 * @returns {string} Token JWT assinado.
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    SECRET,
    { expiresIn: '1h' } // O token expira em 1 hora
  );
}

/**
 * Middleware para verificar a validade do token JWT nas rotas protegidas.
 * Espera o token no cabeçalho 'Authorization' no formato 'Bearer <TOKEN>'.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Se não houver token, retorna 401 (Não autorizado)
  if (!token) return res.status(401).json({ error: "Token não fornecido" });

  // Verifica o token usando a chave secreta
  jwt.verify(token, SECRET, (err, user) => {
    // Se o token for inválido ou expirado, retorna 403 (Proibido)
    if (err) return res.status(403).json({ error: "Token inválido ou expirado" });
    
    // Armazena os dados do usuário na requisição para uso posterior
    req.user = user;
    next();
  });
}

/* ===========================
   TRANSFORMAÇÃO DE DADOS
=========================== */

/**
 * Mapeia os dados recebidos no formato do desafio para o formato interno do banco de dados.
 * @param {Object} data - Dados brutos da requisição.
 * @returns {Object} Dados formatados para os modelos Order e Item.
 */
const mapRequestToOrder = (data) => {
  return {
    // Usa o número completo do pedido para evitar duplicidade de IDs no banco
    orderId: data.numeroPedido,
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
   ROTAS DE USUÁRIO
=========================== */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registra um novo usuário
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
 *         description: Erro na requisição ou usuário já existe
 */
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Verifica se o usuário já existe
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: "Usuário já existe" });
    }

    // Gera o hash da senha com salt de 10 rounds
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário no banco
    await User.create({
      username,
      password: hashedPassword
    });

    res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Realiza o login do usuário
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
 *         description: Login bem-sucedido, retorna o token JWT
 *       401:
 *         description: Credenciais inválidas
 */
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Busca o usuário pelo nome de usuário
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ error: "Usuário inválido" });
    }

    // Compara a senha fornecida com a senha criptografada no banco
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ error: "Senha inválida" });
    }

    // Gera e retorna o token de acesso
    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ===========================
   ROTAS DE PEDIDOS (CRUD)
=========================== */

/**
 * @swagger
 * /order:
 *   post:
 *     summary: Cria um novo pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numeroPedido:
 *                 type: string
 *               valorTotal:
 *                 type: number
 *               dataCriacao:
 *                 type: string
 *                 format: date-time
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     idItem:
 *                       type: string
 *                     quantidadeItem:
 *                       type: integer
 *                     valorItem:
 *                       type: number
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       401:
 *         description: Não autorizado
 */
app.post('/order', authenticateToken, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    // Transforma os dados da requisição para o formato do banco
    const mappedData = mapRequestToOrder(req.body);

    // Cria o cabeçalho do pedido
    const order = await Order.create({
      orderId: mappedData.orderId,
      value: mappedData.value,
      creationDate: mappedData.creationDate
    }, { transaction: t });

    // Cria cada item associado ao pedido
    for (const item of mappedData.items) {
      await Item.create({
        orderId: order.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }, { transaction: t });
    }

    // Confirma a transação
    await t.commit();
    res.status(201).json(order);
  } catch (error) {
    // Em caso de erro, desfaz todas as alterações da transação
    await t.rollback();
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /order/list:
 *   get:
 *     summary: Lista todos os pedidos
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos retornada com sucesso
 *       401:
 *         description: Não autorizado
 */
app.get('/order/list', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: Item, as: 'items' }]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /order/{orderId}:
 *   get:
 *     summary: Busca um pedido pelo ID
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
 *         description: Dados do pedido
 *       404:
 *         description: Pedido não encontrado
 */
app.get('/order/:orderId', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.orderId, {
      include: [{ model: Item, as: 'items' }]
    });

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /order/{orderId}:
 *   put:
 *     summary: Atualiza um pedido existente
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
 *             type: object
 *             properties:
 *               valorTotal:
 *                 type: number
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     idItem:
 *                       type: string
 *                     quantidadeItem:
 *                       type: integer
 *                     valorItem:
 *                       type: number
 *     responses:
 *       200:
 *         description: Pedido atualizado com sucesso
 *       404:
 *         description: Pedido não encontrado
 */
app.put('/order/:orderId', authenticateToken, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { orderId } = req.params;
    const { valorTotal, items } = req.body;

    // Verifica se o pedido existe
    const order = await Order.findByPk(orderId);
    if (!order) {
      await t.rollback();
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // Atualiza o valor total do pedido
    await order.update({ value: valorTotal }, { transaction: t });

    // Remove os itens antigos para reinserir os novos (estratégia de substituição)
    await Item.destroy({ where: { orderId }, transaction: t });

    // Insere os novos itens
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await Item.create({
          orderId: orderId,
          productId: parseInt(item.idItem),
          quantity: item.quantidadeItem,
          price: item.valorItem
        }, { transaction: t });
      }
    }

    await t.commit();
    
    // Retorna o pedido atualizado com os novos itens
    const updatedOrder = await Order.findByPk(orderId, {
      include: [{ model: Item, as: 'items' }]
    });
    res.json(updatedOrder);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /order/{orderId}:
 *   delete:
 *     summary: Remove um pedido
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
 *         description: Pedido removido com sucesso
 *       404:
 *         description: Pedido não encontrado
 */
app.delete('/order/:orderId', authenticateToken, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const orderId = req.params.orderId;

    // Remove os itens primeiro (chave estrangeira)
    await Item.destroy({ where: { orderId }, transaction: t });

    // Remove o pedido
    const deletedCount = await Order.destroy({ where: { orderId }, transaction: t });

    if (deletedCount === 0) {
      await t.rollback();
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    await t.commit();
    res.json({ message: "Pedido deletado com sucesso" });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
});

/* ===========================
   INICIALIZAÇÃO DO SERVIDOR
=========================== */

// Sincroniza os modelos com o banco de dados (cria as tabelas se não existirem)
sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Documentação Swagger disponível em http://localhost:${port}/api-docs (se configurada)`);
  });
}).catch(err => {
  console.error('Erro ao sincronizar com o banco de dados:', err);
});
