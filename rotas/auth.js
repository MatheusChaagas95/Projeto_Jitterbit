const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('./db');

const SECRET_KEY = 'sua_chave_secreta_aqui';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado' });
    req.user = user;
    next();
  });
};

const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
};

module.exports = {
  authenticateToken,
  generateToken,
  SECRET_KEY
};
