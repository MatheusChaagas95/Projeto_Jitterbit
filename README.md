# Projeto Jitterbit - API de Pedidos

Este projeto é uma API REST desenvolvida em **Node.js** para gerenciamento de pedidos.
A API permite criar, consultar, listar, atualizar e deletar pedidos armazenados em um banco de dados.

## Tecnologias utilizadas

* Node.js
* Express
* MongoDB
* Mongoose
* JavaScript

---

# Como rodar o projeto

## 1. Clonar o repositório

```bash
git clone https://github.com/MatheusChaagas95/Projeto_Jitterbit.git
```

## 2. Entrar na pasta do projeto

```bash
cd Projeto_Jitterbit
```

## 3. Instalar as dependências

```bash
npm install
```

## 4. Configurar o banco de dados

Certifique-se de ter o **MongoDB** rodando na sua máquina.

Caso utilize uma string de conexão, configure no arquivo `.env` ou diretamente no arquivo de configuração do banco.

Exemplo:

```
mongodb://localhost:27017/orders
```

## 5. Rodar a aplicação

```bash
npm start
```

ou

```bash
node index.js
```

A API irá rodar em:

```
http://localhost:3000
```

---

# Endpoints da API

## Criar pedido

POST `/order`

Exemplo de body:

```json
{
 "numeroPedido": "v10089015vdb-01",
 "valorTotal": 10000,
 "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
 "items": [
  {
   "idItem": "2434",
   "quantidadeItem": 1,
   "valorItem": 1000
  }
 ]
}
```

---

## Buscar pedido por ID

GET `/order/:orderId`

Exemplo:

```
http://localhost:3000/order/v10089016vdb
```

---

## Listar todos os pedidos

GET `/order/list`

---

## Atualizar pedido

PUT `/order/:orderId`

---

## Deletar pedido

DELETE `/order/:orderId`

---

# Estrutura do projeto

```
src
 ├ config
 │  └ db.js
 ├ models
 │  └ Order.js
 ├ routes
 │  └ orderRoutes.js
 └ index.js
```

---

# Transformação de dados

A API recebe o seguinte formato de dados:

```json
{
 "numeroPedido": "v10089015vdb-01",
 "valorTotal": 10000
}
```

E transforma para o formato salvo no banco:

```json
{
 "orderId": "v10089016vdb",
 "value": 10000
}
```

---

# Autor

Matheus Chagas

GitHub:
https://github.com/MatheusChaagas95
