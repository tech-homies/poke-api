import { Injectable } from '@nestjs/common';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { Low } from 'lowdb';
import { Store } from './store';

interface FileStoreData {
  store: Record<string, unknown>;
  sets: Record<string, string[]>;
}

export const DEFAULT_DB_FILE_PATH = 'data/db.json';

/**
 * Base de données persistée dans un fichier JSON plat (via lowdb).
 *
 * Utilisée par `npm start` / `start:prod`. Contrairement à
 * `InMemoryStoreService`, les données survivent aux redémarrages : le seed
 * initial (voir les `onModuleInit` de chaque service, qui ne chargent les
 * données du repo que si elles sont absentes) ne s'exécute donc qu'une seule
 * fois, au tout premier démarrage. Pour repartir des données d'origine,
 * supprimer le fichier (`npm run db:reset`) puis relancer l'application.
 *
 * lowdb étant un module ESM pur, il est chargé via un `import()` dynamique
 * (l'implémentation est compilée en CommonJS) et l'accès au fichier n'est
 * initialisé qu'au premier appel, mémoïsé pour éviter toute double lecture.
 */
@Injectable()
export class FileStoreService extends Store {
  private readonly filePath = process.env.DB_FILE_PATH ?? DEFAULT_DB_FILE_PATH;
  private dbPromise: Promise<Low<FileStoreData>> | null = null;

  private async getDb(): Promise<Low<FileStoreData>> {
    if (!this.dbPromise) {
      this.dbPromise = this.initDb();
    }
    return this.dbPromise;
  }

  private async initDb(): Promise<Low<FileStoreData>> {
    const { JSONFilePreset } = await import('lowdb/node');
    await mkdir(dirname(this.filePath), { recursive: true });
    return JSONFilePreset<FileStoreData>(this.filePath, {
      store: {},
      sets: {},
    });
  }

  async set(key: string, value: any): Promise<void> {
    const db = await this.getDb();
    await db.update((data) => {
      data.store[key] = structuredClone(value);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const db = await this.getDb();
    const value = db.data.store[key];
    return value !== undefined ? (structuredClone(value) as T) : null;
  }

  async del(key: string): Promise<void> {
    const db = await this.getDb();
    await db.update((data) => {
      delete data.store[key];
      delete data.sets[key];
    });
  }

  async exists(key: string): Promise<boolean> {
    const db = await this.getDb();
    return key in db.data.store || key in db.data.sets;
  }

  async incr(key: string): Promise<number> {
    const db = await this.getDb();
    let next = 0;
    await db.update((data) => {
      const current = (data.store[key] as number | undefined) ?? 0;
      next = current + 1;
      data.store[key] = next;
    });
    return next;
  }

  async sAdd(key: string, value: string): Promise<void> {
    const db = await this.getDb();
    await db.update((data) => {
      const set = new Set(data.sets[key] ?? []);
      set.add(value);
      data.sets[key] = [...set];
    });
  }

  async sRem(key: string, value: string): Promise<void> {
    const db = await this.getDb();
    await db.update((data) => {
      data.sets[key] = (data.sets[key] ?? []).filter((v) => v !== value);
    });
  }

  async sMembers(key: string): Promise<string[]> {
    const db = await this.getDb();
    return [...(db.data.sets[key] ?? [])];
  }

  async mGet<T>(keys: string[]): Promise<(T | null)[]> {
    if (keys.length === 0) return [];
    const db = await this.getDb();
    return keys.map((key) => {
      const value = db.data.store[key];
      return value !== undefined ? (structuredClone(value) as T) : null;
    });
  }

  async mSet(keyValuePairs: { key: string; value: any }[]): Promise<void> {
    const db = await this.getDb();
    await db.update((data) => {
      for (const { key, value } of keyValuePairs) {
        data.store[key] = structuredClone(value);
      }
    });
  }
}
