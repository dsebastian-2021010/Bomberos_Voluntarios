import { Request, Response } from 'express';
import {
  crearUsuario,
  listarUsuarios,
  buscarPorEmail,
  buscarPorId,
  actualizarUsuario,
  eliminarUsuario,
  contarSuperadmins,
} from '../models/Usuario';
import { registrarAuditoria } from '../models/LogAuditoria';
import { hashPassword, generateRandomPassword } from '../utils/passwords';
import { validateEmail, validateRol } from '../utils/validators';
import { asyncHandler } from '../utils/asyncHandler';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../middlewares/errorHandler';
import { enviarCredencialesIniciales } from '../services/emailService';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const usuarios = await listarUsuarios();
  res.json({ success: true, data: usuarios });
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const { nombre, email, rol } = req.body;

  if (!nombre || !email || !rol) {
    throw new ValidationError('Nombre, email y rol son requeridos');
  }

  if (!validateEmail(email)) {
    throw new ValidationError('Email inválido');
  }

  if (!validateRol(rol)) {
    throw new ValidationError('Rol inválido');
  }

  const existente = await buscarPorEmail(email.toLowerCase().trim());
  if (existente) {
    throw new ConflictError('Ya existe un usuario con ese email');
  }

  const passwordTemporal = generateRandomPassword();
  const passwordHash = await hashPassword(passwordTemporal);

  const usuario = await crearUsuario({
    nombre,
    email: email.toLowerCase().trim(),
    passwordHash,
    rol,
  });

  await registrarAuditoria({
    usuarioId: req.usuario!.userId,
    accion: 'CREATE',
    tablaAfectada: 'usuarios',
    registroId: usuario.id,
    datosNuevo: { nombre, email, rol },
    ipOrigen: req.ip,
  });

  enviarCredencialesIniciales({ email: usuario.email, nombre: usuario.nombre, passwordTemporal });

  res.status(201).json({ success: true, data: usuario });
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { nombre, rol, estado } = req.body;

  if (rol !== undefined && !validateRol(rol)) {
    throw new ValidationError('Rol inválido');
  }

  const usuarioExistente = await buscarPorId(id);
  if (!usuarioExistente) {
    throw new NotFoundError('Usuario no encontrado');
  }

  if (usuarioExistente.rol === 'superadmin' && rol && rol !== 'superadmin') {
    const totalSuperadmins = await contarSuperadmins();
    if (totalSuperadmins <= 1) {
      throw new ForbiddenError('Debe existir al menos un superadmin en el sistema');
    }
  }

  const actualizado = await actualizarUsuario(id, { nombre, rol, estado });

  await registrarAuditoria({
    usuarioId: req.usuario!.userId,
    accion: 'UPDATE',
    tablaAfectada: 'usuarios',
    registroId: id,
    datosAnterior: usuarioExistente,
    datosNuevo: { nombre, rol, estado },
    ipOrigen: req.ip,
  });

  res.json({ success: true, data: actualizado });
});

export const eliminar = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  const usuarioExistente = await buscarPorId(id);
  if (!usuarioExistente) {
    throw new NotFoundError('Usuario no encontrado');
  }

  if (usuarioExistente.rol === 'superadmin') {
    const totalSuperadmins = await contarSuperadmins();
    if (totalSuperadmins <= 1) {
      throw new ForbiddenError('No se puede eliminar el único superadmin del sistema');
    }
  }

  if (id === req.usuario!.userId) {
    throw new ForbiddenError('No puedes eliminar tu propia cuenta');
  }

  await eliminarUsuario(id);

  await registrarAuditoria({
    usuarioId: req.usuario!.userId,
    accion: 'DELETE',
    tablaAfectada: 'usuarios',
    registroId: id,
    datosAnterior: usuarioExistente,
    ipOrigen: req.ip,
  });

  res.json({ success: true, data: { message: 'Usuario eliminado correctamente' } });
});
