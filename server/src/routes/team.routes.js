import express from 'express';
import { createTeam, getTeams, joinTeam, resetInviteCode, updatePermissions } from '../controllers/team.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/teams:
 *   post:
 *     description: Cria uma nova equipe
 *     responses:
 *       201:
 *         description: Criado
 */
router.post('/', createTeam);

/**
 * @openapi
 * /api/teams:
 *   get:
 *     description: Lista as equipes do usuário
 *     parameters:
 *       - name: userId
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', getTeams);

/**
 * @openapi
 * /api/teams/join:
 *   post:
 *     description: Entrar em uma equipe usando o código de convite
 *     responses:
 *       201:
 *         description: Sucesso
 */
router.post('/join', joinTeam);

/**
 * @openapi
 * /api/teams/{teamId}/reset-code:
 *   put:
 *     description: Reseta o código de convite da equipe (Admin only)
 *     responses:
 *       200:
 *         description: OK
 */
router.put('/:teamId/reset-code', resetInviteCode);

/**
 * @openapi
 * /api/teams/{teamId}/permissions:
 *   put:
 *     description: Atualiza permissões de acesso (Admin only)
 *     responses:
 *       200:
 *         description: OK
 */
router.put('/:teamId/permissions', updatePermissions);

export default router;
