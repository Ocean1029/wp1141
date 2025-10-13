// Database seed script - TypeScript version with Prisma
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'csv-parse/sync';
import prisma from '../config/prisma';

/**
 * Parse CSV file and return array of objects
 */
function parseCSV<T = any>(filename: string): T[] {
  const filePath = join(process.cwd(), 'seed-data', filename);
  const fileContent = readFileSync(filePath, 'utf-8');

  return parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
}

/**
 * Seed colors table
 */
async function seedColors() {
  console.log('🎨 Seeding colors...');

  const colors = parseCSV<{
    id: string;
    hex_code: string;
    name: string;
    meaning: string;
  }>('colors.csv');

  for (const color of colors) {
    try {
      await prisma.color.upsert({
        where: { id: parseInt(color.id) },
        update: {
          hexCode: color.hex_code,
          name: color.name,
          meaning: color.meaning || null,
        },
        create: {
          id: parseInt(color.id),
          hexCode: color.hex_code,
          name: color.name,
          meaning: color.meaning || null,
        },
      });

      console.log(`  ✓ Added/Updated color #${color.id}: ${color.name} (${color.hex_code})`);
    } catch (error) {
      console.error(`  ✗ Error adding color ${color.name}:`, error);
    }
  }

  console.log(`✅ Colors seeded (${colors.length} records processed)\n`);
}

/**
 * Seed themes table
 */
async function seedThemes() {
  console.log('🏷️  Seeding themes...');

  const themes = parseCSV<{
    name: string;
    description: string;
    color_id: string;
  }>('themes.csv');

  for (const theme of themes) {
    try {
      await prisma.theme.upsert({
        where: { name: theme.name },
        update: {
          description: theme.description || null,
          colorId: parseInt(theme.color_id),
        },
        create: {
          name: theme.name,
          description: theme.description || null,
          colorId: parseInt(theme.color_id),
        },
      });

      console.log(`  ✓ Added/Updated theme: ${theme.name} (color #${theme.color_id})`);
    } catch (error) {
      console.error(`  ✗ Error adding theme ${theme.name}:`, error);
    }
  }

  console.log(`✅ Themes seeded (${themes.length} records processed)\n`);
}

/**
 * Seed diaries table
 */
async function seedDiaries() {
  console.log('📝 Seeding diaries...');

  const diaries = parseCSV<{
    title: string;
    content: string;
  }>('diaries.csv');

  for (const diary of diaries) {
    try {
      await prisma.diary.create({
        data: {
          title: diary.title || null,
          content: diary.content,
        },
      });

      console.log(`  ✓ Added diary: ${diary.title}`);
    } catch (error) {
      console.error(`  ✗ Error adding diary ${diary.title}:`, error);
    }
  }

  console.log(`✅ Diaries seeded (${diaries.length} records processed)\n`);
}

/**
 * Display summary statistics
 */
async function displaySummary() {
  console.log('📊 Database Summary:');

  try {
    const colorsCount = await prisma.color.count();
    console.log(`  Colors: ${colorsCount}`);

    const themesCount = await prisma.theme.count();
    console.log(`  Themes: ${themesCount}`);

    const diariesCount = await prisma.diary.count();
    console.log(`  Diaries: ${diariesCount}`);

    const segmentsCount = await prisma.segment.count();
    console.log(`  Segments: ${segmentsCount}`);

    console.log('\n📋 Theme Overview:');
    const themes = await prisma.theme.findMany({
      include: { color: true },
      orderBy: { name: 'asc' },
    });

    themes.forEach((theme) => {
      const colorName = theme.color?.name || 'N/A';
      const colorHex = theme.color?.hexCode || 'N/A';
      console.log(`  ${theme.name.padEnd(20)} → ${colorName} (${colorHex})`);
    });
  } catch (error) {
    console.error('Error displaying summary:', error);
  }
}

/**
 * Main seed function
 */
async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✓ Database connection established\n');

    // Seed in order (colors first, then themes that reference colors, then diaries)
    await seedColors();
    await seedThemes();
    await seedDiaries();

    // Display summary
    await displaySummary();

    console.log('\n✨ Seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
main();

