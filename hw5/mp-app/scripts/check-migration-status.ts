import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMigrationStatus() {
  try {
    console.log('Checking database connection...');
    
    // Test database connection
    await prisma.$connect();
    console.log('✓ Database connection successful');
    
    // Check if _prisma_migrations table exists
    const migrationsTableExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_prisma_migrations'
      );
    `;
    
    if (!migrationsTableExists[0]?.exists) {
      console.log('✗ _prisma_migrations table does not exist');
      console.log('This means no migrations have been executed yet.');
      return;
    }
    
    console.log('✓ _prisma_migrations table exists');
    
    // Get migration status
    const migrations = await prisma.$queryRaw<Array<{
      migration_name: string;
      finished_at: Date | null;
      applied_steps_count: number;
    }>>`
      SELECT migration_name, finished_at, applied_steps_count
      FROM _prisma_migrations
      ORDER BY started_at DESC;
    `;
    
    console.log('\nMigration Status:');
    console.log('================');
    migrations.forEach((migration, index) => {
      console.log(`${index + 1}. ${migration.migration_name}`);
      console.log(`   Finished: ${migration.finished_at ? 'Yes' : 'No'}`);
      console.log(`   Steps Applied: ${migration.applied_steps_count}`);
    });
    
    // Check if tables exist
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    console.log('\nTables in database:');
    console.log('==================');
    if (tables.length === 0) {
      console.log('✗ No tables found in database');
    } else {
      tables.forEach((table) => {
        console.log(`✓ ${table.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking migration status:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkMigrationStatus();

