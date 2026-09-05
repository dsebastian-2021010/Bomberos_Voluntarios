import { Request, Response } from 'express';
import { crearBloqueo, listarTodos, marcarSincronizado } from '../models/NumeroBloqueado';
import { buscarPorId as buscarUsuarioPorId } from '../models/Usuario';
import { registrarAuditoria } from '../models/LogAuditoria';
import { validatePhoneNumber } from '../utils/validators';
import { asyncHandler } from '../utils/asyncHandler';
import { ValidationError } from '../middlewares/errorHandler';
import { notificarBloqueoRegistrado } from '../services/emailService';
import { sincronizarBloqueoExterno } from '../services/externalBlocklistService';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const bloqueos = await listarTodos();
  res.json({ success: true, data: bloqueos });
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const { numeroTelefono, razon } = req.body;

  if (!numeroTelefono || !razon) {
    throw new ValidationError('El número de teléfono y la razón son requeridos');
  }

  if (!validatePhoneNumber(numeroTelefono)) {
    throw new ValidationError('Formato de número de teléfono inválido (8-15 dígitos)');
  }

  if (typeof razon !== 'string' || razon.trim().length < 3) {
    throw new ValidationError('La razón debe tener al menos 3 caracteres');
  }

  const bloqueo = await crearBloqueo({
    numeroTelefono,
    razon: razon.trim(),
    usuarioId: req.usuario!.userId,
  });

  await registrarAuditoria({
    usuarioId: req.usuario!.userId,
    accion: 'CREATE',
    tablaAfectada: 'numeros_bloqueados',
    registroId: bloqueo.id,
    datosNuevo: bloqueo,
    ipOrigen: req.ip,
  });

  const resultadoSync = await sincronizarBloqueoExterno(bloqueo.numero_telefono, bloqueo.fecha_expiracion);
  await marcarSincronizado(bloqueo.id, { exito: resultadoSync.exito, error: resultadoSync.error });

  const bombero = await buscarUsuarioPorId(req.usuario!.userId);
  notificarBloqueoRegistrado({
    numeroTelefono: bloqueo.numero_telefono,
    razon: bloqueo.razon,
    reportadoPor: bombero?.nombre || req.usuario!.email,
    fechaBloqueo: bloqueo.fecha_bloqueo,
    fechaExpiracion: bloqueo.fecha_expiracion,
  });

  res.status(201).json({
    success: true,
    data: { ...bloqueo, sincronizado_externo: resultadoSync.exito },
  });
});
