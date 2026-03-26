import express from 'express';
import { 
  createChamados,
  getChamados,
  updateChamados,
  deleteChamados,
  restoreChamados,
  permanentDeleteChamados,
  getTrashChamados
} from '../controllers/chamados.controller.js';

const router = express.Router();

router.post('/', createChamados);
router.get('/', getChamados);
router.get('/lixeira', getTrashChamados);
router.put('/:id', updateChamados);
router.patch('/:id/restore', restoreChamados);
router.delete('/:id', deleteChamados); // Soft delete
router.delete('/:id/hard', permanentDeleteChamados);

export default router;