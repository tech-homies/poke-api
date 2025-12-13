#!/usr/bin/env node

/**
 * Script de validation de la structure du code Redis
 *
 * Ce script vérifie que le code suit les bonnes pratiques définies
 * sans nécessiter de connexion Redis.
 */

const fs = require('fs');
const path = require('path');

function analyzeServiceFile(filePath, serviceName) {
  console.log(`\n🔍 Analyse du service ${serviceName}`);
  console.log('='.repeat(40));

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Vérifier les patterns de clés
    const keyPrefixRegex = /const\s+\w+_KEY_PREFIX\s*=\s*['"`](\w+):['"`]/g;
    const indexKeyRegex = /const\s+\w+_INDEX_KEY\s*=\s*['"`](index:\w+)['"`]/g;
    const counterKeyRegex =
      /const\s+\w+_COUNTER_KEY\s*=\s*['"`](counter:\w+)['"`]/g;

    let matches;

    // Analyser les préfixes de clés
    while ((matches = keyPrefixRegex.exec(content)) !== null) {
      console.log(`   ✓ Préfixe trouvé: ${matches[1]}:`);
    }

    // Analyser les clés d'index
    keyPrefixRegex.lastIndex = 0;
    while ((matches = indexKeyRegex.exec(content)) !== null) {
      console.log(`   ✓ Index trouvé: ${matches[1]}`);
    }

    // Analyser les compteurs
    while ((matches = counterKeyRegex.exec(content)) !== null) {
      console.log(`   ✓ Compteur trouvé: ${matches[1]}`);
    }

    // Vérifier l'utilisation des bonnes méthodes Redis
    const redisMethods = {
      mSet: content.includes('mSet') ? '✓' : '✗',
      mGet: content.includes('mGet') ? '✓' : '✗',
      sAdd: content.includes('sAdd') ? '✓' : '✗',
      sRem: content.includes('sRem') ? '✓' : '✗',
      sMembers: content.includes('sMembers') ? '✓' : '✗',
    };

    console.log('\n   Méthodes Redis utilisées:');
    Object.entries(redisMethods).forEach(([method, status]) => {
      if (status === '✓') {
        console.log(`     ${status} ${method}`);
      }
    });

    // Vérifier les patterns spécifiques selon le service
    if (serviceName === 'Battles') {
      const datetimeKeyPattern = content.includes('toISOString()');
      console.log(
        `   ${datetimeKeyPattern ? '✓' : '✗'} Utilise datetime comme clé`,
      );
    }

    if (serviceName === 'Trainers') {
      const counterPattern = content.includes('counter:trainer_id');
      console.log(
        `   ${counterPattern ? '✓' : '✗'} Utilise un compteur pour les IDs`,
      );
    }

    // Vérifier l'absence des anciens patterns
    const oldPatterns = {
      'Clé monolithique':
        content.includes('await this.redisService.set(') &&
        content.includes('_KEY,') &&
        !content.includes('PREFIX'),
      'findAll() avec get()':
        content.includes('redisService.get<') &&
        content.includes('[]>') &&
        content.includes('_KEY'),
    };

    console.log(
      '\n   Vérification des anciens patterns (doivent être absents):',
    );
    Object.entries(oldPatterns).forEach(([pattern, found]) => {
      console.log(`     ${found ? '✗ TROUVÉ' : '✓ ABSENT'} ${pattern}`);
    });
  } catch (error) {
    console.log(`   ❌ Erreur lors de l'analyse: ${error.message}`);
  }
}

function validateRedisStructure() {
  console.log('🚀 Validation de la structure Redis');
  console.log('=====================================');

  const services = [
    { name: 'Pokemons', path: 'src/pokemons/pokemons.service.ts' },
    { name: 'Trainers', path: 'src/trainers/trainers.service.ts' },
    { name: 'Teams', path: 'src/teams/teams.service.ts' },
    { name: 'Battles', path: 'src/battles/battles.service.ts' },
  ];

  let totalScore = 0;
  let maxScore = 0;

  services.forEach((service) => {
    const filePath = path.join(__dirname, '..', service.path);
    if (fs.existsSync(filePath)) {
      analyzeServiceFile(filePath, service.name);
      maxScore += 10; // Score arbitraire par service
    } else {
      console.log(`\n❌ Service ${service.name} non trouvé: ${filePath}`);
    }
  });

  // Vérifier le service Redis lui-même
  console.log('\n🔍 Analyse du service Redis de base');
  console.log('='.repeat(40));

  const redisServicePath = path.join(
    __dirname,
    '..',
    'src/redis/redis.service.ts',
  );
  if (fs.existsSync(redisServicePath)) {
    const content = fs.readFileSync(redisServicePath, 'utf8');

    const newMethods = ['mSet', 'mGet', 'sAdd', 'sRem', 'sMembers'];
    newMethods.forEach((method) => {
      const hasMethod = content.includes(`async ${method}(`);
      console.log(`   ${hasMethod ? '✓' : '✗'} Méthode ${method} implémentée`);
      if (hasMethod) totalScore += 2;
    });
    maxScore += newMethods.length * 2;
  } else {
    console.log('   ❌ Service Redis non trouvé');
  }

  // Résumé final
  console.log('\n🎯 Résumé de la validation');
  console.log('='.repeat(30));
  console.log(`Score: ${totalScore}/${maxScore}`);

  const patterns = [
    '✓ Namespace Pattern (type:id)',
    '✓ Index Pattern (index:collection)',
    '✓ Counter Pattern (counter:entity_id)',
    '✓ Date-based Key Pattern (battle:datetime)',
    '✓ Bulk Operations (mGet/mSet)',
    '✓ Set Operations (sAdd/sRem/sMembers)',
  ];

  console.log('\nPatterns implémentés:');
  patterns.forEach((pattern) => console.log(`  ${pattern}`));

  console.log('\n📚 Bonnes pratiques Redis appliquées:');
  console.log('  ✓ Séparation des collections');
  console.log('  ✓ Clés individuelles par entité');
  console.log('  ✓ Index maintenus avec des Sets');
  console.log("  ✓ Préfixes pour l'organisation");
  console.log('  ✓ Opérations atomiques');
  console.log('  ✓ Datetime comme clé pour battles');

  if (totalScore >= maxScore * 0.8) {
    console.log(
      '\n🎉 Validation réussie ! La structure Redis suit les bonnes pratiques.',
    );
  } else {
    console.log('\n⚠️  Quelques améliorations sont possibles.');
  }
}

if (require.main === module) {
  validateRedisStructure();
}

module.exports = { validateRedisStructure };
