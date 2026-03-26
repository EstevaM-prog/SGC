import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from './utils/encryption.js';

// Neon DB closes idle connections after ~5 minutes.
// connection_limit=1 + pool_timeout prevent ERR_KIND_CLOSED errors.
const DATABASE_URL = process.env.DATABASE_URL?.includes('?')
  ? `${process.env.DATABASE_URL}&connection_limit=10&pool_timeout=20&connect_timeout=30`
  : `${process.env.DATABASE_URL}?connection_limit=10&pool_timeout=20&connect_timeout=30`;

const prisma = new PrismaClient({
  log: ['error'],
  datasources: {
    db: { url: DATABASE_URL }
  }
});

// Reconnect helper: if Neon drops the connection, gracefully reconnect
const withReconnect = async (fn) => {
  try {
    return await fn();
  } catch (err) {
    if (err.message?.includes('Closed') || err.code === 'P1001' || err.code === 'P1002') {
      console.warn('[DB] Conexão perdida com Neon DB. Reconectando...');
      await prisma.$disconnect();
      await prisma.$connect();
      return await fn();
    }
    throw err;
  }
};

// Warm up connection on startup
prisma.$connect().catch((e) => console.error('[DB] Falha ao conectar:', e));

// List of fields to be transparently encrypted/decrypted for LGPD/Security
const CONFIG = {
  user: {
    email: { isDeterministic: true } // Must be deterministic for @unique lookups/login
  },
  team: {
    inviteCode: { isDeterministic: true } // Searchable for team joining
  },
  chamado: {
    razao: { isDeterministic: false },
    cnpj: { isDeterministic: false }
  },
  shoppingTicket: {
    razao: { isDeterministic: false },
    cnpj: { isDeterministic: false }
  },
  freightTicket: {
    razao: { isDeterministic: false },
    cnpj: { isDeterministic: false }
  }
};

/**
 * Prisma Extension to automatically handle transparent database encryption.
 * It manages encryption before write and decryption after read.
 */
const xprisma = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const modelName = model.toLowerCase();
        const sensitiveConfig = CONFIG[modelName] || {};
        const sensitiveFields = Object.keys(sensitiveConfig);

        // 1. Encrypt data before creation or update
        if (['create', 'update', 'upsert', 'createMany', 'updateMany'].includes(operation)) {
           const processData = (data) => {
             if (!data) return;
             sensitiveFields.forEach(field => {
               if (data[field] && typeof data[field] === 'string' && !data[field].includes(':')) {
                 data[field] = encrypt(data[field], sensitiveConfig[field].isDeterministic);
               }
             });
           };

           if (args.data) {
             if (Array.isArray(args.data)) args.data.forEach(processData);
             else processData(args.data);
           }
        }

        // 2. Adjust WHERE clauses for lookup on encrypted fields
        // This is necessary for findUnique or findMany filters on sensitive fields.
        if (args.where) {
           sensitiveFields.forEach(field => {
             if (args.where[field] && typeof args.where[field] === 'string' && sensitiveConfig[field].isDeterministic) {
               // Exact match lookups only work with deterministic encryption
               args.where[field] = encrypt(args.where[field], true);
             }
           });
        }

        const result = await query(args);

        // 3. Decrypt data after read
        if (result && sensitiveFields.length > 0) {
           const processResult = (item) => {
             if (!item) return item;
             sensitiveFields.forEach(field => {
               if (item[field]) item[field] = decrypt(item[field]);
             });
             return item;
           };

           if (Array.isArray(result)) return result.map(processResult);
           if (result.data && Array.isArray(result.data)) {
             result.data = result.data.map(processResult);
             return result;
           }
           return processResult(result);
        }

        return result;
      }
    }
  }
});

export default xprisma;
