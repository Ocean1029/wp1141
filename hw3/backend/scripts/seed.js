// Seed script to import CSV data into the database
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const db = require('../db');

/**
 * Parse CSV file and return array of objects
 * @param {string} filename - Name of the CSV file in seed-data directory
 * @returns {Array} Array of parsed records
 */
function parseCSV(filename) {
  const filePath = path.join(__dirname, '..', 'seed-data', filename);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  return parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
}

/**
 * Seed colors table from CSV
 */
async function seedColors() {
  console.log('🎨 Seeding colors...');
  
  const colors = parseCSV('colors.csv');
  
  for (const color of colors) {
    try {
      const result = await db.query(
        `INSERT INTO colors (hex_code, name, meaning)
         VALUES ($1, $2, $3)
         ON CONFLICT (hex_code) DO NOTHING
         RETURNING id`,
        [color.hex_code, color.name, color.meaning]
      );
      
      if (result.rows.length > 0) {
        console.log(`  ✓ Added color: ${color.name} (${color.hex_code})`);
      } else {
        console.log(`  ⊘ Color already exists: ${color.name}`);
      }
    } catch (error) {
      console.error(`  ✗ Error adding color ${color.name}:`, error.message);
    }
  }
  
  console.log(`✅ Colors seeded (${colors.length} records processed)\n`);
}

/**
 * Seed themes table from CSV
 */
async function seedThemes() {
  console.log('🏷️  Seeding themes...');
  
  const themes = parseCSV('themes.csv');
  
  for (const theme of themes) {
    try {
      // First, get the color_id from hex_code
      const colorResult = await db.query(
        'SELECT id FROM colors WHERE hex_code = $1',
        [theme.color_hex]
      );
      
      if (colorResult.rows.length === 0) {
        console.log(`  ⚠️  Color ${theme.color_hex} not found for theme ${theme.name}`);
        continue;
      }
      
      const colorId = colorResult.rows[0].id;
      
      // Insert theme
      const result = await db.query(
        `INSERT INTO themes (name, description, color_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (name) DO UPDATE
         SET description = EXCLUDED.description,
             color_id = EXCLUDED.color_id,
             updated_at = CURRENT_TIMESTAMP
         RETURNING id`,
        [theme.name, theme.description, colorId]
      );
      
      if (result.rows.length > 0) {
        console.log(`  ✓ Added/Updated theme: ${theme.name}`);
      }
    } catch (error) {
      console.error(`  ✗ Error adding theme ${theme.name}:`, error.message);
    }
  }
  
  console.log(`✅ Themes seeded (${themes.length} records processed)\n`);
}

/**
 * Seed diaries table from CSV
 */
async function seedDiaries() {
  console.log('📝 Seeding diaries...');
  
  const diaries = await parseCSV('diaries.csv');
  
  for (const diary of diaries) {
    try {
      const result = await db.query(
        `INSERT INTO diaries (title, content)
         VALUES ($1, $2)
         RETURNING id`,
        [diary.title, diary.content]
      );
      
      if (result.rows.length > 0) {
        console.log(`  ✓ Added diary: ${diary.title}`);
      }
    } catch (error) {
      console.error(`  ✗ Error adding diary ${diary.title}:`, error.message);
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
    // Count colors
    const colorsCount = await db.query('SELECT COUNT(*) as count FROM colors');
    console.log(`  Colors: ${colorsCount.rows[0].count}`);
    
    // Count themes
    const themesCount = await db.query('SELECT COUNT(*) as count FROM themes');
    console.log(`  Themes: ${themesCount.rows[0].count}`);
    
    // Count diaries
    const diariesCount = await db.query('SELECT COUNT(*) as count FROM diaries');
    console.log(`  Diaries: ${diariesCount.rows[0].count}`);
    
    // Count segments
    const segmentsCount = await db.query('SELECT COUNT(*) as count FROM segments');
    console.log(`  Segments: ${segmentsCount.rows[0].count}`);
    
    console.log('\n📋 Theme Overview:');
    const themeOverview = await db.query(`
      SELECT 
        t.name,
        c.hex_code,
        c.name as color_name
      FROM themes t
      LEFT JOIN colors c ON t.color_id = c.id
      ORDER BY t.name
    `);
    
    themeOverview.rows.forEach(row => {
      console.log(`  ${row.name.padEnd(20)} → ${row.color_name} (${row.hex_code})`);
    });
    
  } catch (error) {
    console.error('Error displaying summary:', error.message);
  }
}

/**
 * Main seed function
 */
async function main() {
  console.log('🌱 Starting database seeding...\n');
  
  try {
    // Test database connection
    await db.query('SELECT NOW()');
    console.log('✓ Database connection established\n');
    
    // Seed in order (colors first, then themes that reference colors, then diaries)
    await seedColors();
    await seedThemes();
    await seedDiaries();
    
    // Display summary
    await displaySummary();
    
    console.log('\n✨ Seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Close database connection
    await db.pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { seedColors, seedThemes, seedDiaries };

