import { Request, Response } from 'express';
import {
  buscarPorEmail,
  buscarPorId,
  registrarLogin,
  registrarIntentoFallido,
  actualizarPassword,
} from '../models/Usuario';
import { registrarAuditoria } from '../models/LogAuditoria';
import { comparePassword, hashPassword } from '../utils/passwords';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { validatePassword } from '../utils/validators';
import { asyncHandler } from '../utils/asyncHandler';
import { UnauthorizedError, ValidationError } from '../middlewares/errorHandler';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError('Email y contraseña son requeridos');
  }

  const usuario = await buscarPorEmail(email.toLowerCase().trim());

  if (!usuario || !usuario.estado) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  const passwordValido = await comparePassword(password, usuario.password_hash);

  if (!passwordValido) {
    await registrarIntentoFallido(usuario.id);
    await registrarAuditoria({
      usuarioId: usuario.id,
      accion: 'LOGIN_FALLIDO',
      ipOrigen: req.ip,
    });
    throw new UnauthorizedError('Credenciales inválidas');
  }

  await registrarLogin(usuario.id);
  await registrarAuditoria({ usuarioId: usuario.id, accion: 'LOGIN', ipOrigen: req.ip });

  const payload = { userId: usuario.id, email: usuario.email, rol: usuario.rol };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    },
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ValidationError('Refresh token requerido');
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError('Refresh token inválido o expirado');
  }

  const usuario = await buscarPorId(payload.userId);
  if (!usuario || !usuario.estado) {
    throw new UnauthorizedError('Usuario no válido');
  }

  const nuevoAccessToken = generateAccessToken({
    userId: usuario.id,
    email: usuario.email,
    rol: usuario.rol,
  });

  res.json({ success: true, data: { accessToken: nuevoAccessToken } });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const usuario = await buscarPorId(req.usuario!.userId);
  if (!usuario) {
    throw new UnauthorizedError('Usuario no encontrado');
  }

  res.json({
    success: true,
    data: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: { message: 'Sesión cerrada correctamente' } });
});

export const cambiarPassword = asyncHandler(async (req: Request, res: Response) => {
  const { passwordActual, passwordNueva } = req.body;

  if (!passwordActual || !passwordNueva) {
    throw new ValidationError('Contraseña actual y nueva son requeridas');
  }

  if (!validatePassword(passwordNueva)) {
    throw new ValidationError(
      'La nueva contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial'
    );
  }

  const usuario = await buscarPorId(req.usuario!.userId);
  if (!usuario) {
    throw new UnauthorizedError();
  }

  const valido = await comparePassword(passwordActual, usuario.password_hash);
  if (!valido) {
    throw new ValidationError('La contraseña actual es incorrecta');
  }

  const nuevoHash = await hashPassword(passwordNueva);
  await actualizarPassword(usuario.id, nuevoHash);

  await registrarAuditoria({
    usuarioId: usuario.id,
    accion: 'UPDATE',
    tablaAfectada: 'usuarios',
    registroId: usuario.id,
    ipOrigen: req.ip,
  });

  res.json({ success: true, data: { message: 'Contraseña actualizada correctamente' } });
});
