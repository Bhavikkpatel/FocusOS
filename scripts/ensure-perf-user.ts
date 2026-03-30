import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function ensureUser() {
  const email = "perf-test@focusos.com";
  const newPassword = "FocusOS2026!";
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { password: hashedPassword },
      create: {
        email,
        password: hashedPassword,
        name: "Performance Test User",
        username: "perf-user",
      },
    });

    console.log(`Successfully ensured user: ${user.email}`);
    console.log(`User ID: ${user.id}`);
    console.log(`Current Password: ${newPassword}`);
    console.log(`Username (if needed): ${user.username}`);
  } catch (error) {
    console.error("Error creating/updating user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

ensureUser();
