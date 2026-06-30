import { Test, TestingModule } from '@nestjs/testing';
import { InMemoryStoreService } from './in-memory-store.service';

describe('InMemoryStoreService', () => {
  let store: InMemoryStoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InMemoryStoreService],
    }).compile();

    store = module.get<InMemoryStoreService>(InMemoryStoreService);
  });

  describe('set / get', () => {
    it('returns null for a key that was never set', async () => {
      await expect(store.get('missing')).resolves.toBeNull();
    });

    it('stores and retrieves a value', async () => {
      await store.set('key', { foo: 'bar' });

      await expect(store.get('key')).resolves.toEqual({ foo: 'bar' });
    });

    it('preserves native types such as Date across a round-trip', async () => {
      const datetime = new Date('2025-12-07T10:30:00.000Z');

      await store.set('battle', { datetime });
      const result = await store.get<{ datetime: Date }>('battle');

      // Pas de `toBeInstanceOf(Date)` ici : sous Jest, structuredClone()
      // produit une instance Date d'un "realm" différent de celle du test,
      // ce qui fait échouer `instanceof` même quand la valeur est correcte
      // (faux négatif connu de Jest, sans rapport avec le code applicatif).
      // On vérifie donc directement que l'API Date fonctionne, ce qu'un
      // JSON.stringify/parse (le bug d'origine) ne permettrait pas.
      expect(typeof result?.datetime.getTime).toBe('function');
      expect(result?.datetime.toISOString()).toBe(datetime.toISOString());
    });

    it('does not leak mutations made to the stored value after set()', async () => {
      const value = { count: 1 };
      await store.set('key', value);
      value.count = 999;

      await expect(store.get('key')).resolves.toEqual({ count: 1 });
    });

    it('does not leak mutations made to a previously read value', async () => {
      await store.set('key', { count: 1 });
      const first = await store.get<{ count: number }>('key');
      if (first) first.count = 999;

      await expect(store.get('key')).resolves.toEqual({ count: 1 });
    });
  });

  describe('del / exists', () => {
    it('reports a key as non-existent before it is set', async () => {
      await expect(store.exists('key')).resolves.toBe(false);
    });

    it('reports a key as existent once set, and not after deletion', async () => {
      await store.set('key', 'value');
      await expect(store.exists('key')).resolves.toBe(true);

      await store.del('key');
      await expect(store.exists('key')).resolves.toBe(false);
      await expect(store.get('key')).resolves.toBeNull();
    });

    it('also removes a set when deleting its key', async () => {
      await store.sAdd('group', 'member');
      await expect(store.exists('group')).resolves.toBe(true);

      await store.del('group');
      await expect(store.exists('group')).resolves.toBe(false);
    });
  });

  describe('incr', () => {
    it('starts at 1 and increments sequentially', async () => {
      await expect(store.incr('counter')).resolves.toBe(1);
      await expect(store.incr('counter')).resolves.toBe(2);
      await expect(store.incr('counter')).resolves.toBe(3);
    });

    it('does not collide when called concurrently (no lost updates)', async () => {
      const results = await Promise.all(
        Array.from({ length: 20 }, () => store.incr('concurrent-counter')),
      );

      expect(new Set(results).size).toBe(20);
      expect(Math.max(...results)).toBe(20);
    });
  });

  describe('sAdd / sRem / sMembers', () => {
    it('adds and lists members of a set', async () => {
      await store.sAdd('group', 'a');
      await store.sAdd('group', 'b');

      await expect(store.sMembers('group')).resolves.toEqual(
        expect.arrayContaining(['a', 'b']),
      );
    });

    it('does not duplicate an already-present member', async () => {
      await store.sAdd('group', 'a');
      await store.sAdd('group', 'a');

      await expect(store.sMembers('group')).resolves.toEqual(['a']);
    });

    it('removes a member from a set', async () => {
      await store.sAdd('group', 'a');
      await store.sAdd('group', 'b');
      await store.sRem('group', 'a');

      await expect(store.sMembers('group')).resolves.toEqual(['b']);
    });

    it('returns an empty array for a set that was never created', async () => {
      await expect(store.sMembers('missing')).resolves.toEqual([]);
    });
  });

  describe('mGet / mSet', () => {
    it('returns an empty array when given no keys', async () => {
      await expect(store.mGet([])).resolves.toEqual([]);
    });

    it('stores and retrieves several values at once', async () => {
      await store.mSet([
        { key: 'a', value: 1 },
        { key: 'b', value: 2 },
      ]);

      await expect(store.mGet(['a', 'b', 'missing'])).resolves.toEqual([
        1,
        2,
        null,
      ]);
    });
  });
});
