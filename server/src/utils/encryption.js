import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const SYMMETRIC_IV = Buffer.alloc(IV_LENGTH, 0); // Deterministic IV for searchable fields (e.g., Email)

// Secret should be 64 characters in hex (32 bytes)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '63e9c524a87123956dfa283948572b84938472948273948572b8493847294857';

/**
 * Encrypts data using AES-256-GCM.
 * @param {string} text Plain text to encrypt
 * @param {boolean} isDeterministic If true, uses a fixed IV (for Email lookups)
 * @returns {string} Encrypted string in format: iv:tag:content
 */
export function encrypt(text, isDeterministic = false) {
  if (!text) return text;
  
  const iv = isDeterministic ? SYMMETRIC_IV : crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${tag}:${encrypted}`;
}

/**
 * Decrypts data using AES-256-GCM.
 * @param {string} hash Encrypted string in format: iv:tag:content
 * @returns {string} Decrypted original text
 */
export function decrypt(hash) {
  if (!hash || typeof hash !== 'string' || !hash.includes(':')) return hash;
  
  try {
    const [ivHex, tagHex, contentHex] = hash.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const content = Buffer.from(contentHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    // If decryption fails, data might be stale or not encrypted
    return hash;
  }
}
