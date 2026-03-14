import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
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
  apis: ['./index.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @openapi
 * /api/health:
 *   get:
 *     description: Retorna o status da API
 *     responses:
 *       200:
 *         description: OK
 */

// basic test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SGC Backend is running' });
});

// Example route for user list
/**
 * @openapi
 * /api/users:
 *   get:
 *     description: Retorna a lista de usuários
 *     responses:
 *       200:
 *         description: Sucesso
 */
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Servidor SGC rodando em: http://localhost:${PORT}`);
});

export { app, server };
