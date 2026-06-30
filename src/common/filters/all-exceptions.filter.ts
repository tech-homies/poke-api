import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
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
  private readonly logger = new Logger(AllExceptionsFilter.name);

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

    // Gestion des erreurs inattendues : on logue la trace complète côté
    // serveur (sans quoi un bug interne passerait totalement inaperçu), mais
    // on ne renvoie qu'un message générique au client pour ne pas exposer de
    // détails d'implémentation.
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    this.logger.error(
      exception instanceof Error ? exception.message : exception,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      message: ['Internal server error'],
      error: 'Internal Server Error',
    });
  }
}
