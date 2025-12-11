import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from 'express';
import { StatusCodes } from 'http-status-codes';

import { SuccessResponse, validateBody } from '@/common';

import { OfflineJeopardyService } from './offline-jeopardy.service';
import {
  CreateOfflineJeopardySchema,
  type ICreateOfflineJeopardy,
  type IUpdateOfflineJeopardy,
  UpdateOfflineJeopardySchema,
} from './schema';

export const OfflineJeopardyController = Router()
  .get('/games', async (_: Request, response: Response, next: NextFunction) => {
    try {
      const games = await OfflineJeopardyService.listGames();
      const result = new SuccessResponse(
        StatusCodes.OK,
        'Offline Jeopardy games fetched successfully',
        games,
      );

      return response.status(result.statusCode).json(result.json());
    } catch (error) {
      return next(error);
    }
  })
  .get(
    '/games/:game_id',
    async (
      request: Request<{ game_id: string }>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const game = await OfflineJeopardyService.getGame(
          request.params.game_id,
        );
        const result = new SuccessResponse(
          StatusCodes.OK,
          'Offline Jeopardy game fetched successfully',
          game,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        return next(error);
      }
    },
  )
  .post(
    '/games',
    validateBody({ schema: CreateOfflineJeopardySchema }),
    async (
      request: Request<{}, {}, ICreateOfflineJeopardy>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const game = await OfflineJeopardyService.createGame(request.body);
        const result = new SuccessResponse(
          StatusCodes.CREATED,
          'Offline Jeopardy game created successfully',
          game,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        return next(error);
      }
    },
  )
  .put(
    '/games/:game_id',
    validateBody({ schema: UpdateOfflineJeopardySchema }),
    async (
      request: Request<{ game_id: string }, {}, IUpdateOfflineJeopardy>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const game = await OfflineJeopardyService.updateGame(
          request.params.game_id,
          request.body,
        );
        const result = new SuccessResponse(
          StatusCodes.OK,
          'Offline Jeopardy game updated successfully',
          game,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        return next(error);
      }
    },
  )
  .delete(
    '/games/:game_id',
    async (
      request: Request<{ game_id: string }>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const resultPayload = await OfflineJeopardyService.deleteGame(
          request.params.game_id,
        );
        const result = new SuccessResponse(
          StatusCodes.OK,
          'Offline Jeopardy game deleted successfully',
          resultPayload,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        return next(error);
      }
    },
  );
