import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function showUser() {
  const email = "perf-test@focusos.com";
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    console.log(`Email: ${user.email}`);
    console.log(`Username: ${user.username}`);
    console.log(`ID: ${user.id}`);
  } else {
    console.log("User not found.");
  }
}

showUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
