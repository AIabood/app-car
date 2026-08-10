import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const cameras = [
    {
      name: 'Camera - Downtown',
      latitude: 31.9539,
      longitude: 35.9106,
      cameraType: 'fixed',
      speedLimit: 60,
    },
    {
      name: 'Camera - Highway',
      latitude: 31.96,
      longitude: 35.92,
      cameraType: 'fixed',
      speedLimit: 80,
    },
  ];

  for (const camera of cameras) {
    await prisma.speedCamera.create({ data: camera });
  }

  console.log('Seed completed: sample speed cameras added.');
}

main()
  .catch((error) => {
    console.error(error);
    // Avoid direct use of the Node 'process' global so TypeScript won't require
    // @types/node. Use globalThis with a safe any-cast.
    (globalThis as any).process?.exit?.(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
