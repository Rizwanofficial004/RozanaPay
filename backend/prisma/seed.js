import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create Super Admin
  const superAdminPassword = await bcrypt.hash('admin123', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@saas.com' },
    update: {},
    create: {
      email: 'admin@saas.com',
      password: superAdminPassword,
      name: 'Super Admin',
      role: 'super_admin',
    },
  });
  console.log('✅ Super Admin created:', superAdmin.email);

  // Create Demo Business
  const business = await prisma.business.upsert({
    where: { email: 'demo@business.com' },
    update: {},
    create: {
      name: 'Demo Business Ltd',
      email: 'demo@business.com',
      phone: '+1234567890',
      address: '123 Business Street, City',
      isActive: true,
    },
  });
  console.log('✅ Demo Business created:', business.name);

  // Create Business Owner
  const ownerPassword = await bcrypt.hash('owner123', 10);
  const businessOwner = await prisma.user.upsert({
    where: { email: 'owner@business.com' },
    update: {},
    create: {
      email: 'owner@business.com',
      password: ownerPassword,
      name: 'Business Owner',
      role: 'business_owner',
      businessId: business.id,
    },
  });
  console.log('✅ Business Owner created:', businessOwner.email);

  // Create Coin Rule for Business
  const coinRule = await prisma.coinRule.upsert({
    where: { businessId: business.id },
    update: {},
    create: {
      businessId: business.id,
      recoveryAmountPerCoin: 100,
      minClaimCoins: 10,
      coinValueDescription: 'Every 100 units of payment earns 1 coin. Minimum 10 coins to claim.',
    },
  });
  console.log('✅ Coin Rule created for business');

  // Create Demo Clients
  const clientPassword = await bcrypt.hash('client123', 10);
  
  const client1 = await prisma.client.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567891',
      address: '456 Client Ave',
      businessId: business.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'john@example.com',
      password: clientPassword,
      name: 'John Doe',
      role: 'client',
      businessId: business.id,
      clientId: client1.id,
    },
  });

  await prisma.coinWallet.create({
    data: {
      clientId: client1.id,
      balance: 15,
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1234567892',
      address: '789 Customer Rd',
      businessId: business.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'jane@example.com',
      password: clientPassword,
      name: 'Jane Smith',
      role: 'client',
      businessId: business.id,
      clientId: client2.id,
    },
  });

  await prisma.coinWallet.create({
    data: {
      clientId: client2.id,
      balance: 25,
    },
  });

  console.log('✅ Demo Clients created');

  // Create some transactions
  await prisma.recoveryTransaction.createMany({
    data: [
      {
        amount: 500,
        status: 'paid',
        paymentMethod: 'manual',
        paidDate: new Date(),
        businessId: business.id,
        clientId: client1.id,
      },
      {
        amount: 1000,
        status: 'paid',
        paymentMethod: 'manual',
        paidDate: new Date(Date.now() - 86400000), // Yesterday
        businessId: business.id,
        clientId: client1.id,
      },
      {
        amount: 750,
        status: 'pending',
        dueDate: new Date(Date.now() + 86400000 * 7), // Next week
        businessId: business.id,
        clientId: client1.id,
      },
      {
        amount: 1500,
        status: 'paid',
        paymentMethod: 'manual',
        paidDate: new Date(),
        businessId: business.id,
        clientId: client2.id,
      },
      {
        amount: 500,
        status: 'pending',
        dueDate: new Date(Date.now() + 86400000 * 3),
        businessId: business.id,
        clientId: client2.id,
      },
    ],
  });

  console.log('✅ Demo Transactions created');

  // Create coin transactions
  await prisma.coinTransaction.createMany({
    data: [
      {
        amount: 5,
        type: 'earned',
        description: 'Earned 5 coins for payment of 500',
        clientId: client1.id,
      },
      {
        amount: 10,
        type: 'earned',
        description: 'Earned 10 coins for payment of 1000',
        clientId: client1.id,
      },
      {
        amount: 15,
        type: 'earned',
        description: 'Earned 15 coins for payment of 1500',
        clientId: client2.id,
      },
      {
        amount: 10,
        type: 'earned',
        description: 'Earned 10 coins for payment of 1000',
        clientId: client2.id,
      },
    ],
  });

  console.log('✅ Coin Transactions created');

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('📝 Demo Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Super Admin:');
  console.log('  Email: admin@saas.com');
  console.log('  Password: admin123');
  console.log('\nBusiness Owner:');
  console.log('  Email: owner@business.com');
  console.log('  Password: owner123');
  console.log('\nClient:');
  console.log('  Email: john@example.com');
  console.log('  Password: client123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
