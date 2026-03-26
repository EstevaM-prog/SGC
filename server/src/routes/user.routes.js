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
  uploadAvatar
} from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @openapi
 * /api/users:
 *   post:
 *     description: Inicia registro de usuário e envia código 2FA
 */
router.post('/', createUser);

/**
 * @openapi
 * /api/users/login:
 *   post:
 *     description: Autentica usuário e retorna token JWT
 */
router.post('/login', loginLimiter, loginUser);
router.post('/refresh', refreshToken);
router.post('/avatar', authenticate, upload.single('avatar'), uploadAvatar);

/**
 * @openapi
 * /api/users/verify:
 *   post:
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
 *     description: Retorna a lista de usuários com dados LGPD-ready
 */
router.get('/', getUsers);

router.put('/:id', updateUsers);
router.delete('/:id', deleteUsers);

export default router;