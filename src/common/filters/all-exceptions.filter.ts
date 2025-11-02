import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DuplicatePokemonException } from '../../teams/exceptions/duplicate-pokemon.exception';
import { TeamSizeExceededException } from '../../teams/exceptions/team-size-exceeded.exception';

/**
 * Filtre global qui centralise la gestion des exceptions personnalisées de validation métier
 * Les exceptions HTTP standard (NotFoundException, BadRequestException, etc.) sont gérées par NestJS
 * Ce filtre ne traite que les exceptions métier spécifiques nécessitant une logique personnalisée
 */
@Catch(
  // Exceptions liées aux équipes (teams)
  DuplicatePokemonException,
  TeamSizeExceededException,
)
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Code de statut HTTP par défaut
    const message = exception.message;
    let error = 'Internal Server Error';
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    // Détermination du code de statut HTTP approprié selon le type d'exception
    if (exception instanceof TeamSizeExceededException) {
      error = 'Bad Request';
      statusCode = HttpStatus.BAD_REQUEST;
    } else if (exception instanceof DuplicatePokemonException) {
      error = 'Conflict';
      statusCode = HttpStatus.CONFLICT;
    }

    // Construction de la réponse d'erreur standardisée
    response.status(statusCode).json({
      message: [message],
      error,
      statusCode,
    });
  }
}
