import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from './utils/encryption.js';

const prisma = new PrismaClient();

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
