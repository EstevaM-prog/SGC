import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  createUser,
  loginUser,
  refreshToken,
  getUsers,
  updateUsers,
  deleteUsers,
  verifyCode,
  forgotPassword,
  resetPassword,
  uploadAvatar,
  getMyProfile,
  updateMyProfile
} from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // 20 tentativas
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1' || req.ip === '::1',
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 tentativas
  message: { error: 'Muitas tentativas de registro. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1' || req.ip === '::1',
});

/**
 * @openapi
 * /api/users:
 *   post:
 *     tags: [Users]
 *     description: Inicia registro de usuário e envia código 2FA
 */
router.post('/', registerLimiter, createUser);

/**
 * @openapi
 * /api/users/login:
 *   post:
 *     tags: [Auth]
 *     description: Autentica usuário e retorna token JWT
 */
router.post('/login', loginLimiter, loginUser);

/**
 * @openapi
 * /api/users/refresh:
 *   post:
 *     tags: [Auth]
 *     description: Renova o Access Token usando um Refresh Token
 */
router.post('/refresh', refreshToken);

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Retorna o perfil do usuário logado baseado no Token
 */
router.get('/me', authenticate, getMyProfile);

/**
 * @openapi
 * /api/users/me:
 *   patch:
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Atualiza parcialmente os dados do perfil logado
 */
router.patch('/me', authenticate, updateMyProfile);

/**
 * @openapi
 * /api/users/avatar:
 *   post:
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Upload da foto de perfil (JPG/PNG, Máx 5MB)
 */
router.post('/avatar', authenticate, upload.single('avatar'), uploadAvatar);

/**
 * @openapi
 * /api/users/verify:
 *   post:
 *     tags: [Auth]
 *     description: Valida o código de 6 dígitos enviado por e-mail
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               code: { type: string }
 */
router.post('/verify', verifyCode);

/**
 * @openapi
 * /api/users/forgot-password:
 *   post:
 *     tags: [Auth]
 *     description: Solicita recuperação de senha e envia código por e-mail
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 */
router.post('/forgot-password', forgotPassword);

/**
 * @openapi
 * /api/users/reset-password:
 *   post:
 *     tags: [Auth]
 *     description: Redefine a senha do usuário após validação do código
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               code: { type: string }
 *               newPassword: { type: string }
 */
router.post('/reset-password', resetPassword);

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Retorna a lista de usuários com dados LGPD-ready
 */
router.get('/', authenticate, getUsers);

router.patch('/:id', authenticate, updateUsers);
router.delete('/:id', authenticate, deleteUsers);

export default router;