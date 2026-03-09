<<<<<<< HEAD
/**
 * Script de testes automatizados para a Order API.
 * Realiza o fluxo completo de registro, login e operações CRUD de pedidos.
 */

const axios = require('axios');

// URL base da API
=======
const axios = require('axios');

>>>>>>> f286f945c9f2b6783bf153d9e8b03420e8c4d624
const API_URL = 'http://localhost:3000';

async function runTests() {
  try {
    console.log('--- Iniciando Testes da API ---');

    // 1. Registrar Usuário
    console.log('\n1. Registrando usuário...');
<<<<<<< HEAD
    try {
      await axios.post(`${API_URL}/register`, {
        username: 'testuser',
        password: 'password123'
      });
      console.log('Usuário registrado com sucesso.');
    } catch (err) {
      // Se o usuário já existir (erro 400), apenas continua para o login
      if (err.response && err.response.status === 400) {
        console.log('Usuário já existe. Pulando registro...');
      } else {
        throw err;
      }
    }
=======
    await axios.post(`${API_URL}/register`, {
      username: 'testuser',
      password: 'password123'
    });
    console.log('Usuário registrado com sucesso.');
>>>>>>> f286f945c9f2b6783bf153d9e8b03420e8c4d624

    // 2. Login
    console.log('\n2. Realizando login...');
    const loginRes = await axios.post(`${API_URL}/login`, {
      username: 'testuser',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('Login realizado. Token obtido.');

<<<<<<< HEAD
    // Cabeçalho de autenticação padrão para as próximas requisições
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    // 3. Criar Pedido (Fluxo de Mapeamento de Dados)
=======
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    // 3. Criar Pedido (Mapeamento de Dados)
>>>>>>> f286f945c9f2b6783bf153d9e8b03420e8c4d624
    console.log('\n3. Criando novo pedido...');
    const orderData = {
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
    };
    const createRes = await axios.post(`${API_URL}/order`, orderData, authHeader);
    const orderId = createRes.data.orderId;
    console.log(`Pedido criado. ID: ${orderId}`);

<<<<<<< HEAD
    // 4. Buscar Pedido por ID
=======
    // 4. Obter Pedido
>>>>>>> f286f945c9f2b6783bf153d9e8b03420e8c4d624
    console.log(`\n4. Buscando pedido ${orderId}...`);
    const getRes = await axios.get(`${API_URL}/order/${orderId}`, authHeader);
    console.log('Dados do pedido:', JSON.stringify(getRes.data, null, 2));

<<<<<<< HEAD
    // 5. Listar Todos os Pedidos
=======
    // 5. Listar Pedidos
>>>>>>> f286f945c9f2b6783bf153d9e8b03420e8c4d624
    console.log('\n5. Listando todos os pedidos...');
    const listRes = await axios.get(`${API_URL}/order/list`, authHeader);
    console.log(`Total de pedidos: ${listRes.data.length}`);

<<<<<<< HEAD
    // 6. Atualizar Pedido (Rota PUT corrigida)
    console.log(`\n6. Atualizando pedido ${orderId}...`);
    const updateRes = await axios.put(`${API_URL}/order/${orderId}`, {
=======
    // 6. Atualizar Pedido
    console.log(`\n6. Atualizando pedido ${orderId}...`);
    await axios.put(`${API_URL}/order/${orderId}`, {
>>>>>>> f286f945c9f2b6783bf153d9e8b03420e8c4d624
      valorTotal: 15000,
      items: [
        { idItem: "2434", quantidadeItem: 2, valorItem: 1000 }
      ]
    }, authHeader);
<<<<<<< HEAD
    console.log('Pedido atualizado. Novo valor:', updateRes.data.value);
    console.log('Novos itens:', JSON.stringify(updateRes.data.items, null, 2));

    // 7. Deletar Pedido
    console.log(`\n7. Deletando pedido ${orderId}...`);
    const deleteRes = await axios.delete(`${API_URL}/order/${orderId}`, authHeader);
    console.log('Resposta da deleção:', deleteRes.data.message);

    console.log('\n--- Todos os testes concluídos com sucesso! ---');
  } catch (error) {
    // Exibe detalhes do erro caso ocorra algum problema nas requisições
=======
    console.log('Pedido atualizado.');

    // 7. Deletar Pedido
    console.log(`\n7. Deletando pedido ${orderId}...`);
    await axios.delete(`${API_URL}/order/${orderId}`, authHeader);
    console.log('Pedido deletado.');

    console.log('\n--- Todos os testes concluídos com sucesso! ---');
  } catch (error) {
>>>>>>> f286f945c9f2b6783bf153d9e8b03420e8c4d624
    console.error('\nErro nos testes:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

<<<<<<< HEAD
// Executa a função de testes
=======
>>>>>>> f286f945c9f2b6783bf153d9e8b03420e8c4d624
runTests();
