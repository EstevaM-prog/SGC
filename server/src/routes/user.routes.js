import express from 'express';
import { createUser, getUsers, updateUsers, deleteUsers } from '../controllers/user.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/users:
 *   get:
 *     description: Retorna a lista de usuários
 *     responses:
 *       200:
 *         description: Sucesso
 */
router.get('/', getUsers);

/**
 * @openapi
 * /api/users:
 *   post:
 *     description: Cria um novo usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *     responses:
 *       201:
 *         description: Usuário criado
 */
router.post('/', createUser);

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     description: Atualiza um usuário
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário atualizado
 */
router.put('/:id', updateUsers);

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     description: Deleta um usuário
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário deletado
 */
router.delete('/:id', deleteUsers);

export default router;