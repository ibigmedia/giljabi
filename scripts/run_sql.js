const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Reading SQL script...');
    const sqlScript = fs.readFileSync('/tmp/create_notification_triggers.sql', 'utf8');
    
    console.log('Executing SQL to add triggers and RLS policies...');
    await prisma.$executeRawUnsafe(sqlScript);
    
    console.log('Successfully deployed Notification triggers and RLS policies.');
  } catch (error) {
    console.error('Error executing SQL script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
