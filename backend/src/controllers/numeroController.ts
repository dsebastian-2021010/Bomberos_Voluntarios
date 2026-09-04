import { Request, Response } from 'express';
import {
  crearNumero,
  listarTodos,
  listarPorUsuario,
  buscarPorId,
  actualizarNumero,
  eliminarNumero,
} from '../models/Numero';
import { buscarPorId as buscarUsuarioPorId } from '../models/Usuario';
import { registrarAuditoria } from '../models/LogAuditoria';
import { validatePhoneNumber } from '../utils/validators';
import { asyncHandler } from '../utils/asyncHandler';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../middlewares/errorHandler';
import { notificarNuevoNumero } from '../services/emailService';
import pool from '../config/database';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const { rol, userId } = req.usuario!;

  const numeros = rol === 'usuario' ? await listarPorUsuario(userId) : await listarTodos();

  res.json({ success: true, data: numeros });
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const { numeroTelefono, nombrePropietario, descripcion } = req.body;

  if (!numeroTelefono) {
    throw new ValidationError('El número de teléfono es requerido');
  }

  if (!validatePhoneNumber(numeroTelefono)) {
    throw new ValidationError('Formato de número de teléfono inválido (8-15 dígitos)');
  }

  const existente = await pool.query('SELECT id FROM numeros_celular WHERE numero_telefono = $1', [
    numeroTelefono,
  ]);
  if ((existente.rowCount ?? 0) > 0) {
    throw new ConflictError('Ese número de teléfono ya está registrado');
  }

  const numero = await crearNumero({
    numeroTelefono,
    nombrePropietario,
    descripcion,
    usuarioId: req.usuario!.userId,
  });

  await registrarAuditoria({
    usuarioId: req.usuario!.userId,
    accion: 'CREATE',
    tablaAfectada: 'numeros_celular',
    registroId: numero.id,
    datosNuevo: numero,
    ipOrigen: req.ip,
  });

  const registrador = await buscarUsuarioPorId(req.usuario!.userId);
  notificarNuevoNumero({
    numeroTelefono: numero.numero_telefono,
    nombrePropietario: numero.nombre_propietario,
    descripcion: numero.descripcion,
    registradoPor: registrador?.nombre || req.usuario!.email,
    usuarioId: req.usuario!.userId,
  });

  res.status(201).json({ success: true, data: numero });
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { nombrePropietario, descripcion } = req.body;

  const numeroExistente = await buscarPorId(id);
  if (!numeroExistente) {
    throw new NotFoundError('Número no encontrado');
  }

  if (req.usuario!.rol === 'usuario' && numeroExistente.usuario_id !== req.usuario!.userId) {
    throw new ForbiddenError('No puedes editar números de otros usuarios');
  }

  const actualizado = await actualizarNumero(id, { nombrePropietario, descripcion });

  await registrarAuditoria({
    usuarioId: req.usuario!.userId,
    accion: 'UPDATE',
    tablaAfectada: 'numeros_celular',
    registroId: id,
    datosAnterior: numeroExistente,
    datosNuevo: actualizado,
    ipOrigen: req.ip,
  });

  res.json({ success: true, data: actualizado });
});

export const eliminar = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  const numeroExistente = await buscarPorId(id);
  if (!numeroExistente) {
    throw new NotFoundError('Número no encontrado');
  }

  if (req.usuario!.rol === 'usuario' && numeroExistente.usuario_id !== req.usuario!.userId) {
    throw new ForbiddenError('No puedes eliminar números de otros usuarios');
  }

  await eliminarNumero(id);

  await registrarAuditoria({
    usuarioId: req.usuario!.userId,
    accion: 'DELETE',
    tablaAfectada: 'numeros_celular',
    registroId: id,
    datosAnterior: numeroExistente,
    ipOrigen: req.ip,
  });

  res.json({ success: true, data: { message: 'Número eliminado correctamente' } });
});
