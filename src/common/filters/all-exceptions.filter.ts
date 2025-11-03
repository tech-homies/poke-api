import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Filtre global optionnel pour intercepter toutes les exceptions HTTP
 * Peut être utilisé pour ajouter une logique de logging ou de transformation personnalisée
 * Pour l'instant, toutes les exceptions métier étendent correctement les exceptions HTTP de NestJS
 * et sont donc gérées automatiquement sans nécessiter de logique personnalisée
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Gestion des exceptions HTTP standard de NestJS
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      response.status(status).json(exceptionResponse);
      return;
    }

    // Gestion des erreurs inattendues
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof Error ? exception.message : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      message: [message],
      error: 'Internal Server Error',
    });
  }
}
