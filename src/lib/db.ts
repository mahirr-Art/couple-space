import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  var prisma: PrismaClient | undefined;
  var pgPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

let prismaInstance: PrismaClient;

if (process.env.NODE_ENV === "production") {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prismaInstance = new PrismaClient({ adapter });
} else {
  if (!globalThis.prisma) {
    const pool = new Pool({ connectionString });
    globalThis.pgPool = pool;
    const adapter = new PrismaPg(pool);
    globalThis.prisma = new PrismaClient({ adapter });
  }
  prismaInstance = globalThis.prisma;
}

export const db = prismaInstance;
