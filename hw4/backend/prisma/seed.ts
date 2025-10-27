// Database seed script
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Create a demo user
    console.log('👤 Creating demo user...');
    
    const passwordHash = await bcrypt.hash('Demo1234', 12);
    
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@example.com' },
      update: {},
      create: {
        email: 'demo@example.com',
        passwordHash,
      },
    });

    console.log(`  ✓ Demo user created: ${demoUser.email}`);

    // Create default "Favorite" tag
    console.log('\n🏷️  Creating default tags...');
    
    const favoriteTag = await prisma.tag.upsert({
      where: {
        createdBy_name: {
          createdBy: demoUser.id,
          name: 'Favorite',
        },
      },
      update: {},
      create: {
        name: 'Favorite',
        description: 'Default favorite places',
        createdBy: demoUser.id,
      },
    });

    console.log(`  ✓ Favorite tag created`);

    // Create additional demo tags
    const tags = [
      { name: 'Food', description: 'Restaurants and cafes' },
      { name: 'Sights', description: 'Tourist attractions and landmarks' },
      { name: 'Shopping', description: 'Malls and stores' },
    ];

    for (const tagData of tags) {
      const tag = await prisma.tag.upsert({
        where: {
          createdBy_name: {
            createdBy: demoUser.id,
            name: tagData.name,
          },
        },
        update: {},
        create: {
          ...tagData,
          createdBy: demoUser.id,
        },
      });
      console.log(`  ✓ Tag created: ${tag.name}`);
    }

    // Create demo places
    console.log('\n📍 Creating demo places...');

    const places = [
      {
        id: 'ChIJJ5eIcCqpQjQROgRLBhQBw7U', // Google Place ID for Taipei 101
        title: 'Taipei 101',
        lat: 25.0330,
        lng: 121.5654,
        address: 'No. 7, Section 5, Xinyi Road, Xinyi District, Taipei City, Taiwan',
        notes: 'Iconic skyscraper with observation deck',
        tagNames: ['Sights', 'Favorite'],
      },
      {
        id: 'ChIJaXPV9ZSyjogRP2jKp2mopF4', // Example Google Place ID for Din Tai Fung
        title: 'Din Tai Fung (Xinyi)',
        lat: 25.0360,
        lng: 121.5645,
        address: 'Basement, No. 11, Lane 8, Section 5, Xinyi Road, Xinyi District',
        notes: 'Famous xiaolongbao restaurant',
        tagNames: ['Food', 'Favorite'],
      },
      {
        id: 'ChIJl8D1EepqpogRu4XN9F9l7o8', // Example Google Place ID for Palace Museum
        title: 'National Palace Museum',
        lat: 25.1023,
        lng: 121.5485,
        address: 'No. 221, Section 2, Zhishan Road, Shilin District, Taipei City',
        notes: 'Museum with Chinese imperial artifacts',
        tagNames: ['Sights'],
      },
    ];

    for (const placeData of places) {
      const { tagNames, ...placeInfo } = placeData;
      
      const place = await prisma.place.upsert({
        where: { id: placeInfo.id },
        update: {
          ...placeInfo,
          tags: {
            deleteMany: {},
            create: tagNames.map(tagName => ({
              tag: {
                connect: {
                  createdBy_name: {
                    createdBy: demoUser.id,
                    name: tagName,
                  },
                },
              },
            })),
          },
        },
        create: {
          ...placeInfo,
          createdBy: demoUser.id,
          tags: {
            create: tagNames.map(tagName => ({
              tag: {
                connect: {
                  createdBy_name: {
                    createdBy: demoUser.id,
                    name: tagName,
                  },
                },
              },
            })),
          },
        },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      console.log(`  ✓ Place created: ${place.title} (${place.tags.length} tags)`);
    }

    // Create demo events
    console.log('\n📅 Creating demo events...');

    const allPlaces = await prisma.place.findMany({
      where: { createdBy: demoUser.id },
    });

    const taipei101 = allPlaces.find(p => p.title === 'Taipei 101');
    const dintaifung = allPlaces.find(p => p.title.includes('Din Tai Fung'));

    const events = [
      {
        title: 'Lunch at Din Tai Fung',
        startTime: new Date('2025-02-01T12:00:00Z'),
        endTime: new Date('2025-02-01T13:30:00Z'),
        notes: 'Try the xiaolongbao',
        placeIds: dintaifung ? [dintaifung.id] : [],
      },
    ];

    for (const eventData of events) {
      const { placeIds, ...eventInfo } = eventData;
      
      const event = await prisma.event.create({
        data: {
          ...eventInfo,
          createdBy: demoUser.id,
          places: placeIds.length > 0 ? {
            create: placeIds.map(placeId => ({
              place: {
                connect: { id: placeId },
              },
            })),
          } : undefined,
        },
        include: {
          places: {
            include: {
              place: true,
            },
          },
        },
      });

      console.log(`  ✓ Event created: ${event.title} (${event.places.length} places)`);
    }

    // Summary
    console.log('\n📊 Database Summary:');
    const counts = {
      users: await prisma.user.count(),
      tags: await prisma.tag.count(),
      places: await prisma.place.count(),
      events: await prisma.event.count(),
    };

    console.log(`  Users: ${counts.users}`);
    console.log(`  Tags: ${counts.tags}`);
    console.log(`  Places: ${counts.places}`);
    console.log(`  Events: ${counts.events}`);

    console.log('\n✨ Seeding completed successfully!');
    console.log('\n📝 Demo credentials:');
    console.log('  Email: demo@example.com');
    console.log('  Password: Demo1234');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

