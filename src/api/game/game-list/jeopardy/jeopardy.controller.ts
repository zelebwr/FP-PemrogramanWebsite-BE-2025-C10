import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from 'express';
import { StatusCodes } from 'http-status-codes';

import {
  type AuthedRequest,
  SuccessResponse,
  validateAuth,
  validateBody,
} from '@/common';

import { JeopardyService } from './jeopardy.service';
import {
  CreateJeopardySchema,
  type ICreateJeopardy,
  type IUpdateJeopardy,
  UpdateJeopardySchema,
} from './schema';

export const JeopardyController = Router()
  // Create a new Jeopardy game
  .post(
    '/',
    validateAuth({}),
    validateBody({
      schema: CreateJeopardySchema,
      file_fields: [
        { name: 'thumbnail_image', maxCount: 1 },
        { name: 'files_to_upload', maxCount: 20 },
      ],
    }),
    async (
      request: AuthedRequest<{}, {}, ICreateJeopardy>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const newGame = await JeopardyService.createGame(
          request.body,
          request.user!.user_id,
        );
        const result = new SuccessResponse(
          StatusCodes.CREATED,
          'Jeopardy game created',
          newGame,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        return next(error);
      }
    },
  )
  // Get game detail (for editing)
  .get(
    '/:game_id',
    validateAuth({}),
    async (
      request: AuthedRequest<{ game_id: string }>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const game = await JeopardyService.getGameDetail(
          request.params.game_id,
          request.user!.user_id,
          request.user!.role,
        );
        const result = new SuccessResponse(
          StatusCodes.OK,
          'Get game successfully',
          game,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        return next(error);
      }
    },
  )
  // Get game for public play
  .get(
    '/:game_id/play/public',
    async (
      request: Request<{ game_id: string }>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const game = await JeopardyService.getGamePlay(
          request.params.game_id,
          true,
        );
        const result = new SuccessResponse(
          StatusCodes.OK,
          'Get public game successfully',
          game,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        return next(error);
      }
    },
  )
  // Get game for private play (authenticated)
  .get(
    '/:game_id/play/private',
    validateAuth({}),
    async (
      request: AuthedRequest<{ game_id: string }>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const game = await JeopardyService.getGamePlay(
          request.params.game_id,
          false,
          request.user!.user_id,
          request.user!.role,
        );
        const result = new SuccessResponse(
          StatusCodes.OK,
          'Get private game successfully',
          game,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        return next(error);
      }
    },
  )
  // Update a Jeopardy game
  .put(
    '/:game_id',
    validateAuth({}),
    validateBody({
      schema: UpdateJeopardySchema,
      file_fields: [{ name: 'thumbnail_image', maxCount: 1 }],
    }),
    async (
      request: AuthedRequest<{ game_id: string }, {}, IUpdateJeopardy>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        // Map 'is_publish' to 'is_publish_immediately' if necessary
        const payload = { ...(request.body as Partial<IUpdateJeopardy>) };

        if (payload.is_publish !== undefined) {
          payload.is_publish_immediately = payload.is_publish;
        }

        const updatedGame = await JeopardyService.updateGame(
          payload as IUpdateJeopardy,
          request.params.game_id,
          request.user!.user_id,
          request.user!.role,
        );
        const result = new SuccessResponse(
          StatusCodes.OK,
          'Jeopardy game updated',
          updatedGame,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        return next(error);
      }
    },
  )

  // Partial update a Jeopardy game
  .patch(
    '/:game_id',
    validateAuth({}),
    validateBody({
      schema: UpdateJeopardySchema, // Reuse the schema
    }),
    async (
      request: AuthedRequest<{ game_id: string }, {}, IUpdateJeopardy>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        // Build payload from request.body (not params) and ensure proper typing
        const payload = { ...(request.body as Partial<IUpdateJeopardy>) };

        if (payload.is_publish !== undefined) {
          payload.is_publish_immediately = payload.is_publish;
        }

        const updatedGame = await JeopardyService.updateGame(
          payload as IUpdateJeopardy,
          request.params.game_id,
          request.user!.user_id,
          request.user!.role,
        );
        const result = new SuccessResponse(
          StatusCodes.OK,
          'Jeopardy game updated',
          updatedGame,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        return next(error);
      }
    },
  )

  .post(
    '/:game_id/end',
    async (
      request: Request<{ game_id: string }>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        await JeopardyService.endGame(request.params.game_id);
        const result = new SuccessResponse(
          StatusCodes.OK,
          'Game finished successfully',
          null,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        return next(error);
      }
    },
  )

  // Delete a Jeopardy game
  .delete(
    '/:game_id',
    validateAuth({}),
    async (
      request: AuthedRequest<{ game_id: string }>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const result = await JeopardyService.deleteGame(
          request.params.game_id,
          request.user!.user_id,
          request.user!.role,
        );

        const successResponse = new SuccessResponse(
          StatusCodes.OK,
          'Jeopardy game deleted successfully',
          result,
        );

        return response
          .status(successResponse.statusCode)
          .json(successResponse.json());
      } catch (error) {
        return next(error);
      }
    },
  );
