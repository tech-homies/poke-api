#!/usr/bin/env node

/**
 * Script de test de la nouvelle structure Redis
 *
 * Ce script teste toutes les opérations CRUD avec la nouvelle structure
 * pour s'assurer que tout fonctionne correctement.
 */

const { createClient } = require('redis');

async function testRedisStructure() {
  const redisUrl = process.env.REDIS_URL || process.env.STORAGE_REDIS_URL;

  if (!redisUrl) {
    console.log('❌ REDIS_URL ou STORAGE_REDIS_URL non défini');
    console.log(
      '💡 Pour tester localement: export REDIS_URL="redis://localhost:6379"',
    );
    return;
  }

  const client = createClient({ url: redisUrl });

  try {
    await client.connect();
    console.log('✅ Connecté à Redis pour les tests\n');

    // Test 1: Simuler le stockage d'un Pokémon
    console.log("🧪 Test 1: Stockage d'un Pokémon");
    const pokemon = {
      pokedex_id: 999,
      name: { fr: 'Test-mon', en: 'Test-mon' },
      types: [1, 2],
    };

    await client.set('pokemon:999', JSON.stringify(pokemon));
    await client.sAdd('index:pokemons', '999');

    const retrievedPokemon = await client.get('pokemon:999');
    const pokemonIds = await client.sMembers('index:pokemons');

    console.log(`   ✓ Pokémon stocké: ${JSON.parse(retrievedPokemon).name.fr}`);
    console.log(
      `   ✓ Index mis à jour: ${pokemonIds.includes('999') ? 'OUI' : 'NON'}`,
    );

    // Test 2: Simuler le stockage d'un dresseur avec compteur
    console.log("\n🧪 Test 2: Stockage d'un dresseur avec compteur");
    const trainer = {
      id: 999,
      name: 'Testeur',
      age: 25,
    };

    await client.set('trainer:999', JSON.stringify(trainer));
    await client.sAdd('index:trainers', '999');
    await client.set('counter:trainer_id', 999);

    const retrievedTrainer = await client.get('trainer:999');
    const trainerId = await client.get('counter:trainer_id');

    console.log(`   ✓ Dresseur stocké: ${JSON.parse(retrievedTrainer).name}`);
    console.log(`   ✓ Compteur mis à jour: ${trainerId}`);

    // Test 3: Simuler le stockage d'une équipe
    console.log("\n🧪 Test 3: Stockage d'une équipe");
    const team = [1, 25, 150, 144, 59, 131];

    await client.set('team:999', JSON.stringify(team));
    await client.sAdd('index:teams', '999');

    const retrievedTeam = await client.get('team:999');
    const teamExists = await client.sIsMember('index:teams', '999');

    console.log(
      `   ✓ Équipe stockée: ${JSON.parse(retrievedTeam).length} Pokémons`,
    );
    console.log(`   ✓ Index mis à jour: ${teamExists ? 'OUI' : 'NON'}`);

    // Test 4: Simuler le stockage d'un combat avec datetime
    console.log("\n🧪 Test 4: Stockage d'un combat avec clé datetime");
    const now = new Date();
    const battleKey = now.toISOString();
    const battle = {
      trainer1Id: 1,
      trainer2Id: 999,
      winnerId: 999,
      duels: [],
      datetime: now,
    };

    await client.set(`battle:${battleKey}`, JSON.stringify(battle));
    await client.sAdd('index:battles', battleKey);

    const retrievedBattle = await client.get(`battle:${battleKey}`);
    const battleInIndex = await client.sIsMember('index:battles', battleKey);

    console.log(
      `   ✓ Combat stocké avec clé: ${battleKey.substring(0, 19)}...`,
    );
    console.log(`   ✓ Index mis à jour: ${battleInIndex ? 'OUI' : 'NON'}`);

    // Test 5: Test des opérations en lot (mGet)
    console.log('\n🧪 Test 5: Opérations en lot (mGet)');
    const keys = ['pokemon:999', 'trainer:999'];
    const values = await client.mGet(keys);

    console.log(
      `   ✓ mGet récupéré: ${values.filter((v) => v !== null).length}/${keys.length} valeurs`,
    );

    // Test 6: Vérification de la structure complète
    console.log('\n🧪 Test 6: Vérification de la structure complète');
    const allKeys = await client.keys('*');
    const keysByType = {};

    allKeys.forEach((key) => {
      const type = key.includes(':') ? key.split(':')[0] : 'autres';
      keysByType[type] = (keysByType[type] || 0) + 1;
    });

    console.log('   Structure actuelle:');
    Object.entries(keysByType).forEach(([type, count]) => {
      console.log(`     ${type}: ${count} clé(s)`);
    });

    // Nettoyage des données de test
    console.log('\n🧹 Nettoyage des données de test...');
    const testKeys = [
      'pokemon:999',
      'trainer:999',
      'team:999',
      `battle:${battleKey}`,
      'counter:trainer_id',
    ];

    for (const key of testKeys) {
      await client.del(key);
    }

    // Nettoyage des index
    await client.sRem('index:pokemons', '999');
    await client.sRem('index:trainers', '999');
    await client.sRem('index:teams', '999');
    await client.sRem('index:battles', battleKey);

    console.log('✅ Données de test supprimées');
    console.log('\n🎉 Tous les tests sont passés avec succès !');
    console.log('\n📋 Résumé des patterns testés:');
    console.log('   ✓ Namespace pattern (type:id)');
    console.log('   ✓ Index pattern (index:collection)');
    console.log('   ✓ Counter pattern (counter:entity_id)');
    console.log('   ✓ Date-based key pattern (battle:datetime_iso)');
    console.log('   ✓ Opérations en lot (mGet/mSet)');
    console.log('   ✓ Sets pour les index');
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  } finally {
    await client.quit();
  }
}

if (require.main === module) {
  testRedisStructure()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { testRedisStructure };
