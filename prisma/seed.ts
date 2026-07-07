import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

const seedUsers = [
  {
    username: "admin",
    email: "admin@example.com",
    password: "Admin123!",
    role: "admin",
  },
  {
    username: "johndoe",
    email: "user@example.com",
    password: "User123!",
    role: "user",
  },
] as const;

async function main() {
  console.log("Seeding database...\n");

  for (const { username, email, password, role } of seedUsers) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        username,
        passwordHash,
        role,
      },
      create: {
        username,
        email,
        passwordHash,
        role,
      },
    });

    console.log(`  ✓ ${role.padEnd(5)} ${user.email} (${user.username})`);
  }

  console.log("\nSeed completed.");
  console.log("\nTest credentials:");
  console.log("  admin@example.com / Admin123!");
  console.log("  user@example.com  / User123!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
