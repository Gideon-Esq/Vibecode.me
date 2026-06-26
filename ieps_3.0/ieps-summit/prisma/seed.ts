import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

// Load variables from .env when run via `tsx prisma/seed.ts` (Node >= 20.12).
// `prisma db seed` loads .env itself, so guard against double-loading.
try {
  (process as NodeJS.Process & { loadEnvFile?: (path?: string) => void }).loadEnvFile?.();
} catch {
  // .env not found — fall back to whatever is already in process.env.
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
