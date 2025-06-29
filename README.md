# 🔧 API Oficina Mecânica

Uma API RESTful completa para gestão de oficina mecânica, desenvolvida com Node.js, Express e React.

## 🚀 Funcionalidades

- **Gestão de Clientes**: Cadastro, listagem e busca de clientes
- **Gestão de Veículos**: Controle de veículos por cliente
- **Ordens de Serviço**: Criação e acompanhamento de ordens de serviço
- **Dashboard**: Estatísticas em tempo real
- **Interface Web**: Frontend React com Tailwind CSS

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **CORS** - Middleware para requisições cross-origin

### Frontend
- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Superset JavaScript com tipagem
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **Lucide React** - Ícones

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

## 🚀 Como Executar

### 1. Clone o repositório
```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd project-bolt-sb1-wbkoyab5Oficina/project
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Execute o projeto
```bash
# Para desenvolvimento (servidor + frontend)
npm run dev

# Apenas o servidor
npm run server

# Apenas o frontend
npm run client
```

### 4. Acesse a aplicação
- **Frontend**: http://localhost:5173
- **API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 📚 Endpoints da API

### Clientes
- `GET /clientes` - Listar todos os clientes
- `POST /clientes` - Criar novo cliente
- `GET /clientes/:id` - Buscar cliente por ID

### Veículos
- `GET /veiculos` - Listar todos os veículos
- `POST /veiculos` - Criar novo veículo
- `GET /veiculos/:id` - Buscar veículo por ID

### Ordens de Serviço
- `GET /ordens` - Listar todas as ordens
- `POST /ordens` - Criar nova ordem
- `PUT /ordens/:id/status` - Atualizar status da ordem

### Health Check
- `GET /health` - Status da API

## 📊 Estrutura do Projeto

```
project/
├── server/                 # Backend
│   ├── index.js           # Servidor principal
│   ├── routes/            # Rotas da API
│   │   ├── clientes.js
│   │   ├── veiculos.js
│   │   └── ordens.js
│   └── storage/           # Simulação de banco de dados
│       └── database.js
├── src/                   # Frontend React
│   ├── components/        # Componentes React
│   ├── App.tsx           # Componente principal
│   └── main.tsx          # Ponto de entrada
├── package.json
└── README.md
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Executa servidor e frontend simultaneamente
- `npm run server` - Executa apenas o servidor
- `npm run client` - Executa apenas o frontend
- `npm run build` - Build de produção
- `npm run preview` - Preview do build

## 📝 Exemplo de Uso

### Criar um Cliente
```bash
curl -X POST http://localhost:3001/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "telefone": "11987654321",
    "email": "joao@email.com"
  }'
```

### Criar um Veículo
```bash
curl -X POST http://localhost:3001/veiculos \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": "1",
    "placa": "XYZ1234",
    "marca": "Honda",
    "modelo": "Civic"
  }'
```

### Criar uma Ordem de Serviço
```bash
curl -X POST http://localhost:3001/ordens \
  -H "Content-Type: application/json" \
  -d '{
    "veiculoId": "1",
    "descricao": "Troca de óleo e filtros",
    "valor": 150.00
  }'
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

Gustavo Avelino Saraiva Oliveira- gustavosaraiva2504@gmail.com

---

⭐ Se este projeto te ajudou, considere dar uma estrela! 
