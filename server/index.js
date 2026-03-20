import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import prisma from './src/db.js';

// Import routes
import userRoutes from './src/routes/user.routes.js';
import ticketRoutes from './src/routes/ticket.routes.js';
import teamRoutes from './src/routes/team.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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
  },
  apis: ['./index.js', './src/routes/*.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/teams', teamRoutes);

/**
 * @openapi
 * /api/health:
 *   get:
 *     description: Retorna o status da API
 *     responses:
 *       200:
 *         description: OK
 */

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SGC Backend is running' });
});

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Servidor SGC rodando em: http://localhost:${PORT}`);
  console.log(`📚 Documentação Swagger: http://localhost:${PORT}/api-docs`);
});

export { app, server };
