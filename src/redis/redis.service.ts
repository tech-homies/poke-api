import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  async onModuleInit() {
    // Créer et connecter le client Redis
    const redisUrl = process.env.REDIS_URL || process.env.STORAGE_REDIS_URL;

    if (!redisUrl) {
      console.warn(
        '⚠️  REDIS_URL ou STORAGE_REDIS_URL non défini, Redis non connecté',
      );
      return;
    }

    this.client = createClient({
      url: redisUrl,
    });

    this.client.on('error', (err) => console.error('Redis Client Error', err));

    await this.client.connect();
    console.log('✅ Redis connecté avec succès');
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  /**
   * Stocke une valeur dans Redis
   */
  async set(key: string, value: any): Promise<void> {
    if (!this.client) return;
    await this.client.set(key, JSON.stringify(value));
  }

  /**
   * Récupère une valeur depuis Redis
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;
    const value = await this.client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  /**
   * Supprime une clé de Redis
   */
  async del(key: string): Promise<void> {
    if (!this.client) return;
    await this.client.del(key);
  }

  /**
   * Vérifie si une clé existe dans Redis
   */
  async exists(key: string): Promise<boolean> {
    if (!this.client) return false;
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Récupère toutes les clés correspondant à un pattern
   */
  async keys(pattern: string): Promise<string[]> {
    if (!this.client) return [];
    return await this.client.keys(pattern);
  }

  /**
   * Ajoute un élément à un set Redis
   */
  async sAdd(key: string, value: string): Promise<void> {
    if (!this.client) return;
    await this.client.sAdd(key, value);
  }

  /**
   * Supprime un élément d'un set Redis
   */
  async sRem(key: string, value: string): Promise<void> {
    if (!this.client) return;
    await this.client.sRem(key, value);
  }

  /**
   * Récupère tous les membres d'un set Redis
   */
  async sMembers(key: string): Promise<string[]> {
    if (!this.client) return [];
    return await this.client.sMembers(key);
  }

  /**
   * Récupère plusieurs valeurs depuis Redis
   */
  async mGet<T>(keys: string[]): Promise<(T | null)[]> {
    if (!this.client || keys.length === 0) return [];
    const values = await this.client.mGet(keys);
    return values.map((value) => (value ? (JSON.parse(value) as T) : null));
  }

  /**
   * Stocke plusieurs valeurs dans Redis
   */
  async mSet(keyValuePairs: { key: string; value: any }[]): Promise<void> {
    if (!this.client || keyValuePairs.length === 0) return;
    const pairs: string[] = [];
    keyValuePairs.forEach(({ key, value }) => {
      pairs.push(key, JSON.stringify(value));
    });
    await this.client.mSet(pairs);
  }
}
