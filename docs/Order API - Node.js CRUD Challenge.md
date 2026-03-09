# Order API - Node.js CRUD Challenge

Esta é uma API REST simples desenvolvida em Node.js com JavaScript para gerenciar pedidos.

## 🚀 Tecnologias Utilizadas

- **Node.js** & **Express**: Framework web.
- **Sequelize** (ORM) & **SQLite**: Banco de dados relacional.
- **JWT (JSON Web Token)**: Autenticação de rotas.
- **Swagger**: Documentação interativa da API.
- **Bcryptjs**: Hash de senhas.

## 📋 Funcionalidades

- [x] **Criar Pedido**: `POST /order` (Com mapeamento de campos).
- [x] **Obter Pedido**: `GET /order/:orderId`.
- [x] **Listar Pedidos**: `GET /order/list`.
- [x] **Atualizar Pedido**: `PUT /order/:orderId`.
- [x] **Deletar Pedido**: `DELETE /order/:orderId`.
- [x] **Autenticação**: `POST /register` e `POST /login`.
- [x] **Documentação**: `GET /api-docs`.

## 🛠️ Como Executar

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Inicie o servidor:**
   ```bash
   node index.js
   ```
   O servidor rodará em `http://localhost:3000`.

3. **Acesse a documentação:**
   Abra seu navegador em `http://localhost:3000/api-docs` para ver e testar os endpoints via Swagger.

## 🔒 Autenticação

Todas as rotas de pedidos exigem um token JWT.
1. Crie um usuário em `/register`.
2. Obtenha o token em `/login`.
3. Adicione o token no cabeçalho `Authorization: Bearer <seu_token>`.

## 🔄 Mapeamento de Dados

A API recebe o formato de entrada (ex: `numeroPedido`, `valorTotal`) e transforma automaticamente para o formato de persistência (ex: `orderId`, `value`) conforme solicitado no desafio.

---
Desenvolvido por **Matheus Chagas**.
