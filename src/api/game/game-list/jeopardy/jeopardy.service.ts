import { type Prisma, type ROLE } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { v4 } from 'uuid';

import { ErrorResponse, prisma } from '@/common';
import { type IJeopardyGameData } from '@/common/interface/games';
import { FileManager } from '@/utils';

import { type ICreateJeopardy, type IUpdateJeopardy } from './schema';

export abstract class JeopardyService {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private static GAME_SLUG = 'jeopardy';

  /**
   * Create a new Jeopardy game
   */
  static async createGame(data: ICreateJeopardy, user_id: string) {
    await this.existGameCheck(data.name);

    const newGameId = v4();
    const gameTemplateId = await this.getGameTemplateId();

    const thumbnailImagePath = await FileManager.upload(
      `game/jeopardy/${newGameId}`,
      data.thumbnail_image,
    );

    const clueImagePaths: string[] = [];

    if (data.files_to_upload && data.files_to_upload.length > 0) {
      for (const file of data.files_to_upload) {
        const path = await FileManager.upload(
          `game/jeopardy/${newGameId}`,
          file,
        );
        clueImagePaths.push(path);
      }
    }

    // Build the game JSON with generated IDs
    const gameJson: IJeopardyGameData = {
      settings: { ...data.settings },
      rounds: data.rounds.map((round, roundIndex) => ({
        id: `round-${String(roundIndex + 1).padStart(2, '0')}`,
        type: round.type,
        name: round.name,
        order: roundIndex,
        categories: round.categories.map((category, categoryIndex) => ({
          id: `cat-${String(roundIndex + 1).padStart(2, '0')}-${String(categoryIndex + 1).padStart(2, '0')}`,
          title: category.title,
          order: categoryIndex,
          clues: category.clues.map((clue, clueIndex) => {
            let finalMediaUrl = clue.media_url ?? null;

            if (
              typeof clue.media_image_index === 'number' &&
              clue.media_image_index >= 0
            ) {
              finalMediaUrl = clueImagePaths[clue.media_image_index] || null;
            }

            return {
              id: `clue-${String(roundIndex + 1).padStart(2, '0')}-${String(categoryIndex + 1).padStart(2, '0')}-${String(clueIndex + 1).padStart(2, '0')}`,
              question: clue.question,
              answer: clue.answer,
              value: clue.value,
              media_url: finalMediaUrl,
              is_daily_double: clue.is_daily_double,
            };
          }),
        })),
      })),
    };

    const newGame = await prisma.games.create({
      data: {
        id: newGameId,
        game_template_id: gameTemplateId,
        creator_id: user_id,
        name: data.name,
        description: data.description,
        thumbnail_image: thumbnailImagePath,
        is_published: data.is_publish_immediately,
        game_json: gameJson as unknown as Prisma.InputJsonValue,
      },
      select: {
        id: true,
      },
    });

    return newGame;
  }

  /**
   * Get detailed game information (for editing)
   */
  static async getGameDetail(
    game_id: string,
    user_id: string,
    user_role: ROLE,
  ) {
    const game = await prisma.games.findUnique({
      where: { id: game_id },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail_image: true,
        is_published: true,
        created_at: true,
        game_json: true,
        creator_id: true,
        total_played: true,
        game_template: {
          select: { slug: true },
        },
      },
    });

    if (!game || game.game_template.slug !== this.GAME_SLUG)
      throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Game not found');

    if (user_role !== 'SUPER_ADMIN' && game.creator_id !== user_id)
      throw new ErrorResponse(
        StatusCodes.FORBIDDEN,
        'User cannot access this game',
      );

