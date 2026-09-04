import { Router } from 'express';
import * as numeroController from '../controllers/numeroController';
import { autenticar } from '../middlewares/autenticacion';

const router = Router();

router.use(autenticar);

router.get('/', numeroController.listar);
router.post('/', numeroController.crear);
router.put('/:id', numeroController.actualizar);
router.delete('/:id', numeroController.eliminar);

export default router;
