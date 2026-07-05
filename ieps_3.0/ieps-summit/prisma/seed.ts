import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { resolve } from "path";

const envCandidates = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "..", "..", ".env"),
];

for (const envPath of envCandidates) {
  dotenv.config({ path: envPath });
}

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "tijaniremilekun9@gmail.com";
  const password = process.env.ADMIN_PASSWORD ?? "changeme_before_deploy";

  if (password === "changeme_before_deploy") {
    console.warn(
      "⚠️  Seeding admin with the default password. Set ADMIN_PASSWORD in .env before deploying."
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      // Re-hash so re-running the seed always reflects the current ADMIN_PASSWORD.
      password: hashedPassword,
      name: "IEPS Administrator",
      role: Role.SUPER_ADMIN,
    },
    create: {
      email,
      password: hashedPassword,
      name: "IEPS Administrator",
      role: Role.SUPER_ADMIN,
    },
  });

  console.log(`✅ Seeded admin user: ${admin.email} (role: ${admin.role})`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
