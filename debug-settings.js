const { PrismaClient } = require('@prisma/client');

async function debugSettings() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Environment check:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL (masked):', process.env.DATABASE_URL?.replace(/:[^:]*@/, ':***@'));
    
    console.log('\n🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    console.log('\n🔍 Querying settings...');
    const settings = await prisma.settings.findFirst();
    
    if (settings) {
      console.log('✅ Settings found:');
      console.log('ID:', settings.id);
      console.log('Site Name:', settings.siteName);
      console.log('Description:', settings.description);
      console.log('Subscription Price:', settings.subscriptionPrice);
      console.log('Currency:', settings.currency);
      console.log('Payment Provider:', settings.paymentProvider);
    } else {
      console.log('❌ No settings found in database');
    }
    
    console.log('\n🔍 Listing all settings...');
    const allSettings = await prisma.settings.findMany();
    console.log('Total settings records:', allSettings.length);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('❌ Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

debugSettings(); 