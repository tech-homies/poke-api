#!/usr/bin/env node

/**
 * Script de migration Redis
 *
 * Ce script peut être utilisé pour migrer les données d'un format Redis
 * vers le nouveau format avec des clés individuelles.
 *
 * ATTENTION: Ce script considère que la base Redis actuelle est vide
 * comme spécifié dans la demande.
 */

const { createClient } = require('redis');

async function cleanRedisDatabase() {
  const redisUrl = process.env.REDIS_URL || process.env.STORAGE_REDIS_URL;

  if (!redisUrl) {
    console.log('❌ REDIS_URL ou STORAGE_REDIS_URL non défini');
    return;
  }

  const client = createClient({ url: redisUrl });

  try {
    await client.connect();
    console.log('✅ Connecté à Redis');

    // Nettoyer toutes les anciennes clés
    const oldKeys = ['pokemons', 'trainers', 'teams', 'battles'];
    for (const key of oldKeys) {
      const exists = await client.exists(key);
      if (exists) {
        await client.del(key);
        console.log(`🧹 Ancienne clé supprimée: ${key}`);
      }
    }

    // Nettoyer toutes les nouvelles clés par précaution
    const patterns = [
      'pokemon:*',
      'trainer:*',
      'team:*',
      'battle:*',
      'index:*',
      'counter:*',
    ];

    for (const pattern of patterns) {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
        console.log(
          `🧹 ${keys.length} clés supprimées avec le pattern: ${pattern}`,
        );
      }
    }

    console.log('✅ Base Redis nettoyée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    await client.quit();
  }
}

if (require.main === module) {
  cleanRedisDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { cleanRedisDatabase };
