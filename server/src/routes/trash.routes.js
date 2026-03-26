import express from 'express';
import { getTrashByResource } from '../controllers/trash.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.get('/:recurso', authenticate, getTrashByResource);

export default router;
