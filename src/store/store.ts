/**
 * Contrat commun aux différentes implémentations de base de données
 * (en mémoire, fichier plat, ...). Reproduit volontairement une interface
 * façon Redis (asynchrone, mêmes noms de méthodes) afin que les services
 * métier puissent être branchés sur n'importe quelle implémentation sans
 * modification.
 */
export abstract class Store {
  abstract set(key: string, value: any): Promise<void>;

  abstract get<T>(key: string): Promise<T | null>;

  abstract del(key: string): Promise<void>;

  abstract exists(key: string): Promise<boolean>;

  abstract incr(key: string): Promise<number>;

  abstract sAdd(key: string, value: string): Promise<void>;

  abstract sRem(key: string, value: string): Promise<void>;

  abstract sMembers(key: string): Promise<string[]>;

  abstract mGet<T>(keys: string[]): Promise<(T | null)[]>;

  abstract mSet(keyValuePairs: { key: string; value: any }[]): Promise<void>;
}
