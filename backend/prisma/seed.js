import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log(' Seeding database...');

  // Créer un utilisateur de démo
  const passwordHash = await bcrypt.hash('Passw0rd!', 10);
  
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.org' },
    update: {},
    create: {
      email: 'alice@example.org',
      passwordHash,
    },
  });

  console.log(' User created:', alice.email);

  // Créer quelques favoris de démo
  const favorites = await Promise.all([
    prisma.favorite.upsert({
      where: {
        userId_tmdbId_type: {
          userId: alice.id,
          tmdbId: 550,
          type: 'movie'
        }
      },
      update: {},
      create: {
        userId: alice.id,
        tmdbId: 550,
        type: 'movie',
        rating: 5,
        comment: 'Bon film !'
      }
    }),
    prisma.favorite.upsert({
      where: {
        userId_tmdbId_type: {
          userId: alice.id,
          tmdbId: 1399,
          type: 'tv'
        }
      },
      update: {},
      create: {
        userId: alice.id,
        tmdbId: 1399,
        type: 'tv',
        rating: 5,
        comment: 'Super série !'
      }
    })
  ]);

  console.log(`${favorites.length} favorites created`);
  console.log('\n Seeding completed!');
  console.log('\n Demo user:');
  console.log('   Email: alice@example.org');
  console.log('   Password: Passw0rd!');
}

main()
  .catch((e) => {
    console.error(' Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
