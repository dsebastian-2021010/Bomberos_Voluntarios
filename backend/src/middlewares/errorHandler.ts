import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(err: AppError, req: Request, res: Response, next: NextFunction) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  if (statusCode >= 500) {
    console.error(`[ERROR] ${statusCode}: ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      statusCode,
      message,
    },
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: { statusCode: 404, message: 'Ruta no encontrada' },
  });
}

export class ValidationError extends Error {
  statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401;
  constructor(message: string = 'No autorizado') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  statusCode = 403;
  constructor(message: string = 'Acceso denegado') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  constructor(message: string = 'No encontrado') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  statusCode = 409;
  constructor(message: string = 'Conflicto con el estado actual del recurso') {
    super(message);
    this.name = 'ConflictError';
  }
}
