const axios = require('axios');
const API_URL = 'http://localhost:3000';

async function runTests() {
  try {
    console.log('--- Iniciando Testes da API ---');

    // 1. Registrar Usuário
    console.log('\n1. Registrando usuário...');
    try {
      await axios.post(`${API_URL}/register`, {
        username: 'testuser',
        password: 'password123'
      });
      console.log('Usuário registrado com sucesso.');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('Usuário já existe. Pulando registro...');
      } else {
        throw err;
      }
    }

    // 2. Login
    console.log('\n2. Realizando login...');
    const loginRes = await axios.post(`${API_URL}/login`, {
      username: 'testuser',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('Login realizado. Token obtido.');

    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    // 3. Criar Pedido (Mapeamento de Dados)
    console.log('\n3. Criando novo pedido...');
    const orderData = {
      "numeroPedido": "v10089015vdb-01",
      "valorTotal": 10000,
      "dataCriacao": "2023-07-19T12:24:11.529Z",
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

    // 4. Buscar Pedido por ID
    console.log(`\n4. Buscando pedido ${orderId}...`);
    const getRes = await axios.get(`${API_URL}/order/${orderId}`, authHeader);
    console.log('Dados do pedido:', JSON.stringify(getRes.data, null, 2));

    // 5. Listar Pedidos
    console.log('\n5. Listando todos os pedidos...');
    const listRes = await axios.get(`${API_URL}/order/list`, authHeader);
    console.log(`Total de pedidos: ${listRes.data.length}`);

    // 6. Atualizar Pedido
    console.log(`\n6. Atualizando pedido ${orderId}...`);
    await axios.put(`${API_URL}/order/${orderId}`, {
      valorTotal: 15000,
      items: [
        { idItem: "2434", quantidadeItem: 2, valorItem: 1000 }
      ]
    }, authHeader);
    console.log('Pedido atualizado.');

    // 7. Deletar Pedido
    console.log(`\n7. Deletando pedido ${orderId}...`);
    await axios.delete(`${API_URL}/order/${orderId}`, authHeader);
    console.log('Pedido deletado.');

    console.log('\n--- Todos os testes concluídos com sucesso! ---');
  } catch (error) {
    console.error('\nErro nos testes:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

runTests();
