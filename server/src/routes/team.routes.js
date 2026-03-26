import express from 'express';
import { 
  createTeam, 
  getTeams, 
  joinTeam, 
  resetInviteCode, 
  updatePermissions,
  updateMemberPermissions,
  getTeamMembers
} from '../controllers/team.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @openapi
 * /api/teams:
 *   post:
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     description: Cria uma nova equipe
 *     responses:
 *       201:
 *         description: Criado
 */
router.post('/', authenticate, createTeam);

/**
 * @openapi
 * /api/teams:
 *   get:
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     description: Lista as equipes do usuário
 *     parameters:
 *       - name: userId
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', authenticate, getTeams);

/**
 * @openapi
 * /api/teams/join:
 *   post:
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     description: Entrar em uma equipe usando o código de convite
 *     responses:
 *       201:
 *         description: Sucesso
 */
router.post('/join', authenticate, joinTeam);

/**
 * @openapi
 * /api/teams/{teamId}/reset-code:
 *   put:
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     description: Reseta o código de convite da equipe (Admin only)
 *     responses:
 *       200:
 *         description: OK
 */
router.put('/:id/reset-code', authenticate, resetInviteCode);

/**
 * @openapi
 * /api/teams/{teamId}/permissions:
 *   put:
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     description: Atualiza permissões de acesso (Admin only)
 *     responses:
 *       200:
 *         description: OK
 */
router.put('/:id/permissions', authenticate, updatePermissions);

/**
 * @openapi
 * /api/teams/{teamId}/members:
 *   get:
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     description: Lista membros de uma equipe específica
 */
router.get('/:teamId/members', authenticate, getTeamMembers);

/**
 * @openapi
 * /api/teams/{teamId}/members/{userId}/permissions:
 *   patch:
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     description: Atualiza as permissões JSON de um membro específico
 */
router.patch('/:teamId/members/:userId/permissions', authenticate, updateMemberPermissions);

export default router;
