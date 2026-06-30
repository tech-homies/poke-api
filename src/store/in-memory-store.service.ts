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
  /**
   * Stockage clé → valeur. Les valeurs sont clonées via `structuredClone` à
   * l'écriture et à la lecture (copie défensive) : cela isole le store des
   * mutations externes tout en préservant les types natifs (ex. `Date`),
   * contrairement à un passage par `JSON.stringify`/`JSON.parse`.
   */
  private readonly store = new Map<string, unknown>();

  /** Stockage des ensembles (équivalent des Sets Redis, ex. `index:*`). */
  private readonly sets = new Map<string, Set<string>>();

  /**
   * Stocke une valeur.
   */
  set(key: string, value: any): Promise<void> {
    this.store.set(key, structuredClone(value));
    return Promise.resolve();
  }

  /**
   * Récupère une valeur.
   */
  get<T>(key: string): Promise<T | null> {
    const value = this.store.get(key);
    return Promise.resolve(
      value !== undefined ? structuredClone(value as T) : null,
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
   * Incrémente un compteur numérique de façon atomique et retourne sa
   * nouvelle valeur (équivalent du `INCR` Redis). Le corps de la méthode est
   * entièrement synchrone : il n'y a donc aucun point de suspension entre la
   * lecture et l'écriture, ce qui garantit l'absence de race condition même
   * en cas d'appels concurrents.
   */
  incr(key: string): Promise<number> {
    const current = (this.store.get(key) as number | undefined) ?? 0;
    const next = current + 1;
    this.store.set(key, next);
    return Promise.resolve(next);
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
      return value !== undefined ? structuredClone(value as T) : null;
    });
    return Promise.resolve(values);
  }

  /**
   * Stocke plusieurs valeurs.
   */
  mSet(keyValuePairs: { key: string; value: any }[]): Promise<void> {
    for (const { key, value } of keyValuePairs) {
      this.store.set(key, structuredClone(value));
    }
    return Promise.resolve();
  }
}
