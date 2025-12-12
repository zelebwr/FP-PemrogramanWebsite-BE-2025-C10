import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from 'express';
import { StatusCodes } from 'http-status-codes';

import { type AuthedRequest, SuccessResponse, validateAuth } from '@/common';
import { AdditionalValidation } from '@/utils';

import { GameService } from './game.service';
import GameListRouter from './game-list/game-list.router';
import { GamePaginateQuerySchema, GameTemplateQuerySchema } from './schema';

export const GameController = Router()
  .get(
    '/',
    validateAuth({ optional: true }),
    async (request: AuthedRequest, response: Response, next: NextFunction) => {
      try {
        const query = AdditionalValidation.validate(
          GamePaginateQuerySchema,
          request.query,
        );

        const games = await GameService.getAllGame(query);
        const result = new SuccessResponse(
          StatusCodes.OK,
          'Get all game successfully',
          games.data,
          games.meta,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        return next(error);
      }
    },
  )
  .get(
    '/template',
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const query = AdditionalValidation.validate(
          GameTemplateQuerySchema,
          request.query,
        );
        const templates = await GameService.getAllGameTemplate(query);
        const result = new SuccessResponse(
          StatusCodes.OK,
          'Get all game template successfully',
          templates,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        return next(error);
      }
    },
  )
  .use('/game-type', GameListRouter);
