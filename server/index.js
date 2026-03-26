import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import morgan from 'morgan';
import logger from './src/utils/logger.js';

// Import routes
import userRoutes from './src/routes/user.routes.js';
import teamRoutes from './src/routes/team.routes.js';
import ticketRoutes from './src/routes/ticket.routes.js';
import shoppingRoutes from './src/routes/ticketShopping.js';
import freightRoutes from './src/routes/ticketFreight.js';
import procedureRoutes from './src/routes/ticketProdureceres.js';
import pontoRoutes from './src/routes/ticketPonto.js';
import trashRoutes from './src/routes/trash.routes.js';

import { sendSupportEmail } from './src/utils/mailer.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SGC API Documentation',
      version: '1.0.0',
      description: 'Documentação da API do Sistema de Gestão de Chamados (SGC)',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
    tags: [
      { name: 'Auth', description: 'Autenticação e sessão (JWT)' },
      { name: 'Users', description: 'Gestão de usuários e perfis' },
      { name: 'Teams', description: 'Gestão de equipes e permissões' },
      { name: 'Tickets', description: 'Operações de chamados (Geral)' },
      { name: 'Shopping', description: 'Chamados de Compras corporativas' },
      { name: 'Freight', description: 'Chamados de Fretes de carga' },
      { name: 'Trash', description: 'Recuperação de itens excluídos' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./index.js', './src/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/shopping', shoppingRoutes);
app.use('/api/freights', freightRoutes);
app.use('/api/procedures', procedureRoutes);
app.use('/api/ponto', pontoRoutes);
app.use('/api/trash', trashRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SGC Backend is running' });
});

app.post('/api/support', async (req, res) => {
  const success = await sendSupportEmail(req.body);
  if (success) {
    res.json({ message: 'E-mail enviado com sucesso!' });
  } else {
    res.status(500).json({ error: 'Falha ao enviar e-mail.' });
  }
});

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    logger.info(`🚀 Servidor SGC rodando em: http://localhost:${PORT}`);
    logger.info(`📚 Documentação Swagger: http://localhost:${PORT}/api-docs`);
  });
}

export { app };
