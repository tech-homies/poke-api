import { Module, Global } from '@nestjs/common';
import { Store } from './store';
import { InMemoryStoreService } from './in-memory-store.service';
import { FileStoreService } from './file-store.service';

/**
 * Sélectionne l'implémentation de `Store` en fonction de `STORE_DRIVER` :
 * - `file` : persistance dans un fichier plat (utilisé par `npm start` /
 *   `start:prod`, voir les scripts du `package.json`) ;
 * - toute autre valeur (par défaut) : données en mémoire, réinitialisées à
 *   chaque redémarrage — c'est le mode utilisé par `start:dev`/`start:debug`.
 */
const storeImplementation =
  process.env.STORE_DRIVER === 'file' ? FileStoreService : InMemoryStoreService;

@Global()
@Module({
  providers: [{ provide: Store, useClass: storeImplementation }],
  exports: [Store],
})
export class StoreModule {}
