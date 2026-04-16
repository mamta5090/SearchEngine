import crypto from 'crypto';

const ALGORITHM  = 'aes-256-gcm';
const KEY_HEX    = process.env.ENCRYPTION_KEY; // must be 64 hex chars (32 bytes)

function getKey() {
  if (!KEY_HEX || KEY_HEX.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }
  return Buffer.from(KEY_HEX, 'hex');
}

/**
 * Encrypts plaintext using AES-256-GCM.
 * Returns a colon-separated string: iv:authTag:ciphertext (all hex-encoded).
 * This format is easy to swap for a key-value entry in Redis later.
 */
export function encrypt(plaintext) {
  const key    = getKey();
  const iv     = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted    += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a colon-separated AES-256-GCM ciphertext.
 */
export function decrypt(ciphertext) {
  const key              = getKey();
  const [ivHex, tagHex, encrypted] = ciphertext.split(':');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));

  let decrypted  = decipher.update(encrypted, 'hex', 'utf8');
  decrypted     += decipher.final('utf8');
  return decrypted;
}
