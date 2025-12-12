import { type Games, type GameTemplates, type Prisma } from '@prisma/client';

import { prisma } from '@/common';
import { paginate } from '@/utils';

import { type IGamePaginateQuery, type IGameTemplateQuery } from './schema';

export abstract class GameService {
  static async getAllGame(query: IGamePaginateQuery) {
    const filters: Prisma.GamesWhereInput[] = [{ is_published: true }];

    if (query.search) {
      filters.push({ name: { contains: query.search, mode: 'insensitive' } });
    }

    if (query.gameTypeSlug) {
      filters.push({ game_template: { slug: query.gameTypeSlug } });
    }

    const orderBy: Prisma.GamesOrderByWithRelationInput[] = [];
    if (query.orderByName) orderBy.push({ name: query.orderByName });
    if (query.orderByPlayAmount)
      orderBy.push({ total_played: query.orderByPlayAmount });
    orderBy.push({ created_at: query.orderByCreatedAt || 'desc' });

    const args: {
      where: Prisma.GamesWhereInput;
      select: Prisma.GamesSelect;
      orderBy: Prisma.GamesOrderByWithRelationInput[];
    } = {
      where: { AND: filters },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail_image: true,
        total_played: true,
        game_template: {
          select: { name: true },
        },
      },
      orderBy,
    };

    const paginationResult = await paginate<
      Games & { game_template: GameTemplates },
      typeof args
    >(prisma.games, query.page, query.perPage, args);

    const cleanedResult = paginationResult.data.map(game => ({
      id: game.id,
      name: game.name,
      description: game.description,
      thumbnail_image: game.thumbnail_image,
      total_played: game.total_played,
      game_template: game.game_template.name,
    }));

    return {
      data: cleanedResult,
      meta: paginationResult.meta,
    };
  }

  static async getAllGameTemplate(query: IGameTemplateQuery) {
    const gameTemplates = await prisma.gameTemplates.findMany({
      where: {
        AND: [
          {
            name: query.search
              ? { contains: query.search, mode: 'insensitive' }
              : undefined,
          },
          { is_time_limit_based: query.withTimeLimit },
          { is_life_based: query.withLifeLimit },
        ],
      },
      select: {
        slug: true,
        name: true,
        logo: true,
        id: !query.lite,
        description: !query.lite,
        is_time_limit_based: !query.lite,
        is_life_based: !query.lite,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    return gameTemplates;
  }
}
