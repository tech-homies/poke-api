import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { PokemonTypeNotFoundException } from '../../pokemon-types/exceptions/pokemon-type-not-found.exception';
import { PokemonNotFoundException } from '../../pokemons/exceptions/pokemon-not-found.exception';
import { TrainerNotFoundException } from '../../trainers/exceptions/trainer-not-found.exception';
import { DuplicatePokemonException } from '../../teams/exception/duplicate-pokemon.exception';
import { TeamSizeExceededException } from '../../teams/exception/team-size-exceeded.exception';

/**
 * Filtre global qui centralise la gestion de toutes les exceptions personnalisées de l'application
 * Évite d'avoir à appliquer des filtres d'exception individuellement sur chaque contrôleur/méthode
 * Assure une cohérence dans le traitement des erreurs à travers toute l'API
 */
@Catch(
  // Exceptions liées aux types de pokémons
  PokemonTypeNotFoundException,

  // Exceptions liées aux pokémons
  PokemonNotFoundException,

  // Exceptions liées aux dresseurs (trainers)
  TrainerNotFoundException,

  // Exceptions liées aux équipes (teams)
  DuplicatePokemonException,
  TeamSizeExceededException,
)
export class AllExceptionsFilter implements ExceptionFilter {
  // Exceptions correspondant aux erreurs de validation/mauvaise requête (400 Bad Request)
  private readonly badRequestExceptions = [
    DuplicatePokemonException,
    TeamSizeExceededException,
  ];

  // Exceptions correspondant aux ressources non trouvées (404 Not Found)
  private readonly notFoundExceptions = [
    PokemonTypeNotFoundException,
    PokemonNotFoundException,
    TrainerNotFoundException,
  ];

  // Exceptions correspondant aux conflits avec l'état actuel des ressources (409 Conflict)
  private readonly conflictExceptions = [];

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Code de statut HTTP par défaut
    const message = exception.message;
    let error = 'Internal Server Error';
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    // Détermination du code de statut HTTP approprié selon le type d'exception
    if (
      this.badRequestExceptions.some(
        (exceptionType) => exception instanceof exceptionType,
      )
    ) {
      error = 'Bad Request';
      statusCode = HttpStatus.BAD_REQUEST;
    } else if (
      this.notFoundExceptions.some(
        (exceptionType) => exception instanceof exceptionType,
      )
    ) {
      error = 'Not Found';
      statusCode = HttpStatus.NOT_FOUND;
    } else if (
      this.conflictExceptions.some(
        (exceptionType) => exception instanceof exceptionType,
      )
    ) {
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
