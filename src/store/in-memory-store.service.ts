import { Injectable } from '@nestjs/common';

/**
 * Base de données en mémoire (remplace Redis).
 *
 * Les données sont conservées dans des `Map` propres à l'instance : elles sont
 * donc automatiquement réinitialisées à chaque démarrage de l'application
 * (`npm start`). Les données initiales sont rechargées par les `onModuleInit`
 * de chaque service.
 *
 * L'interface (asynchrone, mêmes noms de méthodes) reproduit volontairement
 * celle de l'ancien service Redis afin de rester un remplacement transparent.
 */
@Injectable()
export class InMemoryStoreService {
  /** Stockage clé → valeur, sérialisée en JSON (comme le faisait Redis). */
  private readonly store = new Map<string, string>();

  /** Stockage des ensembles (équivalent des Sets Redis, ex. `index:*`). */
  private readonly sets = new Map<string, Set<string>>();

  /**
   * Stocke une valeur.
   */
  set(key: string, value: any): Promise<void> {
    this.store.set(key, JSON.stringify(value));
    return Promise.resolve();
  }

  /**
   * Récupère une valeur.
   */
  get<T>(key: string): Promise<T | null> {
    const value = this.store.get(key);
    return Promise.resolve(
      value !== undefined ? (JSON.parse(value) as T) : null,
    );
  }

  /**
   * Supprime une clé (valeur ou ensemble).
   */
  del(key: string): Promise<void> {
    this.store.delete(key);
    this.sets.delete(key);
    return Promise.resolve();
  }

  /**
   * Vérifie si une clé existe (valeur ou ensemble).
   */
  exists(key: string): Promise<boolean> {
    return Promise.resolve(this.store.has(key) || this.sets.has(key));
  }

  /**
   * Récupère toutes les clés correspondant à un pattern de type glob (`*`).
   */
  keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(
      '^' +
        pattern
          .split('*')
          .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
          .join('.*') +
        '$',
    );
    const allKeys = [...this.store.keys(), ...this.sets.keys()];
    return Promise.resolve(allKeys.filter((key) => regex.test(key)));
  }

  /**
   * Ajoute un élément à un ensemble.
   */
  sAdd(key: string, value: string): Promise<void> {
    const set = this.sets.get(key) ?? new Set<string>();
    set.add(value);
    this.sets.set(key, set);
    return Promise.resolve();
  }

  /**
   * Supprime un élément d'un ensemble.
   */
  sRem(key: string, value: string): Promise<void> {
    this.sets.get(key)?.delete(value);
    return Promise.resolve();
  }

  /**
   * Récupère tous les membres d'un ensemble.
   */
  sMembers(key: string): Promise<string[]> {
    return Promise.resolve([...(this.sets.get(key) ?? [])]);
  }

  /**
   * Récupère plusieurs valeurs.
   */
  mGet<T>(keys: string[]): Promise<(T | null)[]> {
    if (keys.length === 0) return Promise.resolve([]);
    const values = keys.map((key) => {
      const value = this.store.get(key);
      return value !== undefined ? (JSON.parse(value) as T) : null;
    });
    return Promise.resolve(values);
  }

  /**
   * Stocke plusieurs valeurs.
   */
  mSet(keyValuePairs: { key: string; value: any }[]): Promise<void> {
    for (const { key, value } of keyValuePairs) {
      this.store.set(key, JSON.stringify(value));
    }
    return Promise.resolve();
  }
}
