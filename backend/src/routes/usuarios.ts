import { Router } from 'express';
import * as usuarioController from '../controllers/usuarioController';
import { autenticar } from '../middlewares/autenticacion';
import { autorizar } from '../middlewares/autorizacion';
import { crearUsuarioLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.use(autenticar);

router.get('/', autorizar('superadmin'), usuarioController.listar);
router.post('/', autorizar('superadmin'), crearUsuarioLimiter, usuarioController.crear);
router.put('/:id', autorizar('superadmin'), usuarioController.actualizar);
router.delete('/:id', autorizar('superadmin'), usuarioController.eliminar);

export default router;
