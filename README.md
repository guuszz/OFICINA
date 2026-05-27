<h1 align="center">🔧 Oficina Mecânica</h1>

<p align="center">
  <b>Sistema full-stack para gestão de oficina — API REST + interface web.</b><br/>
  <sub>Full-stack mechanic-shop management system — REST API + web UI.</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white"/>
  <a href="https://github.com/guuszz/OFICINA/actions/workflows/ci.yml"><img src="https://github.com/guuszz/OFICINA/actions/workflows/ci.yml/badge.svg" alt="CI"/></a>
  <a href="https://codecov.io/gh/guuszz/OFICINA"><img src="https://codecov.io/gh/guuszz/OFICINA/graph/badge.svg" alt="Code coverage"/></a>
  <a href="https://vitest.dev/"><img src="https://img.shields.io/badge/tested%20with-vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white" alt="Tested with Vitest"/></a>
  <a href="https://oficina-swart.vercel.app"><img src="https://img.shields.io/github/deployments/guuszz/OFICINA/production?label=vercel&logo=vercel&style=flat-square" alt="Vercel deploy"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/guuszz/OFICINA?style=flat-square" alt="MIT License"/></a>
</p>

<p align="center">
  <img src="docs/screenshots/dashboard-v2.png" alt="Dashboard com clientes, veiculos e ordens" width="800"/>
</p>
<p align="center">
  <a href="https://oficina-swart.vercel.app"><b>🌐 Demo ao vivo</b></a>
</p>



---

## 💡 Sobre · About

Sistema completo para gestão de oficina mecânica: cadastro de clientes, controle de veículos, abertura e acompanhamento de ordens de serviço, com dashboard de estatísticas em tempo real.

> _Complete mechanic-shop management system: customer registration, vehicle tracking, work-order lifecycle, and a live stats dashboard._

## ✨ Funcionalidades · Features

- 👤 **Clientes** — cadastro, listagem e busca
- 🚗 **Veículos** — vinculados ao cliente
- 📋 **Ordens de serviço** — abertura, atualização de status, histórico
- 📊 **Dashboard** — métricas em tempo real
- 🌐 **Frontend integrado** — interface React com Tailwind

## 🛠️ Stack

**Backend**
- Node.js + Express 4
- CORS, ES modules
- Storage em memória (fácil migrar para banco real)

**Frontend**
- React 18 + TypeScript 5.5
- Vite 5 + Tailwind 3
- Lucide React (ícones)

## 🚀 Como rodar

```bash
git clone https://github.com/guuszz/OFICINA.git
cd OFICINA
npm install

# sobe API (3001) + front (5173) ao mesmo tempo
npm run dev
```

- Frontend: <http://localhost:5173>
- API: <http://localhost:3001>
- Health: <http://localhost:3001/health>

## 📚 Endpoints

| Método | Rota               | Descrição                         |
|--------|--------------------|-----------------------------------|
| GET    | `/clientes`        | Lista clientes                    |
| POST   | `/clientes`        | Cadastra cliente                  |
| GET    | `/clientes/:id`    | Busca cliente por ID              |
| GET    | `/veiculos`        | Lista veículos                    |
| POST   | `/veiculos`        | Cadastra veículo                  |
| GET    | `/veiculos/:id`    | Busca veículo por ID              |
| GET    | `/ordens`          | Lista ordens de serviço           |
| POST   | `/ordens`          | Cria nova ordem                   |
| PUT    | `/ordens/:id/status` | Atualiza status da ordem        |
| GET    | `/health`          | Status da API                     |

### Exemplo · Example

```bash
curl -X POST http://localhost:3001/clientes \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","telefone":"11987654321","email":"joao@email.com"}'
```

## 📂 Estrutura

```
server/                 # Backend
├── index.js            # Entrypoint
├── routes/             # clientes, veiculos, ordens
└── storage/            # camada de dados
src/                    # Frontend React
├── components/
├── App.tsx
└── main.tsx
```

## 🧪 Testes

```bash
npm test              # roda todos os testes
npm run test:watch    # modo watch durante dev
npm run test:coverage # gera relatório de cobertura + HTML report
```

Stack de testes:
- **Vitest** — runner rápido, compatível com Jest API
- **@testing-library/react** — testa componentes pela perspectiva do usuário
- **jsdom** — DOM virtual para hooks e components
- **v8 coverage** — relatórios em `coverage/index.html`

38 testes cobrindo: `cn` helper, hooks (`useNumberTicker`, `useTheme`), e componentes (`StatusBadge`, `CarSilhouette`, `PageHeader`) — todos a 100% de cobertura nas unidades testadas.

## 🗺️ Roadmap

- [x] Persistência real (PostgreSQL via Neon + Prisma)
- [x] Autenticação JWT
- [x] Geração de PDF da OS
- [x] Testes unitários (Vitest)
- [ ] Documentação OpenAPI/Swagger
- [ ] Testes E2E (Playwright) pros CRUDs
- [ ] PWA installable

## 📝 Licença

MIT © [Gustavo Avelino Saraiva Oliveira](https://github.com/guuszz)
