#!/usr/bin/env node

/**
 * Script de vérification de la structure Redis
 *
 * Ce script affiche la structure actuelle de Redis pour vérifier
 * que les bonnes pratiques sont bien appliquées.
 */

const { createClient } = require('redis');

async function inspectRedisStructure() {
  const redisUrl = process.env.REDIS_URL || process.env.STORAGE_REDIS_URL;

  if (!redisUrl) {
    console.log('❌ REDIS_URL ou STORAGE_REDIS_URL non défini');
    return;
  }

  const client = createClient({ url: redisUrl });

  try {
    await client.connect();
    console.log('✅ Connecté à Redis');
    console.log('\n📊 Structure actuelle de Redis:');
    console.log('=====================================');

    // Vérifier les index
    const indexes = await client.keys('index:*');
    console.log(`\n🗂️  Index (${indexes.length}):`);
    for (const index of indexes) {
      const members = await client.sMembers(index);
      console.log(`   ${index}: ${members.length} éléments`);
      if (members.length < 10) {
        console.log(`     └─ [${members.join(', ')}]`);
      } else {
        console.log(
          `     └─ [${members.slice(0, 5).join(', ')}, ...${members.length - 5} autres]`,
        );
      }
    }

    // Vérifier les compteurs
    const counters = await client.keys('counter:*');
    console.log(`\n🔢 Compteurs (${counters.length}):`);
    for (const counter of counters) {
      const value = await client.get(counter);
      console.log(`   ${counter}: ${value}`);
    }

    // Vérifier les entités par collection
    const collections = ['pokemon:', 'trainer:', 'team:', 'battle:'];

    for (const prefix of collections) {
      const keys = await client.keys(`${prefix}*`);
      console.log(`\n📦 Collection ${prefix}* (${keys.length} éléments):`);

      if (keys.length > 0) {
        // Afficher quelques exemples
        const sampleKeys = keys.slice(0, 3);
        for (const key of sampleKeys) {
          console.log(`   └─ ${key}`);
        }
        if (keys.length > 3) {
          console.log(`   └─ ...et ${keys.length - 3} autres`);
        }
      }
    }

    // Statistiques générales
    const allKeys = await client.keys('*');
    console.log(`\n📈 Statistiques générales:`);
    console.log(`   Total des clés: ${allKeys.length}`);

    // Grouper par préfixe
    const keysByPrefix = {};
    allKeys.forEach((key) => {
      const prefix = key.includes(':') ? key.split(':')[0] + ':' : 'autres';
      keysByPrefix[prefix] = (keysByPrefix[prefix] || 0) + 1;
    });

    console.log('\n   Répartition par préfixe:');
    Object.entries(keysByPrefix)
      .sort(([, a], [, b]) => b - a)
      .forEach(([prefix, count]) => {
        console.log(`     ${prefix.padEnd(15)} ${count} clé(s)`);
      });
  } catch (error) {
    console.error("❌ Erreur lors de l'inspection:", error);
  } finally {
    await client.quit();
  }
}

if (require.main === module) {
  inspectRedisStructure()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { inspectRedisStructure };