    return {
      ...game,
      creator_id: undefined,
      game_template: undefined,
    };
  }

  /**
   * Get game data for playing
   */
  static async getGamePlay(
    game_id: string,
    is_public: boolean,
    user_id?: string,
    user_role?: ROLE,
  ) {
    const game = await prisma.games.findUnique({
      where: { id: game_id },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail_image: true,
        is_published: true,
        game_json: true,
        creator_id: true,
        game_template: {
          select: { slug: true },
        },
      },
    });

    if (
      !game ||
      (is_public && !game.is_published) ||
      game.game_template.slug !== this.GAME_SLUG
    )
      throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Game not found');

    if (
      !is_public &&
      user_role !== 'SUPER_ADMIN' &&
      game.creator_id !== user_id
    )
      throw new ErrorResponse(
        StatusCodes.FORBIDDEN,
        'User cannot get this game data',
      );

    const gameJson = game.game_json as unknown as IJeopardyGameData | null;

    if (!gameJson)
      throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Game data not found');

    return {
      id: game.id,
      name: game.name,
      description: game.description,
      thumbnail_image: game.thumbnail_image,
      is_published: game.is_published,
      settings: gameJson.settings,
      rounds: gameJson.rounds,
    };
  }

  /**
   * Update an existing Jeopardy game
   */
  static async updateGame(
    data: IUpdateJeopardy,
    game_id: string,
    user_id: string,
    user_role: ROLE,
  ) {
    const game = await prisma.games.findUnique({
      where: { id: game_id },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail_image: true,
        is_published: true,
        game_json: true,
        creator_id: true,
        game_template: {
          select: { slug: true },
        },
      },
    });

    if (!game || game.game_template.slug !== this.GAME_SLUG)
      throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Game not found');

    if (user_role !== 'SUPER_ADMIN' && game.creator_id !== user_id)
      throw new ErrorResponse(
        StatusCodes.FORBIDDEN,
        'User cannot access this game',
      );

    if (data.name) {
      const isNameExist = await prisma.games.findUnique({
        where: { name: data.name },
        select: { id: true },
      });

      if (isNameExist && isNameExist.id !== game_id)
        throw new ErrorResponse(
          StatusCodes.BAD_REQUEST,
          'Game name is already used',
        );
    }

    const oldGameJson = game.game_json as IJeopardyGameData | null;

    let thumbnailImagePath = game.thumbnail_image;

    if (data.thumbnail_image) {
      if (game.thumbnail_image) {
        await FileManager.remove(game.thumbnail_image);
      }

      thumbnailImagePath = await FileManager.upload(
        `game/jeopardy/${game_id}`,
        data.thumbnail_image,
      );
    }

    // Build updated game JSON
    const gameJson: IJeopardyGameData = data.rounds
      ? {
          settings: data.settings ??
            oldGameJson?.settings ?? {
              time_limit_per_clue: 30,
              allow_daily_double: true,
              double_jeopardy_multiplier: 2,
              max_teams: 4,
              starting_score: 0,
            },
          rounds: data.rounds.map((round, roundIndex) => ({
            id: `round-${String(roundIndex + 1).padStart(2, '0')}`,
            type: round.type,
            name: round.name,
            order: roundIndex,
            categories: round.categories.map((category, categoryIndex) => ({
              id: `cat-${String(roundIndex + 1).padStart(2, '0')}-${String(categoryIndex + 1).padStart(2, '0')}`,
              title: category.title,
              order: categoryIndex,
              clues: category.clues.map((clue, clueIndex) => ({
                id: `clue-${String(roundIndex + 1).padStart(2, '0')}-${String(categoryIndex + 1).padStart(2, '0')}-${String(clueIndex + 1).padStart(2, '0')}`,
                question: clue.question,
                answer: clue.answer,
                value: clue.value,
                media_url: clue.media_url ?? null,
                is_daily_double: clue.is_daily_double,
              })),
            })),
          })),
        }
      : {
          settings: data.settings ??
            oldGameJson?.settings ?? {
              time_limit_per_clue: 30,
              allow_daily_double: true,
              double_jeopardy_multiplier: 2,
              max_teams: 4,
              starting_score: 0,
            },
          rounds: oldGameJson?.rounds ?? [],
        };

    const updatedGame = await prisma.games.update({
      where: { id: game_id },
      data: {
        name: data.name,
        description: data.description,
        thumbnail_image: thumbnailImagePath,
        is_published: data.is_publish,
        game_json: gameJson as unknown as Prisma.InputJsonValue,
      },
      select: {
        id: true,
      },
    });

    return updatedGame;
  }

  /**
   * Delete a Jeopardy game
   */
  static async deleteGame(game_id: string, user_id: string, user_role: ROLE) {
    const game = await prisma.games.findUnique({
      where: { id: game_id },
      select: {
        id: true,
        thumbnail_image: true,
        creator_id: true,
        game_template: {
          select: { slug: true },
        },
      },
    });

    if (!game || game.game_template.slug !== this.GAME_SLUG)
      throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Game not found');

    if (user_role !== 'SUPER_ADMIN' && game.creator_id !== user_id)
      throw new ErrorResponse(
        StatusCodes.FORBIDDEN,
        'User cannot delete this game',
      );

    if (game.thumbnail_image) {
      await FileManager.remove(game.thumbnail_image);
    }

    await prisma.games.delete({ where: { id: game_id } });

    return { id: game_id };
  }

  /**
   * Check if game name already exists
   */
  private static async existGameCheck(game_name?: string, game_id?: string) {
    const where: Record<string, unknown> = {};
    if (game_name) where.name = game_name;
    if (game_id) where.id = game_id;

    if (Object.keys(where).length === 0) return null;

    const game = await prisma.games.findFirst({
      where,
      select: { id: true, creator_id: true },
    });

    if (game)
      throw new ErrorResponse(
        StatusCodes.BAD_REQUEST,
        'Game name is already exist',
      );

    return game;
  }

  /**
   * Get the Jeopardy game template ID
   */
  private static async getGameTemplateId() {
    const result = await prisma.gameTemplates.findUnique({
      where: { slug: 'jeopardy' },
    });

    if (!result)
      throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Game template not found');

    return result.id;
  }

  static async endGame(game_id: string) {
    // 1. Check if game exists
    const game = await prisma.games.findUnique({
      where: { id: game_id },
      select: { id: true },
    });

    if (!game) throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Game not found');

    // 2. Increment the Play Count
    await prisma.games.update({
      where: { id: game_id },
      data: { total_played: { increment: 1 } },
    });
  }
}
