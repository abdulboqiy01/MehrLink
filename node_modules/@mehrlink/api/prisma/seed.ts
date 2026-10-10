import { PrismaClient, Role, UrgencyLevel, DonationStatus, AssistanceRequestStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with demo data (Uzbek language)...');

  // Create Users
  const admin = await prisma.user.upsert({
    where: { phone: '+998901112233' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'Tizim',
      phone: '+998901112233',
      password: 'hashed_password_placeholder',
      role: Role.ADMIN,
    },
  });

  const volunteer = await prisma.user.upsert({
    where: { phone: '+998902223344' },
    update: {},
    create: {
      firstName: 'Aziz',
      lastName: 'Karimov',
      phone: '+998902223344',
      password: 'hashed_password_placeholder',
      role: Role.VOLUNTEER,
    },
  });

  const normalUser = await prisma.user.upsert({
    where: { phone: '+998903334455' },
    update: {},
    create: {
      firstName: 'Dilnoza',
      lastName: 'Rustamova',
      phone: '+998903334455',
      password: 'hashed_password_placeholder',
      role: Role.USER,
    },
  });

  // Create Donation
  const donation = await prisma.donation.create({
    data: {
      title: 'Qishki kiyimlar',
      description: 'Bolalar uchun qalin kurtka va poyabzallar',
      category: 'Kiyim',
      quantity: 5,
      status: DonationStatus.PENDING,
      donorId: normalUser.id,
    },
  });

  // Create Assistance Request
  const request = await prisma.assistanceRequest.create({
    data: {
      title: 'Tibbiy yordam kerak',
      description: 'Nogironlar aravachasiga ehtiyoj bor',
      urgency: UrgencyLevel.HIGH,
      location: 'Toshkent shahar, Yunusobod tumani',
      status: AssistanceRequestStatus.APPROVED,
      requesterId: normalUser.id,
    },
  });

  // Create Volunteer Task
  const task = await prisma.volunteerTask.create({
    data: {
      volunteerId: volunteer.id,
      assistanceRequestId: request.id,
      description: 'Nogironlar aravachasini etkazib berish',
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
