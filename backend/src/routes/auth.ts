import { Router } from 'express';
import * as authController from '../controllers/authController';
import { autenticar } from '../middlewares/autenticacion';
import { loginLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/login', loginLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', autenticar, authController.logout);
router.get('/me', autenticar, authController.me);
router.put('/cambiar-password', autenticar, authController.cambiarPassword);

export default router;
