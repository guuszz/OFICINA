import express from 'express';
import cors from 'cors';
import clientesRoutes from './routes/clientes.js';
import veiculosRoutes from './routes/veiculos.js';
import ordensRoutes from './routes/ordens.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/clientes', clientesRoutes);
app.use('/veiculos', veiculosRoutes);
app.use('/ordens', ordensRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'API Oficina Mecânica - Online',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /clientes',
      'POST /clientes',
      'GET /veiculos',
      'POST /veiculos',
      'GET /ordens',
      'POST /ordens',
      'PUT /ordens/:id/status'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔧 API Oficina Mecânica rodando na porta ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
});