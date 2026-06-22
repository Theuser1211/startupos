import { config } from 'dotenv';
config();

import { prisma } from './src/db/client.ts';

async function main() {
  const jobs = await prisma.job.findMany({
    where: { startupId: 'c7317bc0-0fbe-4072-b5a0-75fc0a0646f9' }
  });
  const blueprints = await prisma.blueprint.findMany({
    where: { startupId: 'c7317bc0-0fbe-4072-b5a0-75fc0a0646f9' }
  });
  console.log('Jobs:', jobs);
  console.log('Blueprints:', blueprints);
}

main().catch(console.error);