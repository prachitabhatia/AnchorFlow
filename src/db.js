const { PrismaClient } = require("@prisma/client");

// One shared client so every file talks to the same SQLite connection.
const prisma = new PrismaClient();

module.exports = prisma;
