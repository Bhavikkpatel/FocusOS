import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function resetPassword() {
  const email = "perf-test@focusos.com";
  const newPassword = "FocusOS2026!";
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    console.log(`Successfully reset password for user: ${user.email}`);
    console.log(`New temporary password: ${newPassword}`);
  } catch (error) {
    console.error("Error resetting password:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
