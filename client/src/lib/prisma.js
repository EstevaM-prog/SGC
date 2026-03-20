import { PrismaClient } from '@prisma/client'

// PrismaClient is meant for server-side use (Node.js/Bun).
// In a Vite React app, this SHOULD NOT be imported in the browser.
// It is intended for a future API route or Backend integration.

const prisma = new PrismaClient()

export default prisma
