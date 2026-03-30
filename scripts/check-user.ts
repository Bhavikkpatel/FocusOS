import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function checkUser() {
  const email = "perf-test@focusos.com";
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log("USER NOT FOUND: " + email);
    const count = await prisma.user.count();
    console.log("Total users in DB: " + count);
    const lastUsers = await prisma.user.findMany({ take: 5, select: { email: true } });
    console.log("Sample emails: " + JSON.stringify(lastUsers));
    return;
  }

  console.log("USER FOUND: " + user.email);
  console.log("User ID: " + user.id);
  console.log("Hashed Password (from DB): " + user.password);

  const testPass = "FocusOS2026!";
  const isMatch = await bcrypt.compare(testPass, user.password || "");
  console.log(`Password match with "${testPass}": ${isMatch}`);
}

checkUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
