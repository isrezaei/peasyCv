import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/common/security/hashing';
import { createDefaultResumeData } from '../src/resumes/resume-default.factory';
import { writeResumeData } from '../src/resumes/resume-writer';

/**
 * Optional seed: creates a demo account with one sample resume so the app is
 * usable immediately. Idempotent — safe to re-run.
 *
 *   npm run prisma:seed --workspace @resume/backend
 *
 *   Login: demo@example.com / Demo1234
 */
const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = 'demo@example.com';
  const passwordHash = await hashPassword('Demo1234');

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: 'کاربر نمونه' },
  });

  const existing = await prisma.resume.count({ where: { userId: user.id } });
  if (existing === 0) {
    const data = createDefaultResumeData({ title: 'رزومه نمونه' });
    await prisma.$transaction((tx) => writeResumeData(tx, user.id, data.id, data, 'create'));
    // eslint-disable-next-line no-console
    console.log(`Seeded resume "${data.title}" (${data.id})`);
  }

  // eslint-disable-next-line no-console
  console.log('Seed complete. Login with demo@example.com / Demo1234');
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
