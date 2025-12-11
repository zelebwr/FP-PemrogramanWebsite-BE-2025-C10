import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { StatusCodes } from 'http-status-codes';

import { ErrorResponse } from '@/common';

import {
  type ICreateOfflineJeopardy,
  type IOfflineCategoryInput,
  type IOfflineClueInput,
  type IUpdateOfflineJeopardy,
} from './schema';

interface IOfflineStore {
  games: IOfflineJeopardyGame[];
}

export interface IOfflineJeopardyGame {
  id: string;
  name: string;
  description?: string;
  categories: IOfflineCategory[];
  created_at: string;
  updated_at: string;
}

export interface IOfflineCategory {
  id: string;
  title: string;
  clues: IOfflineClue[];
}

export interface IOfflineClue {
  id: string;
  question: string;
  answer: string;
  value: number;
}

const STORAGE_DIR = path.join(process.cwd(), 'storage');
const STORAGE_FILE = path.join(STORAGE_DIR, 'offline-jeopardy.json');

export abstract class OfflineJeopardyService {
  static async listGames() {
    const store = await this.ensureSeed();

    return [...store.games].sort((a, b) => {
      const updatedAtB = new Date(b.updated_at).getTime();
      const updatedAtA = new Date(a.updated_at).getTime();

      return updatedAtB - updatedAtA;
    });
  }

  static async getGame(game_id: string) {
    const store = await this.ensureSeed();
    const game = store.games.find(item => item.id === game_id);

    if (!game)
      throw new ErrorResponse(
        StatusCodes.NOT_FOUND,
        'Offline Jeopardy game not found',
      );

    return game;
  }

  static async createGame(payload: ICreateOfflineJeopardy) {
    const store = await this.readStore();
    const now = new Date().toISOString();
    const normalizedGame = this.buildGame(payload, now);

    store.games.push(normalizedGame);
    await this.writeStore(store);

    return normalizedGame;
  }

  static async updateGame(game_id: string, payload: IUpdateOfflineJeopardy) {
    const store = await this.readStore();
    const index = store.games.findIndex(item => item.id === game_id);

    if (index === -1)
      throw new ErrorResponse(
        StatusCodes.NOT_FOUND,
        'Offline Jeopardy game not found',
      );

    const existing = store.games[index];
    let descriptionValue = existing.description;

    if (typeof payload.description === 'string') {
      descriptionValue = payload.description.trim() || undefined;
    }

    const updatedGame: IOfflineJeopardyGame = {
      ...existing,
      name: payload.name?.trim() || existing.name,
      description: descriptionValue,
      categories: payload.categories
        ? this.buildCategories(payload.categories)
        : existing.categories,
      updated_at: new Date().toISOString(),
    };

    store.games[index] = updatedGame;
    await this.writeStore(store);

    return updatedGame;
  }

  static async deleteGame(game_id: string) {
    const store = await this.readStore();
    const index = store.games.findIndex(item => item.id === game_id);

    if (index === -1)
      throw new ErrorResponse(
        StatusCodes.NOT_FOUND,
        'Offline Jeopardy game not found',
      );

    const [removed] = store.games.splice(index, 1);
    await this.writeStore(store);

    return { id: removed.id };
  }

  private static async ensureSeed() {
    const store = await this.readStore();

    if (store.games.length === 0) {
      store.games.push(this.createSampleGame());
      await this.writeStore(store);
    }

    return store;
  }

  private static buildGame(
    payload: ICreateOfflineJeopardy,
    timestamp: string,
  ): IOfflineJeopardyGame {
    return {
      id: randomUUID(),
      name: payload.name.trim(),
      description: payload.description?.trim() || undefined,
      categories: this.buildCategories(payload.categories),
      created_at: timestamp,
      updated_at: timestamp,
    };
  }

  private static buildCategories(categories: IOfflineCategoryInput[]) {
    return categories.map(category => ({
      id: randomUUID(),
      title: category.title.trim(),
      clues: this.buildClues(category.clues),
    }));
  }

  private static buildClues(clues: IOfflineClueInput[]) {
    return clues.map(clue => ({
      id: randomUUID(),
      question: clue.question.trim(),
      answer: clue.answer.trim(),
      value: Math.max(0, clue.value || 0),
    }));
  }

  private static async readStore(): Promise<IOfflineStore> {
    try {
      const raw = await readFile(STORAGE_FILE, 'utf8');
      const parsed: unknown = JSON.parse(raw);

      if (!this.isValidStore(parsed)) {
        return { games: [] };
      }

      return parsed;
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        await this.writeStore({ games: [] });

        return { games: [] };
      }

      throw error;
    }
  }

  private static async writeStore(store: IOfflineStore) {
    await mkdir(STORAGE_DIR, { recursive: true });
    await writeFile(STORAGE_FILE, JSON.stringify(store, null, 2), 'utf8');
  }

  private static createSampleGame(): IOfflineJeopardyGame {
    const now = new Date().toISOString();
    const categories: Array<{
      title: string;
      clues: Array<{ question: string; answer: string; value: number }>;
    }> = [
      {
        title: 'Pengetahuan Umum',
        clues: [
          {
            question: 'Ibukota Indonesia adalah?',
            answer: 'Jakarta',
            value: 100,
          },
          {
            question: 'Planet berwarna merah disebut?',
            answer: 'Mars',
            value: 200,
          },
          {
            question: 'Bahan baku utama batik?',
            answer: 'Kain mori',
            value: 300,
          },
        ],
      },
      {
        title: 'Teknologi',
        clues: [
          {
            question: 'Kepanjangan dari HTML?',
            answer: 'HyperText Markup Language',
            value: 100,
          },
          {
            question: 'Sistem operasi mobile milik Google?',
            answer: 'Android',
            value: 200,
          },
          {
            question: 'Protokol untuk alamat website?',
            answer: 'HTTP/HTTPS',
            value: 300,
          },
        ],
      },
      {
        title: 'Sejarah',
        clues: [
          {
            question: 'Proklamasi kemerdekaan Indonesia tahun?',
            answer: '1945',
            value: 100,
          },
          {
            question: 'Kerajaan maritim terbesar Nusantara?',
            answer: 'Sriwijaya',
            value: 200,
          },
          {
            question: 'Bangunan candi terbesar?',
            answer: 'Borobudur',
            value: 300,
          },
        ],
      },
    ];

    return {
      id: randomUUID(),
      name: 'Paket Contoh',
      description:
        'Mulai cepat dengan paket contoh ini atau buat permainanmu sendiri.',
      categories: categories.map(category => ({
        id: randomUUID(),
        title: category.title,
        clues: category.clues.map(clue => ({
          id: randomUUID(),
          question: clue.question,
          answer: clue.answer,
          value: clue.value,
        })),
      })),
      created_at: now,
      updated_at: now,
    };
  }

  private static isValidStore(payload: unknown): payload is IOfflineStore {
    if (!payload || typeof payload !== 'object') return false;

    return Array.isArray((payload as IOfflineStore).games);
  }
}
