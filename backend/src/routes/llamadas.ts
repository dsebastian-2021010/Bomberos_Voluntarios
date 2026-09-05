import { Router } from 'express';
import * as llamadaController from '../controllers/llamadaController';
import { autenticar } from '../middlewares/autenticacion';
import { autorizar } from '../middlewares/autorizacion';

const router = Router();

router.use(autenticar);

router.get('/', llamadaController.listar);
router.get('/:id/reportes', llamadaController.historial);
router.post('/', llamadaController.reportar);
router.put('/:id/bloquear', llamadaController.bloquear);
router.put('/:id/desbloquear', llamadaController.desbloquear);
router.delete('/:id', autorizar('superadmin'), llamadaController.eliminar);

export default router;
