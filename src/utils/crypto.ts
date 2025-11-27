import crypto from 'crypto';

const algorithm = 'aes-256-cbc';

// ⚠ Pastikan kunci panjangnya 32 byte untuk AES-256
// Kamu bisa ganti sendiri string di bawah ini.
const secretKey = crypto
  .createHash('sha256')
  .update(String(process.env.SECRET_KEY || 'TOKOKITA_SECRET_KEY'))
  .digest('base64')
  .substring(0, 32);

// IV (Initialization Vector) harus 16 byte
const iv = crypto
  .createHash('md5')
  .update(String(process.env.IV_KEY || 'TOKOKITA_IV_KEY'))
  .digest('hex')
  .substring(0, 16);

export function encrypt(text: string): string {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decrypt(encryptedText: string): string {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
