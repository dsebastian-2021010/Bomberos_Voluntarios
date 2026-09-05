import { Request, Response } from 'express';
import {
  listarTodos,
  buscarPorTelefono,
  buscarPorId,
  crearNumeroReportado,
  registrarNuevoReporte,
  bloquearNumero,
  desbloquearNumero,
  eliminarNumeroReportado,
} from '../models/NumeroReportado';
import { crearReporte, listarPorNumero } from '../models/ReporteLlamada';
import { buscarPorId as buscarUsuarioPorId } from '../models/Usuario';
import { registrarAuditoria } from '../models/LogAuditoria';
import { validatePhoneNumber, validateMotivo } from '../utils/validators';
import { asyncHandler } from '../utils/asyncHandler';
import { NotFoundError, ValidationError } from '../middlewares/errorHandler';
import { notificarNumeroBloqueado } from '../services/emailService';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const numeros = await listarTodos();
  res.json({ success: true, data: numeros });
});

export const historial = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  const numero = await buscarPorId(id);
  if (!numero) {
    throw new NotFoundError('Número no encontrado');
  }

  const reportes = await listarPorNumero(id);
  res.json({ success: true, data: { numero, reportes } });
});

export const reportar = asyncHandler(async (req: Request, res: Response) => {
  const { numeroTelefono, motivo, descripcion } = req.body;

  if (!numeroTelefono || !motivo) {
    throw new ValidationError('El número de teléfono y el motivo son requeridos');
  }

  if (!validatePhoneNumber(numeroTelefono)) {
    throw new ValidationError('Formato de número de teléfono inválido (8-15 dígitos)');
  }

  if (!validateMotivo(motivo)) {
    throw new ValidationError('Motivo inválido');
  }

  let numero = await buscarPorTelefono(numeroTelefono);
  if (!numero) {
    numero = await crearNumeroReportado(numeroTelefono);
  }

  const reporte = await crearReporte({
    numeroReportadoId: numero.id,
    motivo,
    descripcion,
    usuarioId: req.usuario!.userId,
  });

  const numeroActualizado = await registrarNuevoReporte(numero.id);

  await registrarAuditoria({
    usuarioId: req.usuario!.userId,
    accion: 'CREATE',
    tablaAfectada: 'reportes_llamada',
    registroId: reporte.id,
    datosNuevo: reporte,
    ipOrigen: req.ip,
  });

  res.status(201).json({ success: true, data: { numero: numeroActualizado, reporte } });
});

export const bloquear = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  const numero = await buscarPorId(id);
  if (!numero) {
    throw new NotFoundError('Número no encontrado');
  }

  const actualizado = await bloquearNumero(id, req.usuario!.userId);

  await registrarAuditoria({
    usuarioId: req.usuario!.userId,
    accion: 'UPDATE',
    tablaAfectada: 'numeros_reportados',
    registroId: id,
    datosAnterior: numero,
    datosNuevo: actualizado,
    ipOrigen: req.ip,
  });

  const bombero = await buscarUsuarioPorId(req.usuario!.userId);
  notificarNumeroBloqueado({
    numeroTelefono: numero.numero_telefono,
    totalReportes: numero.total_reportes,
    bloqueadoPor: bombero?.nombre || req.usuario!.email,
  });

  res.json({ success: true, data: actualizado });
});

export const desbloquear = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  const numero = await buscarPorId(id);
  if (!numero) {
    throw new NotFoundError('Número no encontrado');
  }

  const actualizado = await desbloquearNumero(id);

  await registrarAuditoria({
    usuarioId: req.usuario!.userId,
    accion: 'UPDATE',
    tablaAfectada: 'numeros_reportados',
    registroId: id,
    datosAnterior: numero,
    datosNuevo: actualizado,
    ipOrigen: req.ip,
  });

  res.json({ success: true, data: actualizado });
});

export const eliminar = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  const numero = await buscarPorId(id);
  if (!numero) {
    throw new NotFoundError('Número no encontrado');
  }

  await eliminarNumeroReportado(id);

  await registrarAuditoria({
    usuarioId: req.usuario!.userId,
    accion: 'DELETE',
    tablaAfectada: 'numeros_reportados',
    registroId: id,
    datosAnterior: numero,
    ipOrigen: req.ip,
  });

  res.json({ success: true, data: { message: 'Número eliminado correctamente' } });
});
